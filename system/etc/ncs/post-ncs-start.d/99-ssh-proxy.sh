#!/bin/sh

nohup node /opt/ncs/packages/tme-demo-ui/webui/ssh-proxy.js > /tmp/ssh-proxy.out 2>&1 &
