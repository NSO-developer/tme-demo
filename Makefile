# This Makefile has targets for both building / running the TME demo locally,
# and building / running a docker image containing the demo.
#
# The docker image uses an NSO system install and so the supporting packages,
# pre and post start scripts and initial data files are arranged into a system
# directory structure that is copied into the docker image. The local install
# targets use references / symlink to the files in these locations.


# DEPENDENCIES
#
# This demo depends on the Resource Manager and NFVO projects / function packs.
# The individual packages from these function packs should be extracted
# and placed in system/opt/ncs/packages (in the extracted directory format).
# Once done, the following directories should be present:
#
#  ▾ tme-demo/
#    ▾ system/
#      ▾ opt/
#        ▾ ncs/
#          ▾ packages/
#            ▸ cisco-etsi-nfvo/
#            ▸ esc/
#            ▸ etsi-sol003-gen-1.13/
#            ▸ openstack-cos-gen-4.2/
#            ▸ resource-manager/
#
# For a local install, NSO should be pre-installed. To build a docker image,
# the NSO installer binary should be placed in the nso-install-file directory.
# Only one file should be placed in this directory.
#
# The docker image automatically includes all of the OS package pre-requisites
# in the Dockerfile. For a local install, the following packages are required:
#
#   Ant
#   Make
#   Java
#   Python 3 and pyyaml (from pip3)
#   Node.js and npm
#   XMLStarlet
#   Erlang and Lux (both optional for running tests)


# LOCAL INSTALL
#
# To build the demo run the "make all" target
#
# To start and stop the demo run the "make start" and "make stop" targets
#
# To clean the demo run the "make clean" target, this will completely delete
# everything and the demo will require rebuilding. The demo should be stopped
# before running the clean target.
#
# To quickly reset the demo run the "make reset" target. This will reset the
# CDB and netsim devices without needing to rebuild the packages.

.SUFFIXES:

REAL_ESC = false

all: packages ncs-cdb netsim
.PHONY: all

all-real-esc: override REAL_ESC := true
all-real-esc: all
.PHONY: real-esc

clean: clean-packages clean-cdb clean-netsim
.PHONY: clean

start: start-netsim start-ncs post-ncs-start-data start-ssh-proxy
.PHONY: start

stop: stop-ssh-proxy
	-ncs-netsim stop
	-ncs --stop
.PHONY: stop

reset:
	ncs-netsim reset
	ncs-setup --reset
	rm -f post-ncs-start-data
.PHONY: reset

test:
	@now=$$(date +%Y_%m_%d_%H_%M_%S_%N); \
	log_dir=run_$${now%???}; \
	cd system/build/test; \
	lux --log_dir ../../../logs/lux_logs/$${log_dir} .; \
	ln -sfn $${log_dir} ../../../logs/lux_logs/latest_run

.PHONY: test


netsim:
	CDB_DIR=ncs-cdb \
	NETSIM_DATA_DIR=system/var/opt/ncs/netsim-data \
	system/etc/ncs/pre-ncs-start.d/10-netsim.sh

clean-netsim:
	rm -rf netsim
.PHONY: clean-netsim

