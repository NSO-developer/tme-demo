# The create-network argument to ncs-netsim
NETWORK = \
	create-network packages/cisco-ios       8 ce \
	create-network packages/cisco-iosxr     2 pe \
	create-network packages/juniper-junos   1 pe \
	create-network packages/alu-sr          1 pe \
	create-network packages/cisco-iosxr     4 dci \
	create-network packages/cisco-iosxr     4 p \
	create-network packages/esc             1 esc \
	create-network packages/cisco-nx        4 tor \
	create-network packages/cisco-ios       2 sw \
	create-network packages/dell-ftos       1 sw \
	create-network packages/cisco-ios       2 sw \
	create-network packages/dell-ftos       1 sw

DEMO_DIR = $(shell basename $(CURDIR))

EXTERNAL_DEPS = resource-manager esc tailf-etsi-rel2-nfvo cisco-asa
DEP_CLEANUP_DIRS = doc doc-internal examples initial_data test

all-real-esc: remove-esc-netsim all
	cp initial-data/real-esc.xml ncs-cdb
.PHONY: all-real-esc

remove-esc-netsim:
	$(eval NETWORK = $(shell echo $(NETWORK) | sed -e \
		's/create-network packages\/esc 1 esc//g'))
	echo $(NETWORK)
.PHONY: real-esc

all: setup.mk packages netsim ncs-cdb
.PHONY: all

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
	$(MAKE) -C packages
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
	cp initial-data/netsim/nexus.xml netsim/tor/tor0/cdb
	cp initial-data/netsim/nexus.xml netsim/tor/tor1/cdb
	cp initial-data/netsim/nexus.xml netsim/tor/tor2/cdb
	cp initial-data/netsim/nexus.xml netsim/tor/tor3/cdb
	cp initial-data/netsim/tor0.xml netsim/tor/tor0/cdb
	cp initial-data/netsim/tor1.xml netsim/tor/tor1/cdb
	cp initial-data/netsim/tor2.xml netsim/tor/tor2/cdb
	cp initial-data/netsim/tor3.xml netsim/tor/tor3/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw0/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw1/cdb
	cp initial-data/netsim/f10.xml netsim/sw/sw2/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw3/cdb
	cp initial-data/netsim/ios.xml netsim/sw/sw4/cdb
	cp initial-data/netsim/f10.xml netsim/sw/sw5/cdb

ncs-cdb:
	ncs-setup --no-netsim --dest .
	cp initial-data/authgroups.xml ncs-cdb
	cp initial-data/device-groups.xml ncs-cdb
	cp initial-data/esc-scaling-template.xml ncs-cdb
	cp initial-data/icon-positions.xml ncs-cdb
	cp initial-data/nsd-catalogue.xml ncs-cdb
	cp initial-data/qos.xml ncs-cdb
	cp initial-data/resource-pools.xml ncs-cdb
	cp initial-data/topology.xml ncs-cdb
	cp initial-data/vnfd-catalogue.xml ncs-cdb
	cp initial-data/webui-applications.xml ncs-cdb
	ncs-netsim ncs-xml-init > ncs-cdb/netsim-devices-init.xml

clean:
	$(MAKE) -C packages clean
	rm -f README.ncs README.netsim ncs.conf
	rm -rf netsim running.DB logs state ncs-cdb *.trace
	rm -rf bin
	rm -f init
.PHONY: clean

deep-clean: clean
	$(MAKE) -C packages deep-clean
.PHONY: clean-deep

init:
	FILE=logs/ncs-python-vm-tailf-etsi-rel2-nfvo.log; \
	while [ ! -f $$FILE ]; do sleep 5; done; \
	while ! grep -qs RUNNING $$FILE; do sleep 5; done
	ncs_load -u admin -l -C initial-data/platform-infos.xml > $@
	ncs_load -u admin -m -l initial-data/nfvo-init.xml >> $@
	ncs_cli -u admin <<< 'request devices device * ssh fetch-host-keys' >> $@
	ncs_cli -u admin <<< 'request devices sync-from' >> $@
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
		--exclude='.DS_Store' \
		--exclude='lux_logs' \
		--exclude='node_modules' \
		--exclude='$(DEMO_DIR)\/ncs-cdb\/*' \
		--exclude='$(DEMO_DIR)\/state\/*' \
		--exclude='$(DEMO_DIR)\/logs\/*' \
		--exclude='$(DEMO_DIR)\/netsim' \
		--exclude='$(DEMO_DIR)\/doc' \
		$(DEMO_DIR) && gzip -9 $(DEMO_DIR).tar
.PHONY: dist
