# -*- mode: python; python-indent: 4 -*-
import ncs
from tme_demo.ip_address_helper import IpAddressHelper

def get_ns_info_name(tenant_name, network_service_name):
    return  f'{tenant_name}-{network_service_name}'

class NfvoHelper():
    def __init__(self, log, tctx, root, tenant, network_service):

        self.log = log
        self.username = tctx.username

        self.root = root
        self.tenant = tenant
        self.network_service = network_service
        self.ns_info_name = get_ns_info_name(tenant.name, network_service.name)
        self.ip_address_helper = IpAddressHelper(log, tctx.username, root,
                                                 tenant, self.ns_info_name)

        if network_service.use_default_topology_connections:
            if network_service.nsd in root.tme_demo.\
                    default_ns_topology_connections:
                self.topology_connections = root.tme_demo.\
                    default_ns_topology_connections[network_service.nsd].\
                    sap_topology_connection
            else:
                raise Exception('No default connections defined for NSD: ',
                                network_service.nsd)
        else:
            self.topology_connections = network_service.sap_topology_connection

    def get_nsd(self):
        return self.root.nfv__nfv.nsd[self.network_service.nsd]

    def get_nsd_flavour(self):
        return self.get_nsd().df[self.network_service.flavour]

    def allocate_ip_addresses(self):
        return self.ip_address_helper.allocate_all(self.get_nsd_flavour(),
                                                   self.topology_connections)

    def configure_network_service(self):
        template_vars = ncs.template.Variables()
        template_vars.add('NS_INFO_NAME', self.ns_info_name)

        template = ncs.template.Template(self.network_service)
        template.apply('nsr', template_vars)
        template.apply('nsr-kicker', template_vars)

        self.update_ns_info()

        with ncs.maapi.single_read_trans(self.username, 'python',
                                         db=ncs.OPERATIONAL) as th:
            oroot = ncs.maagic.get_root(th)
            ns_info_plans = oroot.nfv__nfv.ns_info_plan

            if self.ns_info_name in ns_info_plans:
                plan = ns_info_plans[self.ns_info_name].plan

                if plan.failed:
                    raise Exception(self.ns_info_name, ' deployment failed')

                plan_states = plan.component['self', 'self'].state
                ready_status = str(plan_states['ready'].status)
                if ready_status == 'reached':
                    return True

        return False

    def update_ns_info(self):
        ns_info = self.root.nfv__nfv.ns_info[self.ns_info_name]
        self.add_sap_infos_to_ns_info(ns_info)
        self.add_virtual_links_to_ns_info(ns_info)
        self.add_vnf_cps_to_ns_info(ns_info)

    def add_sap_infos_to_ns_info(self, ns_info):
        for sapd in self.get_nsd().sapd:
            if sapd.virtual_link_desc:
                sap_info = ns_info.sap_info.create(sapd.id)
                sap_info.network_name = sapd.virtual_link_desc

    def add_virtual_links_to_ns_info(self, ns_info):
        for virtual_link in self.ip_address_helper.\
                allocation_results['virtual-links']:
            vl_info = ns_info.virtual_link_info.create(virtual_link['vld'])
            vl_info.subnet.network = virtual_link['ip-network']
            vl_info.subnet.no_gateway.create()

    def add_vnf_cps_to_ns_info(self, ns_info):
        for vnf_cp in self.ip_address_helper.allocation_results['vnf-cps']:
            vnf_info = ns_info.vnf_info[vnf_cp['vnf-profile-id']]
            #Assume one vdu
            vdu = next(vdu for vdu in vnf_info.vdu)
            internal_cpd_id = self.external_to_internal_cpd(
                vnf_cp['external-cpd-id'], vnf_info.vnfd, vdu.id)
            internal_cp = vdu.internal_connection_point.create(internal_cpd_id)
            cp_address = internal_cp.connection_point_address.create()
            netconf_parameters = cp_address.netconf_parameters
            netconf_parameters.address = vnf_cp['ip-addresses'][0]
            netconf_parameters.ip_address_range.create(
                vnf_cp['ip-addresses'][0],
                vnf_cp['ip-addresses'][len(vnf_cp['ip-addresses']) - 1])

            allowed_address_pair = internal_cp.allowed_address_pair.\
                                   create('0.0.0.0')
            allowed_address_pair.netmask = '0.0.0.0'

    def external_to_internal_cpd(self, cpd_id, vnfd_id, vdu_id):
        vnfd = self.root.nfv__nfv.vnfd[vnfd_id]
        ext_cpd = vnfd.ext_cpd[cpd_id]
        if ext_cpd.int_cpd.vdu_id == vdu_id:
            return ext_cpd.int_cpd.cpd
        if ext_cpd.int_virtual_link_desc:
            for int_cpd in vnfd.vdu[vdu_id].int_cpd:
                if int_cpd.int_virtual_link_desc == ext_cpd.\
                                                    int_virtual_link_desc:
                    return int_cpd.id
        raise ReferenceError(
            f'No matching internal connection-point for '
            f'external connection-point {cpd_id} in vnfd {vnfd_id}')

    def configure_topology_connections(self):
        ns_info = self.root.nfv__nfv.ns_info[self.ns_info_name]
        flavour = self.get_nsd_flavour()

        for connection in self.topology_connections:
            if connection.device:
                sapd = self.get_nsd().sapd[connection.sapd]

                managed_vdus = (
                    (vnf_profile, vdu, cpd.constituent_cpd_id)
                    for vnf_profile in flavour.vnf_profile
                    for vl_connectivity in vnf_profile.virtual_link_connectivity
                    if flavour.virtual_link_profile[vl_connectivity.\
                       virtual_link_profile_id].virtual_link_desc_id == \
                       sapd.virtual_link_desc
                    for cpd in vl_connectivity.constituent_cpd_id
                    for vdu in ns_info.\
                        vnf_info[cpd.constituent_base_element_id].vdu
                    if vdu.managed)

                for (vnf_profile, vdu, ext_cpd_id) in managed_vdus:
                    device = self.get_vm_device(vnf_profile.id, vdu.id)

                    if device:
                        self.apply_topology_template(
                            connection, device, vnf_profile, vdu, ext_cpd_id)
                        break

    def apply_topology_template(self, connection, device, vnf_profile,
                                vdu, ext_cpd_id):
        template_vars = ncs.template.Variables()
        template_vars.add('NS_INFO_NAME', self.ns_info_name)

        vnfd = self.root.nfv__nfv.vnfd[vnf_profile.vnfd_id]
        pnf_ip_address = self.ip_address_helper.\
            allocation_results['topology-connections'][connection.sapd]
        interface_id = vnfd.vdu[vdu.id].int_cpd[self.external_to_internal_cpd(
            ext_cpd_id, vnfd.id, vdu.id)].interface_id

        vnf_ip_addresses = next((
            vnf_cp['ip-addresses']
            for vnf_cp in self.ip_address_helper.allocation_results['vnf-cps']
            if (vnf_cp['vnf-profile-id'] == vnf_profile.id and
                vnf_cp['external-cpd-id'] == ext_cpd_id)), None)

        if vnf_ip_addresses:
            template_vars.add('PNF_IP_ADDRESS', pnf_ip_address)
            template_vars.add('VNF_IP_ADDRESS', vnf_ip_addresses[0])
            template_vars.add('DEVICE', device)
            template_vars.add('INTERFACE', f'GigabitEthernet{interface_id}')

            template = ncs.template.Template(connection)
            template.apply('topology-connection', template_vars)

    def get_vm_device(self, vnf_profile_id, vdu_id):
        ndr_list = self.root.nfv__nfv.internal.netconf_deployment_result
        ndr_key = (f'{self.network_service.vnfm}-ns-info-'
                   f'{self.tenant.name}-{self.network_service.name}')
        vm_group_key = f'{vnf_profile_id}-{vdu_id}'

        if ndr_key in ndr_list and vm_group_key in ndr_list[ndr_key].vm_group:
            for vm_device in ndr_list[ndr_key].vm_group[vm_group_key].vm_device:
                if vm_device.device_name in self.root.devices.device:
                    return vm_device.device_name
        return None
