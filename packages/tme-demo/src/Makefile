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

YANGPATH += ../../cisco-ios/src/ncsc-out/modules/yang \
	          ../../cisco-iosxr/src/ncsc-out/modules/yang \
	          ../../juniper-junos/src/ncsc-out/modules/yang \
	          ../../alu-sr/src/ncsc-out/modules/yang \
	          ../../esc/src/yang \
	          ../../esc/src/ncsc-out/modules/yang \
	          ../../tailf-etsi-rel2-nfvo/src/yang \
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
