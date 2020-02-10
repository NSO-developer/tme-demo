# -*- mode: python; python-indent: 4 -*-
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

class IpAddressHelper(object):
    def __init__(self, log, username, root, tenant, ns_info_id):
        self.stitching_ready = True,
        self.ready = True

        self.allocation_results = {
            'virtual-links': [],
            'vnf-cps': [],
            'topology-cps': {}
        }

        self.log = log
        self.username = username
        self.ns_info_id = ns_info_id

        self.root = root
        self.tenant = tenant

    def allocate_all(self, flavour, cp_list):
        self.create_stitch_resource_pools(flavour)
        self.stitching_ready = self.ready

        self.allocate_topology_cps(cp_list)
        self.allocate_sapds(flavour, cp_list)

        if self.stitching_ready:
            self.allocate_virtual_links(flavour)

        return self.ready

    def create_stitch_resource_pools(self, flavour):
        for vlp in flavour.virtual_link_profile:
            vld = vlp.virtual_link_descriptor
            ip_network = self.allocate_ip_network('stitch', vld, 28)

            if ip_network:
                self.allocation_results['virtual-links'].append({
                    'vld': vld,
                    'ip-network': ip_network
                })

                allocation_name = '%s-%s' % (self.ns_info_id, vld)
                resource_pool = self.root.ralloc__resource_pools.\
                    ipalloc__ip_address_pool.create(safe_key(allocation_name))
                resource_pool.subnet.create(get_ip_address(ip_network),
                                            get_ip_prefix(ip_network))

    def allocate_topology_cps(self, cp_list):
        for cp in cp_list:
            pool_name = cp.network
            request_name = 'topology-cp-%s' % (cp.sapd)
            ip_address = self.allocate_ip_network(pool_name, request_name, 30)

            if ip_address:
                self.allocation_results['topology-cps'][cp.sapd] = ip_address

    def allocate_sapds(self, flavour, cp_list):
        for vnf_profile in flavour.vnf_profile:
            max_vms = vnf_profile.max_number_of_instances
            for sapd_conn in vnf_profile.sapd_connectivity:
                self.allocate_vnf_cp(vnf_profile.id, sapd_conn.cp,
                                     cp_list[sapd_conn.sapd].network,
                                     max_vms)

    def allocate_virtual_links(self, flavour):
        for vnf_profile in flavour.vnf_profile:
            max_vms = vnf_profile.max_number_of_instances
            for vl_connectivity in vnf_profile.virtual_link_connectivity:
                vld_id = vl_connectivity.virtual_link_profile
                self.allocate_vnf_cp(vnf_profile.id, vl_connectivity.cp,
                                     '%s-%s' % (self.ns_info_id, vld_id),
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
        allocation_name = safe_key('%s-%s' % (self.ns_info_id, request_name))
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
