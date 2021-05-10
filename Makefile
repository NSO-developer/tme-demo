# The create-network argument to ncs-netsim
NETWORK = \
	create-network packages/cisco-ios       8 ce \
	create-network packages/cisco-iosxr     2 pe \
	create-network packages/juniper-junos   1 pe \
	create-network packages/alu-sr          1 pe \
	create-network packages/cisco-iosxr     4 dci \
	create-network packages/cisco-iosxr     4 p \
	create-network packages/esc             1 esc \
	create-network packages/cisco-nx        4 spine \
	create-network packages/cisco-ios       2 sw \
	create-network packages/dell-ftos       1 sw \
	create-network packages/cisco-ios       2 sw \
	create-network packages/dell-ftos       1 sw

DEMO_DIR = $(shell basename $(CURDIR))

EXTERNAL_DEPS = resource-manager esc openstack-cos-gen-4.2 \
	              etsi-sol003-gen-1.13 cisco-etsi-nfvo
DEP_CLEANUP_DIRS = doc doc-internal examples initial_data test

CONTENT_SECURITY_POLICY = default-src 'self' 'unsafe-inline'; \
	                        block-all-mixed-content; \
	                        base-uri 'self'; frame-ancestors 'none'; \
	                        img-src 'self' data:;

PACKAGES = all

NX = NX=$$(printf '\nx'); NL=$${NX%x}
NL = $${NL}

all: setup.mk packages netsim ncs-cdb add-content-security-policy
.PHONY: all

tme-demo: override PACKAGES = tme-demo
tme-demo: all
.PHONY: tme-demo

real-esc-tme-demo: override PACKAGES = tme-demo
real-esc-tme-demo: real-esc
.PHONY: real-esc-tme-demo

real-esc: override NETWORK := $(shell echo $(NETWORK) | sed -e \
		's/create-network packages\/esc 1 esc//g')
real-esc: all
	cp initial-data/real-esc.xml ncs-cdb
.PHONY: real-esc

setup.mk:
	for i in $(EXTERNAL_DEPS); do \
	    if [ ! -d packages/$${i} ]; then ncs-project update; break; fi; \
	done
	if [ ! -f setup.mk ]; then touch setup.mk; fi
	for i in $(EXTERNAL_DEPS); do \
	    for n in $(DEP_CLEANUP_DIRS); do \
	        [ -d packages/$${i}/$${n} ] && rm -r packages/$${i}/$${n} || true; \
	    done; \
	done

packages:
	$(MAKE) -C packages $(PACKAGES)
.PHONY: packages

netsim:
	ncs-netsim --dir netsim $(NETWORK)
	cp initial-data/netsim/ios.xml netsim/ce/ce0/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce1/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce2/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce3/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce4/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce5/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce6/cdb
	cp initial-data/netsim/ios.xml netsim/ce/ce7/cdb
	cp initial-data/netsim/iosxr.xml netsim/pe/pe0/cdb
	cp initial-data/netsim/iosxr.xml netsim/pe/pe1/cdb
	cp initial-data/netsim/alu-sr.xml netsim/pe/pe3/cdb
	cp initial-data/netsim/iosxr.xml netsim/dci/dci0/cdb
	cp initial-data/netsim/iosxr.xml netsim/dci/dci1/cdb
	cp initial-data/netsim/iosxr.xml netsim/dci/dci2/cdb
	cp initial-data/netsim/iosxr.xml netsim/dci/dci3/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p0/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p1/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p2/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p3/cdb
	cp initial-data/netsim/dci0.xml netsim/dci/dci0/cdb
	cp initial-data/netsim/dci1.xml netsim/dci/dci1/cdb
	cp initial-data/netsim/dci2.xml netsim/dci/dci2/cdb
	cp initial-data/netsim/dci3.xml netsim/dci/dci3/cdb
	cp initial-data/netsim/nexus.xml netsim/spine/spine0/cdb
	cp initial-data/netsim/nexus.xml netsim/spine/spine1/cdb
	cp initial-data/netsim/nexus.xml netsim/spine/spine2/cdb
	cp initial-data/netsim/nexus.xml netsim/spine/spine3/cdb
	cp initial-data/netsim/spine0.xml netsim/spine/spine0/cdb
	cp initial-data/netsim/spine1.xml netsim/spine/spine1/cdb
	cp initial-data/netsim/spine2.xml netsim/spine/spine2/cdb
	cp initial-data/netsim/spine3.xml netsim/spine/spine3/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw0/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw1/cdb
	cp initial-data/netsim/f10.xml netsim/sw/sw2/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw3/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw4/cdb
	cp initial-data/netsim/f10.xml netsim/sw/sw5/cdb


