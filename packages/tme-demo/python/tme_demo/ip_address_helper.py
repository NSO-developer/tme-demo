# -*- mode: python; python-indent: 4 -*-
import ncs
from resource_manager import ipaddress_allocator

def get_ip_address(addr):
    """Return the Ip part of a 'Ip/Net' string."""
    parts = addr.split('/')
    return parts[0]

def get_ip_prefix(addr):
    """Return the Net part of a 'Ip/Net' string."""
    parts = addr.split('/')
    return parts[1]

def safe_key(key):
    return key.replace(' ', '-')


class IpAddressHelper():
    def __init__(self, log, username, root, tenant, ns_info_name):
        self.stitching_ready = True
        self.ready = True

        self.allocation_results = {
            'virtual-links': [],
            'vnf-cps': [],
            'topology-connections': {}
        }

        self.log = log
        self.username = username
        self.ns_info_name = ns_info_name

        self.root = root
        self.tenant = tenant

    def allocate_all(self, flavour, topology_connections):
        self.create_stitch_resource_pools(flavour)
        self.stitching_ready = self.ready

        if self.stitching_ready:
            self.allocate_sap_topology_connections(flavour, topology_connections)
            self.allocate_virtual_links(flavour)

        return self.ready

    def get_vld_pool_name(self, vld_id):
        return '%s-%s' % (self.ns_info_name, vld_id)

    def create_stitch_resource_pools(self, flavour):
        for vlp in flavour.virtual_link_profile:
            vld_id = vlp.virtual_link_desc_id
            pool_name = self.get_vld_pool_name(vld_id)

            if vld_id in self.root.ralloc__resource_pools.\
                         ipalloc__ip_address_pool:
                ip_network = self.allocate_ip_network(vld_id, pool_name, 28)
            else:
                ip_network = self.allocate_ip_network('stitch', pool_name, 28)
                if ip_network:
                    self.allocation_results['virtual-links'].append({
                        'vld': vld_id,
                        'ip-network': ip_network
                    })

            if ip_network:
                resource_pool = self.root.ralloc__resource_pools.\
                                ipalloc__ip_address_pool.create(
                                    safe_key(pool_name))
                resource_pool.subnet.create(get_ip_address(ip_network),
                                            get_ip_prefix(ip_network))

    def allocate_sap_topology_connections(self, flavour, connections):
        sapds = ncs.maagic.cd(flavour, '../sapd')

        for sapd in sapds:
            if sapd.id in connections and connections[sapd.id].device:

                ip_address = self.allocate_ip_network(
                    self.get_vld_pool_name(sapd.virtual_link_desc),
                    'topology-connection-%s' % sapd.id, 32)

                if ip_address:
                    self.allocation_results['topology-connections'][
                        sapd.id] = get_ip_address(ip_address)

    def allocate_virtual_links(self, flavour):
        for vnf_profile in flavour.vnf_profile:
            max_vms = vnf_profile.max_number_of_instances
            for vl_connectivity in vnf_profile.virtual_link_connectivity:
                vld_id = flavour.virtual_link_profile[vl_connectivity.\
                    virtual_link_profile_id].virtual_link_desc_id

                for cpd in vl_connectivity.constituent_cpd_id:
                    self.allocate_vnf_cp(cpd.constituent_base_element_id,
                                         cpd.constituent_cpd_id,
                                         self.get_vld_pool_name(vld_id),
                                         max_vms)

    def allocate_vnf_cp(self, vnf_profile_id, external_cpd_id, pool_name,
                        number_of_addresses):
        ip_addresses = []
        for i in range(number_of_addresses):
            request_name = '%s-%s-%d' % (vnf_profile_id, external_cpd_id, i)
            ip_network = self.allocate_ip_network(pool_name, request_name, 32)
            if ip_network:
                ip_addresses.append(get_ip_address(ip_network))

        if len(ip_addresses) == number_of_addresses:
            self.allocation_results['vnf-cps'].append({
                'vnf-profile-id': vnf_profile_id,
                'external-cpd-id': external_cpd_id,
                'ip-addresses': ip_addresses
            })

    def allocate_ip_network(self, pool_name, request_name, subnet):
        allocation_name = safe_key('%s-%s' % (self.ns_info_name, request_name))
        service_xpath = ("/tme-demo:tme-demo/tenant[name='%s']" %
                         self.tenant.name)

        ipaddress_allocator.net_request(self.tenant, service_xpath,
                                        self.username, safe_key(pool_name),
                                        allocation_name, subnet)

        ip_network = ipaddress_allocator.net_read(self.username, self.root,
                                                  safe_key(pool_name),
                                                  allocation_name)
        if not ip_network:
            self.log.info('%s ip network allocation not ready' %
                          allocation_name)
            self.ready = False
            return False

        return ip_network
