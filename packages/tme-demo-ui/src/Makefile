all: fxs ../webui
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

clean-webui: clean
	rm -rf ../webui

../webui:
	$(MAKE) -C webui all || exit 1

strip:
	rm -rf webui/node_modules
.PHONY: strip

start-ssh-proxy:
	nohup node ../webui/ssh-proxy.js > /tmp/ssh-proxy.out 2>&1 &\
	echo $$! > /tmp/SSH_PROXY_PID
	cat /tmp/SSH_PROXY_PID

stop-ssh-proxy:
	if [ -f /tmp/SSH_PROXY_PID ]; then \
	  kill $$(cat /tmp/SSH_PROXY_PID); \
	  rm /tmp/SSH_PROXY_PID; \
	fi
