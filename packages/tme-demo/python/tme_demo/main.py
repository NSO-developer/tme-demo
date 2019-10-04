# -*- mode: python; python-indent: 4 -*-
import socket
import ncs
from ncs.application import Service
from ncs.application import PlanComponent
from ncs.dp import Action
import _ncs
from _ncs import maapi
from tme_demo.nfvo_helper import NfvoHelper, get_ns_info_id


# ------------------------
# SERVICE CALLBACK EXAMPLE
# ------------------------
class ServiceCallbacks(Service):

    # The create() callback is invoked inside NCS FASTMAP and
    # must always exist.
    @Service.create
    def cb_create(self, tctx, root, service, proplist):
        self.log.info('Service create(service=', service._path, ')')

        self_plan = PlanComponent(service, 'self', 'ncs:self')
        self_plan.append_state('ncs:init')
        self_plan.append_state('ncs:ready')
        self_plan.set_reached('ncs:init')

        ns_ready_count = sum(1 for ns in service.nfvo.network_service
                             if self.configure_network_service(tctx, root,
                                                               service, ns))

        if service.l3vpn.exists():
            self.log.info('Configuring L3VPN')

            l3vpn_plan = PlanComponent(service, 'l3vpn', 'tme-demo:l3vpn')
            l3vpn_plan.append_state('ncs:init')
            l3vpn_plan.append_state('ncs:ready')
            l3vpn_plan.set_reached('ncs:init')
            template = ncs.template.Template(service)
            template.apply('l3vpn')
            l3vpn_plan.set_reached('ncs:ready')

        if service.data_centre.exists():
            self.log.info('Configuring data-centre connectivity')
            data_centre_plan = PlanComponent(service, 'data-centre',
                                             'tme-demo:data-centre')
            data_centre_plan.append_state('ncs:init')
            data_centre_plan.append_state('ncs:ready')
            data_centre_plan.set_reached('ncs:init')
            template = ncs.template.Template(service)
            template.apply('data-centre')
            data_centre_plan.set_reached('ncs:ready')

        if len(service.nfvo.network_service) == ns_ready_count:
            self_plan.set_reached('ncs:ready')
            self.log.info('Service ready')

    @Service.pre_modification
    def cb_pre_modification(self, tctx, op, kp, root, proplist):
        self.log.info('Service premod(service=', kp, ')')
        # Create tenant if required
        for tenant in root.tme_demo.tenant:
            for ns in tenant.nfvo.network_service:
                template = ncs.template.Template(ns)
                template.apply('esc-tenant')

    @Service.post_modification
    def cb_post_modification(self, tctx, op, kp, root, proplist):
        self.log.info('Service postmod(service=', kp, ')')
        if op not in (ncs.dp.NCS_SERVICE_UPDATE, ncs.dp.NCS_SERVICE_DELETE):
            return

        # Clean up icons
        icon_list = root.webui__webui.data_stores.static_map.icon
        for icon in icon_list:
            if icon.item_type == 'device':
                if icon.device not in root.devices.device:
                    self.log.info('Deleting device icon %s' % icon.name)
                    del icon_list[icon.name]

            if icon.item_type == 'ns-info':
                found = False
                for tenant in root.tme_demo.tenant:
                    for network_service in tenant.nfvo.network_service:
                        if icon.ns_info == get_ns_info_id(tenant.name,
                                                          network_service.name):
                            found = True

                if not found:
                    self.log.info('Deleting ns-info icon %s' % icon.name)
                    del icon_list[icon.name]

    def configure_network_service(self, tctx, root, service, network_service):
        self.log.info('Configuring NFVO: %s' % network_service.name)

        nfvo_helper = NfvoHelper(self.log, tctx, root, service, network_service)
        topology_conn_count = sum(1 for cp in nfvo_helper.cp_list if
                                  cp.topology_connection.device is not None)

        ns_plan = PlanComponent(service, network_service.name,
                                'tme-demo:network-service')
        ns_plan.append_state('ncs:init')
        ns_plan.append_state('tme-demo:ip-addresses-allocated')
        ns_plan.append_state('tme-demo:vnfs-instantiated')
        if topology_conn_count > 0:
            ns_plan.append_state('tme-demo:topology-created')
        ns_plan.append_state('ncs:ready')
        ns_plan.set_reached('ncs:init')

        if nfvo_helper.allocate_ip_addresses():
            ns_plan.set_reached('tme-demo:ip-addresses-allocated')
        else:
            self.log.info('IP addresses not ready')
            return False

        if nfvo_helper.configure_network_service():
            ns_plan.set_reached('tme-demo:vnfs-instantiated')
        else:
            self.log.info('ns-info not ready')
            return False

        if topology_conn_count > 0:
            nfvo_helper.configure_topology_connections()
            ns_plan.set_reached('tme-demo:topology-created')

        ns_plan.set_reached('ncs:ready')
        return True


class GetDeviceConfiguration(Action):
    @Action.action
    def cb_action(self, uinfo, name, kp, input, output):
        self.log.info('action name: ', name)

        with ncs.maapi.single_write_trans(uinfo.username, 'python') as trans:
            device = ncs.maagic.get_node(trans, kp)
            self.log.info(device.device_type)
            if (device.device_type.ne_type == 'cli' and
                    (device.device_type.cli.ned_id.startswith('cisco-iosxr') or
                     device.device_type.cli.ned_id.startswith('cisco-staros'))
                    and (input.format == 'cli' or not input.format)):
                output.format = 'cli'
                format_flags = maapi.CONFIG_C
            elif (device.device_type.ne_type == 'cli' and not input.format or
                  input.format == 'cli'):
                output.format = 'cli'
                format_flags = maapi.CONFIG_C_IOS
            elif (device.device_type.ne_type == 'netconf' and
                  device.device_type.netconf.ned_id.startswith('juniper-junos')
                  and not input.format or
                  input.format == 'curly-braces'):
                output.format = 'curly-braces'
                format_flags = maapi.CONFIG_J
            elif input.format == 'json':
                output.format = 'json'
                format_flags = maapi.CONFIG_JSON
            else:
                output.format = 'xml'
                format_flags = maapi.CONFIG_XML_PRETTY

            if input.service_meta_data:
                format_flags |= maapi.CONFIG_WITH_SERVICE_META

            config_id = maapi.save_config(trans.maapi.msock, trans.th,
                                          format_flags, str(kp) + '/config')

            sock = socket.socket()
            # pylint: disable=no-member
            _ncs.stream_connect(sock, config_id, 0,
                                '127.0.0.1', _ncs.NCS_PORT)
            config_bytes = b''
            while 1:
                data = sock.recv(1024)
                if not data:
                    break
                config_bytes += data

            sock.close()

        output.config = config_bytes.decode('utf-8')


# ---------------------------------------------
# COMPONENT THREAD THAT WILL BE STARTED BY NCS.
# ---------------------------------------------
class Main(ncs.application.Application):
    def setup(self):
        # The application class sets up logging for us. It is accessible
        # through 'self.log' and is a ncs.log.Log instance.
        self.log.info('Main RUNNING')

        # Service callbacks require a registration for a 'service point',
        # as specified in the corresponding data model.
        self.register_service('tme-demo-servicepoint', ServiceCallbacks)

        # When using actions, this is how we register them:
        #
        self.register_action('get-device-configuration', GetDeviceConfiguration)

    def teardown(self):
        # When the application is finished (which would happen if NCS went
        # down, packages were reloaded or some error occurred) this teardown
        # method will be called.

        self.log.info('Main FINISHED')
