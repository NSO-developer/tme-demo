
JAVA_PACKAGE = com.tailf.packages.ned.nexus
JDIR = $(shell echo $(JAVA_PACKAGE) | sed 's/\./\//g')

NS  = namespaces

JFLAGS = --java-disable-prefix \
         --exclude-enums \
         --fail-on-warnings \
         --java-package $(JAVA_PACKAGE).$(NS) \
         --emit-java java/src/$(JDIR)/namespaces

all:	fxs
	cd java && ant -q all
	$(MAKE) -C ../netsim all
.PHONY: all

# Include standard NCS examples build definitions and rules
include $(NCS_DIR)/src/ncs/build/include.ncs.mk

NFXS = ncsc-out/modules/fxs
FXS  = $(NFXS)/tailf-ned-cisco-nx.fxs
DIRS = ncsc-out ncsc-out/modules $(NFXS)         \
       ../load-dir ../shared-jar ../private-jar  \
       java/src/$(JDIR)/$(NS)
NED_ID_ARG = $(shell [ -x ${NCS_DIR}/support/ned-ncs-ned-id-arg ] && \
               ${NCS_DIR}/support/ned-ncs-ned-id-arg package-meta-data.xml.in)

fxs: $(DIRS) ../package-meta-data.xml ned-id-file $(FXS)
.PHONY: fxs

$(DIRS):
	mkdir -p $@

../package-meta-data.xml: package-meta-data.xml.in
	rm -rf $@
	if [ -x ${NCS_DIR}/support/ned-make-package-meta-data ]; then \
	    ${NCS_DIR}/support/ned-make-package-meta-data $<;         \
	else                                                          \
	    cp $< $@;                                                 \
	fi
	chmod -w $@

$(NFXS)/tailf-ned-cisco-nx.fxs: yang/tailf-ned-cisco-nx.yang
	$(NCSC) --ncs-compile-bundle yang     \
	        --ncs-device-dir ncsc-out     \
	        --ncs-skip-statistics         \
	        --ncs-device-type cli-ned     \
	       $(NED_ID_ARG) &&               \
	cp $@ ../load-dir
	$(NCSC) $(JFLAGS)/NexusNedCli.java $@

ned-id-file:
	if [ -x ${NCS_DIR}/support/ned-make-package-meta-data ]; then  \
	   echo "ned-id built by: support/ned-make-package-meta-data"; \
	else                                                           \
	   $(NCSC) -c yang/tailf-ned-cisco-nx-id.yang                  \
	       -o ../load-dir/tailf-ned-cisco-nx-id.fxs;               \
	fi
.PHONY: ned-id-file

clean:
	rm -rf $(DIRS)
	rm -rf ../package-meta-data.xml
	cd java && ant clean
	$(MAKE) -C ../netsim clean
.PHONY: clean
