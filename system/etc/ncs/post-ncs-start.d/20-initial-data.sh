#!/bin/sh

cd ${NCS_RUN_DIR:-.}

ncs_load -u admin -l -m -O post-ncs-start-data/platform-infos.xml
ncs_load -u admin -m -l post-ncs-start-data/default-ns-connections.xml
ncs_load -u admin -m -l post-ncs-start-data/esc-netconf-subscription.xml
