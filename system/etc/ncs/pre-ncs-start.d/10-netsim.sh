#!/bin/sh

cd ${NCS_RUN_DIR:-.}

CDB_DIR_NAME=${CDB_DIR:-cdb}
NETSIM_DATA_DIR=${NETSIM_DATA_DIR:-netsim-data}

NETWORK="\
  create-network packages/cisco-ios      8 ce \
  create-network packages/cisco-iosxr    2 pe \
  create-network packages/juniper-junos  1 pe \
  create-network packages/alu-sr         1 pe \
  create-network packages/cisco-iosxr    4 dci \
  create-network packages/cisco-iosxr    4 p \
  create-network packages/cisco-nx       4 spine \
  create-network packages/cisco-ios      2 sw \
  create-network packages/dell-ftos      1 sw \
  create-network packages/cisco-ios      2 sw \
  create-network packages/dell-ftos      1 sw"

if [ "${REAL_ESC}" != "true" ]; then
  NETWORK="${NETWORK} \
  create-network packages/esc            1 esc"
fi

cp --backup ${NETSIM_DATA_DIR}/ios.xml packages/cisco-ios/netsim
cp ${NETSIM_DATA_DIR}/iosxr.xml packages/cisco-iosxr/netsim
cp ${NETSIM_DATA_DIR}/nexus.xml packages/cisco-nx/netsim
cp ${NETSIM_DATA_DIR}/f10.xml packages/dell-ftos/netsim

mkdir -p netsim
ncs-netsim ${NETWORK}

cp ${NETSIM_DATA_DIR}/alu-sr.xml netsim/pe/pe3/cdb
cp ${NETSIM_DATA_DIR}/dci0.xml netsim/dci/dci0/cdb
cp ${NETSIM_DATA_DIR}/dci1.xml netsim/dci/dci1/cdb
cp ${NETSIM_DATA_DIR}/dci2.xml netsim/dci/dci2/cdb
cp ${NETSIM_DATA_DIR}/dci3.xml netsim/dci/dci3/cdb
cp ${NETSIM_DATA_DIR}/spine0.xml netsim/spine/spine0/cdb
cp ${NETSIM_DATA_DIR}/spine1.xml netsim/spine/spine1/cdb
cp ${NETSIM_DATA_DIR}/spine2.xml netsim/spine/spine2/cdb
cp ${NETSIM_DATA_DIR}/spine3.xml netsim/spine/spine3/cdb

ncs-netsim ncs-xml-init > ${CDB_DIR_NAME}/netsim-devices-init.xml
