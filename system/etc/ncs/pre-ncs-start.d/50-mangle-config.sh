#!/bin/sh

CONF_FILE=${CONF_FILE:-/etc/ncs/ncs.conf}
CONTENT_SECURITY_POLICY="default-src 'self' 'unsafe-inline'; block-all-mixed-content; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data:;"

# update ports for various protocols for which the default value in ncs.conf is
# different from the protocols default port (to allow starting ncs without root)
# NETCONF call-home is already on its default 4334 since that's above 1024
if [ "${KEEP_PORTS}" != "true" ]; then
    xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
               --update '/x:ncs-config/x:cli/x:ssh/x:port' --value '22' \
               --update '/x:ncs-config/x:webui/x:transport/x:tcp/x:port' --value '80' \
               --update '/x:ncs-config/x:webui/x:transport/x:ssl/x:port' --value '443' \
               --update '/x:ncs-config/x:netconf-north-bound/x:transport/x:ssh/x:port' --value '830' \
               $CONF_FILE

    # enable SSH CLI, NETCONF over SSH northbound, NETCONF call-home and RESTCONF
    xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
               --update '/x:ncs-config/x:cli/x:ssh/x:enabled' --value 'true' \
               --update '/x:ncs-config/x:netconf-north-bound/x:transport/x:ssh/x:enabled' --value 'true' \
               --update '/x:ncs-config/x:netconf-call-home/x:enabled' --value 'true' \
               --update '/x:ncs-config/x:restconf/x:enabled' --value 'true' \
               $CONF_FILE

    # enable webUI with no TLS on port 80
    xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
               --update '/x:ncs-config/x:webui/x:transport/x:tcp/x:enabled' --value 'true' \
               $CONF_FILE

    # enable webUI with TLS on port 443
    xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
               --update '/x:ncs-config/x:webui/x:transport/x:ssl/x:enabled' --value 'true' \
               $CONF_FILE
fi

# switch to local auth per default
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           --update '/x:ncs-config/x:aaa/x:pam/x:enabled' --value 'false' \
           --update '/x:ncs-config/x:aaa/x:local-authentication/x:enabled' --value 'true' \
           $CONF_FILE

# enable unhiding the two common groups 'debug' and 'full'
# This might be a little trickier to understand - we first add two new subnodes
# (-s option) under /ncs-config. They will just be placed at the end, then we
# fill them in by creating the name node in each and setting its value. The
# result looks like:
#
#     ...
#     <hide-group>
#       <name>debug</name>
#     </hide-group>
#     <hide-group>
#       <name>full</name>
#     </hide-group>
#   </ncs-config>
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           -s "/x:ncs-config[not(x:hide-group/x:name='debug')]" -t elem -n hide-group \
           -s "/x:ncs-config/hide-group" -t elem -n name -v debug \
           $CONF_FILE
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           -s "/x:ncs-config[not(x:hide-group/x:name='full')]" -t elem -n hide-group \
           -s "/x:ncs-config/hide-group" -t elem -n name -v full \
           $CONF_FILE

# update/add content-security-policy
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           --update '/x:ncs-config/x:webui/x:content-security-policy' \
             --value "${CONTENT_SECURITY_POLICY}" \
           --subnode '/x:ncs-config/x:webui[not(x:content-security-policy)]' \
             --type elem --name content-security-policy --value "${CONTENT_SECURITY_POLICY}" \
           $CONF_FILE

# don't suppress maapi/system commit messages in the CLI (needed for lux tests)
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           --delete "/x:ncs-config/x:cli/x:suppress-commit-message-context[text()='maapi']" \
           $CONF_FILE
xmlstarlet edit --inplace -N x=http://tail-f.com/yang/tailf-ncs-config \
           --delete "/x:ncs-config/x:cli/x:suppress-commit-message-context[text()='system']" \
           $CONF_FILE
