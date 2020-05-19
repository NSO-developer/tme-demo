# The order of packages is significant as there are dependencies between
# the packages. Typically generated namespaces are used by other packages.
PACKAGES = tme-demo-ui tme-demo
PACKAGE_DEPENDENCIES = resource-manager esc openstack-cos-gen-4.2 \
	                     etsi-sol003-gen-1.13 cisco-etsi-nfvo \
	                     l3vpn datacenter
NED_STORE=$(NCS_DIR)/packages/neds

all: dependencies tme-demo
.PHONY: all

tme-demo:
	for i in $(PACKAGES); do \
	    $(MAKE) -C $${i}/src all || exit 1; \
	done
.PHONY: tme-demo

dependencies: cisco-ios cisco-iosxr juniper-junos alu-sr cisco-nx dell-ftos \
	            cisco-asa l3vpn datacenter
	for i in $(PACKAGE_DEPENDENCIES); do \
	    $(MAKE) -C $${i}/src all || exit 1; \
	done
.PHONY: dependencies

cisco-ios:
	cp -r $(NED_STORE)/cisco-ios-cli-3.8 $@
	cp ../initial-data/netsim/ios.xml $@/netsim

cisco-iosxr:
	ln -s $(NED_STORE)/cisco-iosxr-cli-3.5 $@

juniper-junos:
	ln -s $(NED_STORE)/juniper-junos-nc-3.0 $@

alu-sr:
	ln -s $(NED_STORE)/alu-sr-cli-3.4 $@

cisco-nx:
	cp -r $(NED_STORE)/cisco-nx-cli-3.0 $@
	$(MAKE) -C $@/src clean || exit 1
	cd $@/src/yang; \
	cp tailf-ned-cisco-nx.yang tmp.yang; \
	sed '/include tailf-ned-cisco-nx-router-ospf;/d; /include tailf-ned-cisco-nx-router;/d; s/type ospf-area-type/type string/' \
	    tmp.yang > tailf-ned-cisco-nx.yang; \
	rm tmp.yang
	$(MAKE) -C $@/src all || exit 1

dell-ftos:
	ln -s $(NED_STORE)/dell-ftos-cli-3.0 $@

cisco-asa:
	ln -s $(NED_STORE)/cisco-asa-cli-6.6 $@

l3vpn:
	cp -r $(NCS_DIR)/examples.ncs/service-provider/mpls-vpn/packages/$@ $@
	cp ../l3vpn/l3vpn-pe.xml $@/templates

datacenter:
	ln -s $(NCS_DIR)/examples.ncs/datacenter/datacenter/packages/connectivity $@

clean:
	for i in $(PACKAGES); do \
	    $(MAKE) -C $${i}/src clean || exit 1; \
	done
.PHONY: clean

deep-clean: clean
	$(MAKE) -C tme-demo-ui/src clean-webui || exit 0; \
	for i in $(PACKAGE_DEPENDENCIES); do \
	    $(MAKE) -C $${i}/src clean || exit 0; \
	done
	rm -f cisco-iosxr
	rm -f juniper-junos
	rm -f alu-sr
	rm -f dell-ftos
	rm -f cisco-asa
	rm -f datacenter
	rm -rf cisco-ios
	rm -rf cisco-nx
	rm -rf l3vpn
.PHONY: clean-deep
