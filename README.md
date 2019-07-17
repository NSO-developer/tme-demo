# Demo overview
The purpose of this demo is to showcase NSO's ability to orchestrate
multi-vendor cross-domain services for multiple tenants. NSO provisions both
physical and virtual devices, leveraging ESC (Cisco's VNFM) to create service
chains and manage the life-cycle of the VNFs. This demo uses a custom UI to
visualise the network topology to help illustrate use cases such as device
migration and service repair.

## The end-to-end service
The demo uses a top-level hybrid service called tenant. Each tenant can have L3
VPN endpoints and NFVO service chains. These are configured using the `l3vpn`
package (from the `mpls-vpn` standard example) and *NFVO Core Function Pack*
respectively.

Endpoints are added to the VPN by choosing a CE device. NSO will automatically
configure both the CE and PE devices. The configuration includes:
- The customer facing interface on CE.
- The VRF on the PE.
- VLAN, IP address and traffic shaping on the CE/PE interfaces.
- BGP as the CE/PE routing protocol.
- QoS configuration based on the policies and classes defined in NSO.

The following device types are supported:
- Cisco IOS
- Cisco IOS-XR
- Juniper Junos
- Nokia ALU-SR

For more information refer to the `README` file in the `mpls-vpn` example,
located in `<nso-install-dir>/examples.ncs/service-provider/mpls-vpn`.

Service chains are instantiated according to their Network Service Descriptors.
For more information refer to the *NFVO* documentation.

Network services will automatically be added to the topology according to their
connection points. Where service chains contain routers which have been added
to the topology, these can then be used in the VPN.

# Demo UI
The demo UI displays the devices in NSO's `device-list` in a graphical
topology, using the topology data from the `mpls-vpn` example that comes with
NSO. On the left, a sidebar uses an accordion view to display the tenants. The
tenants can be expanded to show their endpoints and network services.

## Displaying the UI
From the NSO Web UI, the demo UI can be displayed by clicking the *TME Demo*
tile in the *Application bub*, or using the *TME Demo* button on the shortcut
bar at the bottom of the browser window.

## Making changes
All changes made in the demo UI have to be explicitly committed. This can be
done using the standard NSO *Commit Manager*. The shortcut bar at the bottom of
the browser window can be used to navigate between the *Commit Manager* and
*TME Demo* UI.

There are also *Commit* and *Revert* buttons in the top right of header bar in
the *TME Demo* UI. These buttons will instantly commit or revert changes with
no confirmation. The *Commit* button is useful when wanting to quickly commit
changes without showing the dry-run output.

## Topology
The topology is split in to different domains and each device and service chain
belong to a domain. The default domains are:

- **Data Center:** This is where centralized VNFs can be placed (the hosted
  corporate service network service for example).
- **Transport:** This has the core and PE devices (the core devices are not
  configured as part of the demo). Service chains can also be placed here, in
  the case where they are distributed towards the edge of the network (vPE for
  example).
- **Access:** This is where access and aggregation devices would appear, there
  are no icons here by default.
- **Customer:** This has the CE / branch devices.

### Devices
Devices are shown on the topology with blue router icons. Unreachable devices
have a grey router icon. Device reachability and platform info is displayed in
the device tooltip. The device types are as follows:

- **Cisco IOS:** All CEs
- **Cisco IOS-XR:** All DCIs, pe0 and pe1
- **Juniper Junos:** pe2
- **Nokia ALU-SR:** pe3

### Service chains
By default, service chains are displayed on the topology collapsed in to a
single icon. Clicking the icon will expand the network service to show the VNFs
and their connections. The state of each VNF is indicated by a colour overlay:

- **Grey:** Instantiating / deploying
- **Yellow:** Booting / starting
- **Red:** Error
- **Full colour:** Ready

### Editing the topology
The topology can be edited directly from the UI by selecting the *Edit
Topology* toggle in the bottom left corner of the topology window. In edit
mode, all the icons can be moved by dragging them.

Connections can be created by first clicking a device icon, and then dragging
the `+` button that appears to another device. Connections can be edited by
first clicking the connection and then dragging an endpoint to another device.
While dragging an endpoint for a new or existing connection, as the endpoint is
hovered over a device icon, a green hue will appear to indicate the connection
can be moved/created there.

Connections can be deleted by first clicking the connection and then pressing
the red `x` button in the centre of the connection.

**Note:** Only connections between devices can be edited. Connections to or
from network services can not be changed (and will appear grey when selected).

Changes to the topology need to be explicitly committed. To do this, the
*Commit* button on the top header bar can be used to commit instantly without
confirmation. And the *Revert* button can be used to undo any changes.

## Sidebar
The sidebar displays the list of tenants. Each tenant has VPN endpoints and
network services. These can be seen by clicking a tenant name.  Each VPN
endpoint and network service can also be expanded by clicking on it. From the
sidebar, tenants, endpoints and network services can be created and deleted
using the `+` and `x` buttons respectively. The values displayed in the sidebar
cannot be edited directly, instead the `...` buttons provide shortcuts to the
NSO *Configuration Editor* to make changes.

### Endpoints
VPN endpoints are created by dragging a CE device from the topology window to a
tenant in the sidebar. The endpoint will be created under that tenant.

**Note:** When entering the endpoint details in the *Configuration Editor*, the
`ip-network` must be unique. So if more than one endpoint is created, ensure
the default value for the `ip-network` is changed.

Selecting a tenant in the sidebar will highlight the devices in the VPN on
the topology with a blue hue.

### Network Services
Network services are created by dragging the `+` button next to the tenant's
*Network Services* header in the sidebar on to the topology window. The
position the button is dropped indicates where the service chain icon will be
created.

The service chain will be created according to the Network Service Descriptor
(NSD) chosen. Example NSDs included with the demo are virtual PE (vPE) and
hosted corporate service. When choosing the vPE, it will be automatically
connected to a CE device (*ce7* by default). That CE can then be added to the
VPN as usual, and the PE VNF will be configured. When choosing the hosted
corporate service, this will be connected to the DCI devices. The default
connections can be changed by setting alternative connections in the
`connection-points` list.

Network services can be deleted by pressing the `x` button next to the network
service in the sidebar.

# Getting started
By default, the demo uses an entirely simulated environment. The demo supports
using a real ESC device when the VIM is OpenStack.

## Pre-requites
* NSO 5.1
* Java 8
* Python 2.7
* Node.js NPM 6.9
* Apache Ant
* GNU Make

**Important:** If running the demo on macOS with OpenSSH version 7.8 or newer,
ensure that the NSO and NETSIM RSA keys have been re-generated in PEM format.
See this post for more information:

https://community.cisco.com/t5/nso-developer-hub-discussions/netsim-getting-quot-no-supported-host-key-algorithms-quot-when/td-p/3843412

## Dependencies
The demo is dependent on several packages. For the NED dependencies, many of
these are automatically copied from the examples provided with the NSO
installation. However the remaining packages must be obtained manually and
copied to the packages directory:

Automatic dependencies (copied from `<nso-install-dir>/packages/ned`):
- cisco-ios-cli-3.8
- cisco-iosxr-cli-3.5
- juniper-junos-nc-3.0
- alu-sr-cli-3.4
- l3vpn (copied from
  `<nso-install-dir>/examples.ncs/service-provider/mpls-vpn/packages`)

Manual dependencies:
- cisco-asa [version 6.5.5]
- esc [version 4.3.0.2]
- tailf-etsi-rel2-nfvo [version 3.6]
- resource-manager [version 3.x]

**Important:** The correct version of each manual dependency package above must
be copied to the packages directory and named exactly as above. **These must be
copied before compiling the demo.**

## Compiling the demo
The demo directory is a complete NSO running directory.

NSO must be installed. If the installation type is local, ensure `ncsrc` has
been sourced.

    > source <nso-install-dir>/ncsrc

### Using a simulated ESC device
By default the demo will create a NETSIM network for all devices including ESC.

Change to the demo directory and run the `all` make target.

    > cd ~/tme-demo
    > make all

### Using a real ESC device
Ensure the details in `initial-data/real-esc.xml` are correct. Run the
`all-real-esc` make target instead of the `all` target.

    > cd ~/tme-demo
    > make all-real-esc

This will prevent the ESC NETSIM device being created and will create the ESC
device in NSO using the `initial-data/real-esc.xml` file instead.

### Compilation errors
After fixing any compilation errors (for example, if forgetting to re-generate
the RSA keys before compiling the demo), ensure that the demo is rebuilt
cleanly. This is important to ensure that all automated installation steps have
been executed.

Use the `clean` target to delete the CDB and NETSIM network, and clean the demo
packages.

    > make clean all

Use the `deep-clean` target to also clean all the dependent packages (usually
not required).

## Starting the demo
Use the `start` make target to start both NSO and the NETSIM environment. The
first time the demo is started, the devices in NSO are synchronised
automatically.

    > make start

## Stopping the demo
Use the `stop` make target to stop NSO and the NETSIM environment.

    > make stop

# Recommended demo steps
Below are the suggested steps to walk through the demo UI and showcase various
NSO features related to service life-cycle management. Other NSO features such
as device management and rollback are not covered here.

To display the demo UI, log into the NSO Web UI and click on the *TME Demo*
tile in the *Application hub*.

## Add a tenant
1.  Click the `+` button next to the *Tenants* header in the sidebar. Enter a
    tenant name and click the `>` button. The newly created tenant will now be
    displayed in the NSO *Configuration Editor*.

    **Note:** If this is the first time the *Configuration Editor* has been
    displayed, open the *View options* menu on the right of the header bar and
    select *full model*.

2.  Click the `l3vpn` container. Choose a `qos-policy`. The default
    `router-distinguisher` can be changed. Navigate back to the *TME Demo*
    using the shortcut bar at the bottom of the browser window.

## Add physical endpoints
3.  Drag *ce2* from the topology window onto the tenant just created in the
    sidebar. Enter a name for the endpoint and click the `>` button. The newly
    created VPN endpoint will now be displayed in the NSO *Configuration
    Editor*. The default values can be changed. Navigate back to the *TME Demo*
    using the shortcut bar at the bottom of the browser window.

4.  Repeat the previous step for *ce4*. This time ensure the `ip-network` is
    changed from the default value (this must be unique for each endpoint).

5.  Navigate to the NSO *Commit Manager* using the shortcut bar at the bottom
    of the browser window. Observe the changes to the service model shown on
    the *changes* tab.

6.  Click the *config* tab. These are the pending device model changes, in the
    NSO CDB, shown in the NSO internal format. NSO has taken the service intent
    (shown on the *changes* tab) and used this to calculate the configuration
    changes that are needed to each device in order to create the service.

    NSO looks up the PE connected to each CE and configures both devices.
    Scroll through the changes and observe that as well as changes to *ce2* and
    *ce4*, the corresponding PEs, *pe0* and *pe2* are also configured.

7.  Click the *native config* tab and scroll through the native configuration
    generated for each device. Observe that *pe0* is Cisco IOS-XR CLI and *pe2*
    is Juniper NETCONF XML.

    **Note:** The *Commit Dry Run* lets an engineer eyeball the changes before
    they’re sent.

8.  Click the *Commit* button on the right side on the header bar, and choose
    *Yes, commit* from the confirmation dialog. NSO is now sending the changes,
    in parallel, to all devices that are affected by the transaction. If NSO
    fails to make the changes to any device then it will attempt to roll back
    the other device(s).

9.  Navigate back to the *TME Demo* using the shortcut bar at the bottom of the
    browser window. If not already selected, click the tenant in the sidebar.
    Observe that *pe0*, *pe2*, *ce2* and *ce4* are highlighted with a blue hue.
    This indicates these devices have configuration changes belonging to the
    tenant.

## Modify the service
10. Click the `...` button next to the *ce2* endpoint to display the endpoint
    in the NSO *Configuration Editor*. To demonstrate a simple change, update
    the `bandwidth` value and navigate to the NSO *Commit Manager* using the
    shortcut bar at the bottom of the browser window. Look at the *config* and
    *native config* tabs to see that NSO has calculated the **minimal changes**
    required to update the bandwidth. Click the *Commit* button on the right of
    the header bar and choose *Yes, commit* from the confirmation dialog to
    push the changes to the devices.

11. Repeat the previous step, but this time change the `ce-device` to *ce1*.
    The changes in the NSO *Commit Manager* show NSO is able to handle this
    more complex change by cleanly removing all the configuration from *ce2*,
    and applying new configuration to *ce1*, as well as updating the
    configuration on *pe0* where necessary.

12. Finally, from the *TME Demo* UI click the `...` button next to the tenant
    name in the sidebar to display the tenant in the NSO *Configuration
    Editor*. Click the `l3vpn` container and change the `qos-policy`. Navigate
    to the NSO *Commit Manager* using the shortcut bar at the bottom of the
    browser window. Look at the *config* and *native config* tabs to see that
    NSO has calculated the changes required to all devices in the VPN to apply
    the new QoS policy. Click the *Commit* button on the right of the header
    bar and choose *Yes, commit* from the confirmation dialog to apply the
    changes to all the devices.

    Navigate back to the *TME Demo* using the shortcut bar at the bottom of the
    browser window.

## Redeploy the service
13. Imagine that there’s a problem with the link between *ce4* and *pe2*, and
    *ce4* is re-homed to *pe3*. The topology information in NSO needs updating
    to reflect that *ce4* is now connected to *pe3*.

    Click the *Edit Topology* toggle button in the bottom left corner of the
    topology window. Click the connection between *pe2* and *ce4*. Drag the
    *pe2* endpoint to *pe3*. Click the *Commit* button on the right of the
    header bar. The topology information in the CDB has now been updated. Click
    the *Edit Topology* toggle button again to leave edit mode.

14. At this point the service is no longer operational because *pe2* contains
    configuration that should be in *pe3*. The service can be fixed
    automatically using NSO's re-deploy feature. Click the *redeploy* button
    next to the tenant name in the sidebar (the tooltip for this button is
    *Touch L3 VPN and go to Commit Manager*). NSO uses the original service
    intent, and re-calculates what configuration is required in the network to
    satisfy the service intent.

15. Click on the *config* tab to show the differences between what’s actually
    configured and what would be needed for the service to be correctly
    configured. Scroll through the changes, showing the small change to *ce4*
    (description) and the bigger changes to *pe2* and *pe3*.

16. Click on the *native config* tab. This is showing the actual commands that
    will be sent to the devices to repair the service. Observe that *pe3* is
    Nokia ALU-SR CLI and *pe2* is Juniper NETCONF XML, so NSO is performing an
    automatic cross vendor migration to do this repair.

17. Click the *Commit* button on the right of the header bar and choose *Yes,
    commit* from the confirmation dialog to send the changes to the device.
    Navigate back to the *TME Demo* using the shortcut bar at the bottom of the
    browser window.

## Add a virtual PE
18. If not already selected, click the tenant in the sidebar. Drag the `+`
    button next to the *Network Services* header under the tenant in the
    sidebar onto the topology window. Drop the service chain icon in the
    *Transport* domain below *pe2*. Enter a name for the network service (for
    example vPE), and press the `>` button. The newly created network service
    will now be displayed in the *Configuration Editor*.

19. Choose one of the vPE NSDs from the `nsd` list and then select the
    `flavour`. Tick the `use-default-connections` checkbox in the
    `connections-choice` box. This will cause the service chain to be connected
    to *p3* and *ce7*. Alternative connections can be used by entering the
    `connection-points` list manually.

20. Navigate back to the *TME Demo* using the shortcut bar at the bottom of the
    browser window. Click the *Commit* button on the right of the header bar.

    NSO is now spinning up the VNF(s), using ESC and OpenStack.  This takes a
    few minutes while the VM(s) are deployed and booted. On a simulated ESC
    device, this only takes a few seconds.

21. Click the service chain to expand it and see the VNFs. The service chain
    will contain the CSR and additional VNFs depending on which NSD was chosen.
    Each VNF will change colour as it is instantiated.

    If using a real ESC instance, switch to the ESC UI to show the VNFs being
    deployed. Optionally, show the corresponding VM instances in the OpenStack
    Horizon dashboard.

    After a few minutes the topology links will appear.  This indicates that
    the VNFs have all been instantiated successfully. Any managed devices (such
    as the CSR) have been added to NSO's `device-list` and synchronised, and
    the topology has been updated.

22. Finally, add *ce7* to the VPN by dragging it from the topology window on to
    the tenant in the sidebar.  Enter a name for the endpoint and click the `>`
    button. The newly created VPN endpoint will now be displayed in the NSO
    *Configuration Editor*. Change `ip-network` from the default value (this
    must be unique for each endpoint).

23. Navigate to the NSO *Commit Manager* using the shortcut bar at the bottom
    of the browser window. Click on the *config* and *native config* tabs.
    Observe that NSO is generating configuration for both *ce7* and the CSR VNF
    (the name of the device will depend on tenant and endpoint names).

24. Click the *Commit* button on the right of the header bar and choose *Yes,
    commit* from the confirmation dialog to send the changes to the devices.

    NSO is now managing a hybrid, multi-vendor service, with both physical and
    virtual devices. NSO first instantiated the VNF and, in this last step, has
    pushed the day 1/service configuration.