ncs-cdb:
	ncs-setup --no-netsim --dest .
	cp initial-data/authgroups.xml ncs-cdb
	cp initial-data/data-centre-topology.xml ncs-cdb
	cp initial-data/device-groups.xml ncs-cdb
	cp initial-data/esc-ned-template.xml ncs-cdb
	cp initial-data/esc-scaling-template.xml ncs-cdb
	cp initial-data/icon-positions.xml ncs-cdb
	cp initial-data/nsd-catalogue.xml ncs-cdb
	cp initial-data/qos.xml ncs-cdb
	cp initial-data/resource-pools.xml ncs-cdb
	cp initial-data/topology.xml ncs-cdb
	cp initial-data/topology-layout.xml ncs-cdb
	cp initial-data/vnfd-catalogue.xml ncs-cdb
	cp initial-data/webui-applications.xml ncs-cdb
	ncs-netsim ncs-xml-init > ncs-cdb/netsim-devices-init.xml

add-content-security-policy:
	if [ -z $(ncs_conf_tool -r ncs-config webui content-security-policy < ncs.conf) ]; \
	then $(NX); \
	  sed "s/^.*<\/webui>/\\$(NL)    <content-security-policy><\/content-security-policy>\\$(NL)&/" \
	      ncs.conf > ncs.conf.tmp; \
	else \
	  cp ncs.conf ncs.conf.tmp; \
	fi
	sed "s/\(<content-security-policy>\).*\(<\/content-security-policy>\)/\1\$(CONTENT_SECURITY_POLICY)\2/" \
	    ncs.conf.tmp > ncs.conf
	rm ncs.conf.tmp

clean:
	$(MAKE) -C packages clean
	rm -f README.ncs README.netsim ncs.conf storedstate
	rm -rf netsim running.DB logs state ncs-cdb *.trace *.log
	rm -rf bin
	rm -f init
.PHONY: clean

deep-clean: clean
	$(MAKE) -C packages deep-clean
.PHONY: clean-deep

init:
	FILE=logs/ncs-python-vm-tme-demo.log; \
	while [ ! -f $$FILE ]; do sleep 5; done; \
	while ! grep -qs RUNNING $$FILE; do sleep 5; done
	ncs_load -u admin -l -m -O initial-data/platform-infos.xml > $@
	echo 'request devices device * ssh fetch-host-keys' | ncs_cli -u admin >> $@
	echo 'request devices sync-from' | ncs_cli -u admin >> $@
	ncs_load -u admin -m -l initial-data/default-ns-connections.xml >> $@

start-netsim:
	ncs-netsim start
.PHONY: start-netsim

start-ncs:
	ncs --ignore-initial-validation
.PHONY: start-ncs

start: start-netsim start-ncs init
.PHONY: start

stop:
	-ncs-netsim stop
	-ncs --stop
.PHONY: stop

wait-until-started:
	ncs --wait-started
.PHONY: wait-until-started

reset:
	ncs-netsim reset
	ncs-netsim start
	ncs-setup --reset
	ncs
.PHONY: reset

cli:
	ncs_cli -u admin
.PHONY: cli

dist: stop deep-clean
	$(MAKE) -C packages/tme-demo-ui/src/webui || exit 1;
	cd .. ; \
	tar -cf $(DEMO_DIR).tar \
	  --exclude='.git' \
	  --exclude='*.swp' \
	  --exclude='.*' \
	  --exclude='doc' \
	  --exclude='doc-internal' \
	  --exclude='lux_logs' \
	  --exclude='node' \
	  --exclude='node_modules' \
	  --exclude='node_releases' \
	  --exclude='test' \
	  --exclude='cisco-etsi-nfvo\/src\/webui\/*' \
	  --exclude='cisco-etsi-nfvo\/src\/deps' \
	  --exclude='__pycache__' \
	  --exclude='ncs-cdb' \
	  --exclude='logs' \
	  --exclude='$(DEMO_DIR)\/netsim' \
	  --exclude='$(DEMO_DIR)\/state' \
	  --exclude='$(DEMO_DIR)\/target' \
	  $(DEMO_DIR); \
	echo all: > nfvoWebuiMakefile; \
	tar -rf $(DEMO_DIR).tar -s \
	  ,nfvoWebuiMakefile,tme-demo/packages/cisco-etsi-nfvo/src/webui/Makefile, \
	  nfvoWebuiMakefile; \
	rm nfvoWebuiMakefile; \
	gzip -9 $(DEMO_DIR).tar
.PHONY: dist
