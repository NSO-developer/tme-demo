import ncs
import ncs.maapi as maapi
import ncs.maagic as maagic


def _get_username(ro_root, event):
    netconf_deployments = ro_root.nfv__nfv.cisco_nfvo__internal.\
                          cisco_nfvo__netconf_deployment

    if event.depname in netconf_deployments:
        return netconf_deployments[event.depname].username

    return None

def _get_vm_group(root, event):
    deployment_results = root.nfv__nfv.cisco_nfvo__internal.\
                         cisco_nfvo__netconf_deployment_result

    if event.depname in deployment_results:
        deployment_result = deployment_results[event.depname]

        if event.vm_group in deployment_result.vm_group:
            return deployment_result.vm_group[event.vm_group]

    return None

def _scale_out_init(event, th):
    root = maagic.get_root(th)
    vm_group = _get_vm_group(root, event)

    if vm_group:
        if vm_group.vms_scaling:
            vm_group.vms_scaling = vm_group.vms_scaling + 1
        else:
            vm_group.vms_scaling = 1

def _scale_out_deployed(event, th):
    root = maagic.get_root(th)
    vm_group = _get_vm_group(root, event)

    if vm_group:
        vm_group.vms_scaling = vm_group.vms_scaling - 1


class NetconfNotifSub(ncs.cdb.OperSubscriber):
    def init(self):
        self.register('/ncs:devices/ncs:device/ncs:netconf-notifications/'
                      'ncs:received-notifications')

    def pre_iterate(self):
        return []

    # determine if post_iterate() should run
    def should_post_iterate(self, state):
        return state != []

    def iterate(self, kp, op, oldv, newv, state):
        if op == ncs.MOP_CREATED:
            state.append(str(kp))
        return ncs.ITER_CONTINUE

    def post_iterate(self, state):
        context = "system"

        with maapi.single_read_trans("", context) as ro_th:
            ro_root = maagic.get_root(ro_th)
            for kp in state:
                notif = maagic.get_node(ro_th, kp)
                if not notif.data.escEvent:
                    continue
                event = notif.data.escEvent
                username = _get_username(ro_root, event)
                vnfm_name = ncs.maagic.cd(notif, "../../../ncs:name")
                if (username and
                        notif.subscription == "cisco-etsi-nfvo-%s" % vnfm_name):
                    # Switch user context
                    with maapi.single_write_trans(username, context) as th:
                        self._handle_notif(notif, th)
                        th.apply()


    def _handle_notif(self, notif, th):
        event = notif.data.escEvent
        event_type = event.event.type
        self.log.debug("Received event type {}".format(event_type))

        if event_type == "VM_SCALE_OUT_INIT":
            self.log.info("Scale out init")
            _scale_out_init(event, th)
        elif event_type == "VM_SCALE_OUT_DEPLOYED":
            self.log.info("Scale out VM deployed")
            _scale_out_deployed(event, th)


class Main(ncs.application.Application):
    def setup(self):
        self.log.info('NetconfNotifSub Main RUNNING')
        self.sub = NetconfNotifSub(app=self)
        self.sub.start()

    def teardown(self):
        self.sub.stop()
        self.log.info('NetconfNotifSub Main FINISHED')
