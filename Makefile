# The create-network argument to ncs-netsim
NETWORK = \
	create-network packages/cisco-ios       8 ce \
	create-network packages/cisco-iosxr     2 pe \
	create-network packages/juniper-junos   1 pe \
	create-network packages/alu-sr          1 pe \
	create-network packages/cisco-iosxr     2 dci \
	create-network packages/cisco-iosxr     4 p \
	create-network packages/esc             1 esc

DEMO_DIR = $(shell basename $(CURDIR))


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
	ncs-project update

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
	cp initial-data/netsim/iosxr.xml netsim/p/p0/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p1/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p2/cdb
	cp initial-data/netsim/iosxr.xml netsim/p/p3/cdb

ncs-cdb:
	ncs-setup --no-netsim --dest .
	cp initial-data/device-groups.xml ncs-cdb
	cp initial-data/esc-scaling-template.xml ncs-cdb
	cp initial-data/icon-positions.xml ncs-cdb
	cp initial-data/nsd-catalogue.xml ncs-cdb
	cp initial-data/qos.xml ncs-cdb
	cp initial-data/resource-pools.xml ncs-cdb
	cp initial-data/topology.xml ncs-cdb
	cp initial-data/vnfd-catalogue.xml ncs-cdb
	cp initial-data/webui-applications.xml ncs-cdb
	ncs-netsim ncs-xml-init > ncs-cdb/netsim_devices_init.xml

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

dist:
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
