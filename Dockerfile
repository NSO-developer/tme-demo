FROM debian:bookworm AS deb-base

RUN apt-get update \
  && echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections \
  && apt-get install -qy --no-install-recommends \
     iputils-ping \
     less \
     libexpat1 \
     libxml2-utils \
     make \
     openssh-client \
     procps \
     python3 \
     python3-pip \
     syslog-ng \
     tcpdump \
     telnet \
     vim-tiny \
     wget \
     xsltproc \
     xmlstarlet \
  && pip3 install --break-system-packages pyyaml \
  && apt-get -qy purge python3-pip \
  && apt-get -qy autoremove \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /root/.cache \
  && echo '. /opt/ncs/current/ncsrc' >> /root/.bashrc \
  # Add root to ncsadmin group for easier command-line tools usage
  && groupadd ncsadmin \
  && usermod -a -G ncsadmin root

RUN ARCH=$(uname -m); \
  if [ "${ARCH}" = "x86_64" ]; then \
    ARCH="x64"; \
  fi; \
  FILENAME=jdk-21_linux-${ARCH}_bin.tar.gz; \
  wget https://download.oracle.com/java/21/latest/${FILENAME}; \
  tar xvf ${FILENAME}; \
  mv jdk-21*/ /usr/local/jdk-21; \
  echo export JAVA_HOME=/usr/local/jdk-21 >> /etc/profile.d/jdk21.sh; \
  echo export PATH=\$PATH:\$JAVA_HOME/bin >> /etc/profile.d/jdk21.sh; \
  rm ${FILENAME};

FROM deb-base AS nso-build

RUN apt-get update \
  && apt-get install -qy --no-install-recommends \
     ant \
     autoconf \
     build-essential \
     curl \
     erlang \
     erlang-dev \
     nodejs \
     npm \
  && apt-get -qy autoremove \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /root/.cache

# Compile and install Lux (for running tests)
RUN curl -L -s https://github.com/hawk/lux/archive/refs/tags/lux-2.6.tar.gz | tar xz -C /tmp \
  && cd /tmp/lux-lux-2.6 && autoconf && ./configure && make && make install \
  && rm -rf /tmp/lux

# Get latest Node.js (the version included with debian is too old)
# RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash - \
#  && apt-get install -qy --no-install-recommends nodejs

# Get latest Node.js (the version included with debian is too old)
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash - \
  && apt-get install -qy --no-install-recommends nodejs

ARG NSO_INSTALL_FILE
COPY $NSO_INSTALL_FILE /tmp/nso
RUN sh /tmp/nso --system-install --non-interactive && rm /tmp/nso

# default shell is ["/bin/sh", "-c"]. We add -l so we get a login shell which
# means the shell reads /etc/profile on startup. /etc/profile includes the files
# in /etc/profile.d where we have ncs.sh that sets the right paths so we can
# access ncsc and other NSO related tools. This makes it possible for
# Dockerfiles, using this image as a base, to directly invoke make for NSO
# package compilation.
SHELL ["/bin/sh", "-lc"]

COPY /system /
COPY /packages /build/packages
WORKDIR /opt/ncs

# Move and compile packages as follows:
# /opt/ncs/packages: packages initially present here have been precompiled and
# are left as is (not compiled again).

# /build/local-packages: each file in the sub-directories here contains the path
# to a local package from the NSO installation. Each package is moved from the
# NSO installation directory to /opt/ncs/packages. If the file is in the
# copy-and-compile sub-directory, it is compiled, otherwise it should be a
# sample NED which has been precompiled and is left as is (not compiled again).

# /build/packages: this is the temporary location for the source packages. Each
# package is moved to /opt/ncs/packages and compiled (and stripped).

# /var/opt/ncs/packages: A symlink is created here to each package finally in
# /opt/ncs/packages.
RUN for local_pkg in $(find /build/local-packages -type f); \
  do \
    read -r pkg_path </${local_pkg}; \
    mv ${NCS_DIR}/${pkg_path} packages/${local_pkg##*/}; \
  done; \
  ls -l packages;

COPY /post-install-fixes /

RUN for local_pkg in $(ls /build/local-packages/copy-and-compile); \
  do \
    make -C packages/${local_pkg}/src clean all || exit 1; \
  done; \
  for pkg_src in $(ls /build/packages); do \
    mv /build/packages/${pkg_src} packages; \
    make -C packages/${pkg_src}/src || exit 1; \
    if make -C packages/${pkg_src}/src -n strip >/dev/null 2>&1; then \
      echo "Found 'strip' target, stripping..."; \
      make -C packages/${pkg_src}/src strip || exit 1; \
    fi; \
  done; \
  for pkg in $(ls packages); do \
    ln -s /opt/ncs/packages/${pkg} /var/opt/ncs/packages; \
  done;

# Remove stuff we don't need/want from the NSO installation \
RUN rm -rf \
  /opt/ncs/current/doc \
  /opt/ncs/current/erlang \
  /opt/ncs/current/examples.ncs \
  /opt/ncs/current/include \
  /opt/ncs/current/lib/ncs-project \
  /opt/ncs/current/lib/ncs/lib/confdc \
  /opt/ncs/current/lib/pyang \
  /opt/ncs/current/man \
  /opt/ncs/current/netsim/confd/erlang/econfd/doc \
  /opt/ncs/current/netsim/confd/src/confd/pyapi/doc \
  /opt/ncs/current/packages \
  /opt/ncs/current/src/aaa \
  /opt/ncs/current/src/build \
  /opt/ncs/current/src/cli \
  /opt/ncs/current/src/configuration_policy \
  /opt/ncs/current/src/errors \
  /opt/ncs/current/src/ncs/pyapi/doc \
  /opt/ncs/current/src/ncs_config \
  /opt/ncs/current/src/netconf \
  /opt/ncs/current/src/package-skeletons \
  /opt/ncs/current/src/project-skeletons \
  /opt/ncs/current/src/snmp \
  /opt/ncs/current/src/tools \
  /opt/ncs/current/src/yang

EXPOSE 22 80 443 830

CMD ["/opt/ncs/run-nso.sh"]


FROM deb-base AS nso-run

COPY --from=nso-build /etc/profile.d /etc/profile.d
COPY --from=nso-build /etc/logrotate.d/ncs /etc/logrotate.d/.
COPY --from=nso-build /etc/ncs /etc/ncs/
COPY --from=nso-build /opt/ncs /opt/ncs/
COPY --from=nso-build /var/opt/ncs /var/opt/ncs
COPY --from=nso-build /root /root

EXPOSE 22 80 443 830 4000

HEALTHCHECK --start-period=60s --interval=5s --retries=3 --timeout=5s CMD /opt/ncs/current/bin/ncs_cmd -c get_phase

CMD ["/opt/ncs/run-nso.sh"]
