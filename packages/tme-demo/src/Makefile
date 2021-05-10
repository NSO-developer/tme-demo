all: fxs
.PHONY: all

# Include standard NCS examples build definitions and rules
include $(NCS_DIR)/src/ncs/build/include.ncs.mk

SRC = $(wildcard yang/*.yang)
DIRS = ../load-dir java/src/$(JDIR)/$(NS)
FXS = $(SRC:yang/%.yang=../load-dir/%.fxs)

## Uncomment and patch the line below if you have a dependency to a NED
## or to other YANG files
# YANGPATH += ../../<ned-name>/src/ncsc-out/modules/yang \
# 	../../<pkt-name>/src/yang

YANGPATH += ../../cisco-ios-cli-3.8/src/ncsc-out/modules/yang \
	          ../../cisco-ios-cli-3.8/src/ \
	          ../../cisco-iosxr-cli-3.5/src/ncsc-out/modules/yang \
	          ../../cisco-iosxr-cli-3.5/src/ \
	          ../../juniper-junos-nc-3.0/src/ncsc-out/modules/yang \
	          ../../juniper-junos-nc-3.0/src \
	          ../../alu-sr-cli-3.4/src/ncsc-out/modules/yang \
	          ../../alu-sr-cli-3.4/src \
	          ../../cisco-nx-cli-3.0/src/ncsc-out/modules/yang \
	          ../../cisco-nx-cli-3.0/src \
	          ../../dell-ftos-cli-3.0/src/ncsc-out/modules/yang \
	          ../../dell-ftos-cli-3.0/src \
	          ../../cisco-etsi-nfvo/src/yang \
	          ../../resource-manager/src/yang \
	          ../../l3vpn/src/yang

NCSCPATH   = $(YANGPATH:%=--yangpath %)
YANGERPATH = $(YANGPATH:%=--path %)

fxs: $(DIRS) $(FXS)

$(DIRS):
	mkdir -p $@

../load-dir/%.fxs: yang/%.yang
	$(NCSC)  `ls $*-ann.yang  > /dev/null 2>&1 && echo "-a $*-ann.yang"` \
             $(NCSCPATH) -c -o $@ $<

clean:
	rm -rf $(DIRS)
.PHONY: clean
