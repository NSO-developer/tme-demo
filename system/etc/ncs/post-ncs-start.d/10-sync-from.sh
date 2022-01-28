#!/bin/sh

echo 'request devices device * ssh fetch-host-keys' | ncs_cli -u admin
echo 'request devices sync-from' | ncs_cli -u admin
