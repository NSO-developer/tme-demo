#!/bin/bash

source /opt/ncs/current/ncsrc
source /opt/ncs/installdirs
source /etc/profile.d/jdk21.sh
export NCS_CONFIG_DIR NCS_LOG_DIR NCS_RUN_DIR

# install signal handlers
trap sigint_handler INT
trap sigquit_handler QUIT
trap sigterm_handler TERM

sigint_handler() {
    echo "run-nso.sh: received SIGINT, stopping NSO"
    ncs --stop
    stop_netsim
    exit 130 # 128+2
}

sigquit_handler() {
    echo "run-nso.sh: received SIGQUIT, stopping NSO"
    ncs --stop
    stop_netsim
    exit 131 # 128+3
}

sigterm_handler() {
    echo "run-nso.sh: received SIGTERM, stopping NSO"
    ncs --stop
    stop_netsim
    exit 143 # 128+15
}

stop_netsim() {
  if [ -d ${NCS_RUN_DIR}/netsim ]; then
    ncs-netsim --dir ${NCS_RUN_DIR}/netsim stop
  fi
}

# Increase JAVA VM MAX Heap size to 4GB, also enable the new G1 GC in Java 8
export NCS_JAVA_VM_OPTIONS="-Xmx4G -XX:+UseG1GC -XX:+UseStringDeduplication"

# create required directories
mkdir -p /var/log/ncs

# start syslog-ng to stop everything getting sent to stdout
syslog-ng --no-caps

# pre-start scripts
for file in $(ls /etc/ncs/pre-ncs-start.d/*.sh 2>/dev/null); do
    echo "run-nso.sh: running pre start script ${file}"
    ${file}
done

# netsim
if [ -d ${NCS_RUN_DIR}/netsim ]; then
  echo "run-nso.sh: starting netsim"
  ncs-netsim --dir ${NCS_RUN_DIR}/netsim start
fi

# -- start NSO in the background
# The 'set +-m' are for job control monitor mode. As job control monitor mode is
# disabled per default, starting new processes places them in the same process
# group as this script. When ctrl-c is pressed, SIGINT is delivered to all the
# processes in the foreground process group, which would then include ncs. ncs
# is really the Erlang BEAM VM, just renamed, and it doesn't handle ^c well - it
# doesn't shut down ncs cleanly. To avoid this, we enable job control monitor
# mode so that ncs is started as a background task in a different process group,
# thus avoiding sending SIGINT to it on ^c. Instead we can handle SIGINT and
# nicely ask ncs to shut down.
set -m
ncs --cd ${NCS_RUN_DIR} -c ${NCS_CONFIG_DIR}/ncs.conf --foreground --ignore-initial-validation &
NSO_PID="$!"
set +m

# sleep a bit so ncs has a chance to start up IPC port etc
sleep 10
# Wait for NSO to start by continuously ensuring the NSO PID is alive, i.e. that
# NSO hasn't and NSO reports having started up. If CDB is corrupt or there are
# other similar problems during startup, ncs --wait-started will hang, since it
# is waiting for NSO. If NSO has died, there is no point waiting, thus we also
# check for the NSO PID being alive.
echo "run-nso.sh: waiting for NSO to start..."
for I in $(seq 60); do
    if ! kill -s 0 ${NSO_PID} >/dev/null 2>&1; then
        wait ${NSO_PID}
        EXIT_CODE=$?
        echo "run-nso.sh: NSO is dead (exit code ${EXIT_CODE}) - exiting container"
        exit ${EXIT_CODE}
    fi
    ncs --wait-started 10 && break
done

# post-start scripts
for file in $(ls /etc/ncs/post-ncs-start.d/*.sh 2>/dev/null); do
    echo "run-nso.sh: running post start script ${file}"
    ${file}
done

echo "run-nso.sh: startup complete"

# wait forever on the ncs process, we run ncs in background and wait on it like
# this, with a signal handler for INT & TERM so that we upon receiving those
# signals can run ncs --stop rather than having those signals sent raw to ncs
wait ${NSO_PID}
EXIT_CODE=$?
echo "run-nso.sh: NSO exited (exit code ${EXIT_CODE}) - exiting container"
exit ${EXIT_CODE}