ncs-cdb:
	ncs-setup --no-netsim --dest .
	cp system/var/opt/ncs/cdb/*.xml ncs-cdb
	KEEP_PORTS="true" CONF_FILE="ncs.conf" \
	system/etc/ncs/pre-ncs-start.d/50-mangle-config.sh

clean-cdb:
	rm -f README.ncs ncs.conf
	rm -rf ncs-cdb logs state scripts
	rm -f storedstate
	rm -rf target
	rm -f post-ncs-start-data
.PHONY: clean-cdb

start-netsim:
	ncs-netsim start
.PHONY: start-netsim

start-ncs:
	ncs --ignore-initial-validation
.PHONY: start-ncs

start-ssh-proxy:
	$(MAKE) -C packages/tme-demo-ui/src start-ssh-proxy

stop-ssh-proxy:
	$(MAKE) -C packages/tme-demo-ui/src stop-ssh-proxy

post-ncs-start-data:
	ln -s system/var/opt/ncs/post-ncs-start-data
	system/etc/ncs/post-ncs-start.d/10-sync-from.sh
	system/etc/ncs/post-ncs-start.d/20-initial-data.sh

demo_dir = $(shell basename $(CURDIR))
dist: stop clean
	$(MAKE) -C packages/tme-demo-ui/src/webui || exit 1;
	cd .. ; \
	tar -cvf $(demo_dir).tar \
	  --exclude='.git' \
	  --exclude='*.swp' \
	  --exclude='.*' \
	  --exclude='node_modules' \
	  --exclude='resource-manager/doc' \
	  --exclude='resource-manager/test' \
	  $(demo_dir); \
	gzip -9 $(demo_dir).tar
.PHONY: dist


# DOCKER INSTALL
#
# To build the docker image run the "make docker-build" target. This creates
# two docker images. The larger build image is used to compile the packages,
# the smaller run image contains the final packages. Once the images are built,
# the build image is no longer required, but can be used to run the Lux tests
# (the docker-test target will start the build image and automatically run the
# Lux tests). If the demo has previously been built locally, run the
# "make clean" target before creating the docker build, and ensure the packages
# directory has no symlinks and only the tme-demo and tme-demo-ui source
# package directories.
#
# To start and stop the run image use the "make docker-start" and
# "make docker-stop" targets. The start target will output the startup progress
# from the docker logs until the demo is fully ready. The demo can then be
# accessed in a web browser on the standard HTTP port 80, and SSH access
# directly into NSO is on the standard SSH port 22. The stop target will
# cleanly stop the netsim devices and shutdown NSO, and then remove the
# container.
#
# To access the OS shell run the "make docker-shell" target.

CNT_NAME = tme-demo
IMAGE_NAME = tme-demo

nso_install_file = $(wildcard nso-install-file/nso-*.linux.x86_64.installer.bin)

docker-build:
	@if [ $(words $(nso_install_file)) -ne 1 ]; then \
	  echo "Unable to find NSO installer binary"; \
	  exit 1; \
	fi
	docker build --build-arg NSO_INSTALL_FILE=$(nso_install_file) --progress=plain --target nso-build -t $(IMAGE_NAME)-build .
	docker build --build-arg NSO_INSTALL_FILE=$(nso_install_file) --progress=plain --target nso-run -t $(IMAGE_NAME) .

docker-start: docker-run docker-wait-started

docker-test: IMAGE_NAME = tme-demo-build
docker-test: docker-run docker-wait-started
	docker exec -t $(CNT_NAME) bash -lc 'cd /build/test && lux .' || exit 0
	docker stop --time 60 $(CNT_NAME)
	docker rm $(CNT_NAME)

docker-stop:
	@docker logs -f --since 0m $(CNT_NAME) &
	docker stop --time 60 $(CNT_NAME)
	docker rm $(CNT_NAME)

docker-shell:
	docker exec -it tme-demo bash -l


docker-run:
	docker run -p 22:22/tcp -p 80:80/tcp -p 443:443/tcp -p 830:830/tcp -p 4000:4000 --name $(CNT_NAME) -td $(IMAGE_NAME)

docker-wait-started:
	@docker logs -f $(CNT_NAME) & LOGS_PID="$$!"; \
	while ! docker logs $(CNT_NAME) | grep -q "run-nso.sh: startup complete"; do \
	  sleep 10; \
	done; \
	kill $${LOGS_PID}

.PHONY: docker-build docker-start docker-test docker-stop docker-shell docker-run docker-wait-started


# PACKAGE COMPILATION
#
# local-packages:
# To minimise package dependencies and demo size, the demo uses the NEDs
# shipped with NSO. These are already pre-compiled (and are not recompiled),
# they are symlinked to the packages directory. In addition, the demo uses some
# of the example packages included in examples.ncs. These are not already
# pre-compiled, they are copied to the packages directory and compiled.
#
# included-packages:
# The external package dependencies are mentioned at the top of this file.
# These are already pre-compiled and should be placed in
# system/opt/ncs/packages where they are symlinked to the packages directory.
#
# demo packages
# The tme-demo (and tme-demo-ui) source package is already in the packages
# directory and is compiled when the demo is built.

local-packages = $(notdir $(wildcard system/build/local-packages/*/*))
included-packages = $(notdir $(wildcard system/opt/ncs/packages/*))
all-required-packages = $(local-packages:%=packages/%) $(included-packages:%=packages/%)

packages: $(all-required-packages)
	$(MAKE) -C packages/tme-demo/src all
	$(MAKE) -C packages/tme-demo-ui/src all
	cp -r post-install-fixes/opt/ncs/packages/* packages
.PHONY: packages

packages/% :: system/opt/ncs/packages/%
	ln -sr $< $@;

clean-packages:
	@for pkg in $(all-required-packages); do \
	  if [ -L $${pkg} ] || [ -d $${pkg} ]; then \
	    cmd=$$([ -L $${pkg} ] && echo "rm" || echo "rm -rf"); \
	    cmd="$${cmd} $${pkg}"; echo $${cmd}; eval $${cmd}; \
	  fi; \
	done;
	$(MAKE) -C packages/tme-demo/src clean
	$(MAKE) -C packages/tme-demo-ui/src clean
.PHONY: clean-packages


.SECONDEXPANSION:

packages/% :: $$(NCS_DIR)/$$(or $$(file <system/build/local-packages/copy-and-compile/%), "invalid-path")
	cp -r $< $@;
	if [ -d post-install-fixes/opt/ncs/packages/$(@F) ]; then \
	  cp -r post-install-fixes/opt/ncs/packages/$(@F)/* $@; \
	fi;
	$(MAKE) -C $@/src all

packages/% :: $$(NCS_DIR)/$$(file <system/build/local-packages/symlink/%)
	ln -s $< $@;
