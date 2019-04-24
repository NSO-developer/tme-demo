# -*- mode: python; python-indent: 4 -*-
import ncs
from tme_demo.ip_address_helper import IpAddressHelper

def get_ns_info_id(tenant_name, network_service_name):
    return '%s-%s' % (tenant_name, network_service_name)

class NfvoHelper(object):
    def __init__(self, log, tctx, root, tenant, network_service):

        self.log = log
        self.username = tctx.username

        self.root = root
        self.tenant = tenant
        self.network_service = network_service
        self.ip_address_helper = IpAddressHelper(log, tctx.username, root,
                                                 tenant, self.get_ns_info_id())

        if network_service.use_default_connections:
            if network_service.nsd in root.tme_demo.default_ns_connections:
                self.cp_list = root.tme_demo.default_ns_connections[\
                    network_service.nsd].connection_points
            else:
                raise Exception('No default connections defined ' +
                                'for NSD: %s' % network_service.nsd)
        else:
            self.cp_list = network_service.connection_points

    def get_ns_info_id(self):
        return get_ns_info_id(self.tenant.name, self.network_service.name)

    def get_nsd_flavour(self):
        return self.root.nfvo_rel2__nfvo.nsd[self.network_service.nsd].\
               deployment_flavor[self.network_service.flavour]

    def allocate_ip_addresses(self):
        return self.ip_address_helper.allocate_all(self.get_nsd_flavour(),
                                                   self.cp_list)

    def configure_network_service(self):
        ns_info_id = self.get_ns_info_id()
        template_vars = ncs.template.Variables()
        template_vars.add('NS_INFO_ID', ns_info_id)

        template = ncs.template.Template(self.network_service)
        template.apply('nsr', template_vars)
        template.apply('nsr-kicker', template_vars)

        self.update_ns_info()

        with ncs.maapi.single_read_trans(self.username, 'python',
                                         db=ncs.OPERATIONAL) as th:
            oroot = ncs.maagic.get_root(th)
            ns_infos = oroot.nfvo_rel2__nfvo.ns_info.esc.ns_info

            if ns_info_id in ns_infos:
                plan = ns_infos[ns_info_id].plan

                if plan.failed:
                    raise Exception('%s deployment failed' % ns_info_id)

                ready_status = str(plan.component['self'].state['ready'].status)
                if ready_status == 'reached':
                    return True

        return False

    def update_ns_info(self):
        ns_info = self.root.nfvo_rel2__nfvo.ns_info.\
                  nfvo_rel2_esc__esc.ns_info[self.get_ns_info_id()]
        self.add_sap_infos_to_ns_info(ns_info)
        self.add_virtual_links_to_ns_info(ns_info)
        self.add_cps_to_ns_info(ns_info)

    def add_sap_infos_to_ns_info(self, ns_info):
        for cp in self.cp_list:
            sap_info = ns_info.sap_info.create(cp.sapd)
            sap_info.network_name = cp.network

    def add_virtual_links_to_ns_info(self, ns_info):
        for vl in self.ip_address_helper.allocation_results['virtual-links']:
            vl_info = ns_info.virtual_link_info.create(vl['vld'])
            vl_info.subnet.network = vl['ip-network']
            vl_info.subnet.no_gateway.create()

    def add_cps_to_ns_info(self, ns_info):
        for cp in self.ip_address_helper.allocation_results['vnf-cps']:
            vnf_info = ns_info.vnf_info[cp['vnf-profile-id']]
            #Assume one vdu
            vdu = vnf_info.vdu.__iter__().next()
            internal_cpd_id = self.external_to_internal_cpd(
                cp['external-cpd-id'], vnf_info.vnfd, vdu.id)
            internal_cp = vdu.internal_connection_point.create(internal_cpd_id)
            cp_address = internal_cp.connection_point_address.create()
            cp_address.address = cp['ip-addresses'][0]
            cp_address.ip_address_range.create(
                cp['ip-addresses'][0],
                cp['ip-addresses'][len(cp['ip-addresses']) - 1])

            allowed_address_pair = internal_cp.allowed_address_pair.\
                                   create('0.0.0.0')
            allowed_address_pair.netmask = '0.0.0.0'

    def external_to_internal_cpd(self, cpd_id, vnfd_id, vdu_id):
        for internal_cpd in self.root.nfvo_rel2__nfvo.vnfd[vnfd_id].\
                vdu[vdu_id].internal_connection_point_descriptor:
            if internal_cpd.external_connection_point_descriptor == cpd_id:
                return internal_cpd.id
        raise ReferenceError(
            'No matching internal connection-point for ' +
            'external connection-point %s in vnfd %s' % (cpd_id, vnfd_id))

    def configure_topology_connections(self):
        template_vars = ncs.template.Variables()
        template_vars.add('NS_INFO_ID', self.get_ns_info_id())
        for cp in self.cp_list:
            if cp.topology_connection.device is not None:
                template_vars.add('IP_ADDRESS', self.ip_address_helper.\
                                  allocation_results['topology-cps'][cp.sapd])

                for icp in self.follow_sapd(cp.sapd):
                    device = self.get_vm_device(icp['vnf-profile-id'],
                                                icp['vdu-id'])
                    if device:
                        template_vars.add('DEVICE', device)
                        template_vars.add('INTERFACE', 'GigabitEthernet%d' %
                                          icp['interface-id'])
                        template = ncs.template.Template(cp.topology_connection)
                        template.apply('topology-connection', template_vars)

    def follow_sapd(self, sapd):
        cp_list = []
        for vnf_profile in self.get_nsd_flavour().vnf_profile:
            vnfd = self.root.nfvo.vnfd[vnf_profile.vnfd]

            for sapd_connectivity in vnf_profile.sapd_connectivity:
                if sapd_connectivity.sapd == sapd:
                    #Assume one vdu
                    vdu_id = vnfd.deployment_flavor[vnf_profile.flavor].\
                             vdu_profile.__iter__().next().vdu

                    for icpd in vnfd.vdu[vdu_id].\
                                internal_connection_point_descriptor:
                        if icpd.external_connection_point_descriptor ==\
                                sapd_connectivity.cp:
                            cp_list.append({
                                'vnf-profile-id': vnf_profile.id,
                                'vdu-id': vdu_id,
                                'interface-id': icpd.interface_id
                            })
        return cp_list

    def get_vm_device(self, vnf_info_id, vdu_id):
        vdr_list = self.root.nfvo_rel2__nfvo.vnf_info.\
                   nfvo_rel2_esc__esc.vnf_deployment_result
        vdr_key = (self.tenant.name, self.network_service.name,
                   self.network_service.vnfm)
        vdu_key = (vnf_info_id, vdu_id)

        if vdr_key in vdr_list and vdu_key in vdr_list[vdr_key].vdu:
            for vm_device in vdr_list[vdr_key].vdu[vdu_key].vm_device:
                if vm_device.device_name in self.root.devices.device:
                    return vm_device.device_name
        return None
