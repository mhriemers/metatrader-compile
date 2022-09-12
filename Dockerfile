FROM mhriemers/metatrader-4:sha-7c72d450fdefeb0a8b3a123ca41b6bfc636babed as mt4

FROM mhriemers/metatrader-5:sha-7c72d450fdefeb0a8b3a123ca41b6bfc636babed as mt5

FROM ubuntu:latest

RUN apt-get update && \
    DEBIAN_FRONTEND="noninteractive" apt-get install -y --no-install-recommends \
        ca-certificates \
        wget && \
    rm -rf /var/lib/apt/lists/*

ARG WINE_BRANCH=staging
RUN wget -nc -O /usr/share/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key && \
    . /etc/os-release && \
    wget -nc -P /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/$VERSION_CODENAME/winehq-$VERSION_CODENAME.sources && \
    dpkg --add-architecture i386 && \
    apt-get update && \
    DEBIAN_FRONTEND="noninteractive" apt-get install -y --install-recommends winehq-$WINE_BRANCH && \
    rm -rf /var/lib/apt/lists/*

ENV WINEDLLOVERRIDES mscoree,mshtml=,winebrowser.exe=
ENV WINEDEBUG warn-all,fixme-all,err-alsa,-ole,-toolbar
ENV WINEARCH win64

COPY --from=mt4 ["/root/.wine/drive_c/Program Files/MetaTrader 4/metaeditor.exe", "/metaeditor.exe"]
COPY --from=mt5 ["/root/.wine/drive_c/Program Files/MetaTrader 5/metaeditor64.exe", "/metaeditor64.exe"]

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]