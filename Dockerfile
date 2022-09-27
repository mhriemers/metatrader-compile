FROM mhriemers/metatrader-4:latest as mt4

FROM mhriemers/metatrader-5:latest as mt5

FROM mhriemers/wine:latest

ENV WINEPREFIX /root/.wine
ENV WINEDLLOVERRIDES mscoree,mshtml=,winebrowser.exe=
ENV WINEDEBUG warn-all,fixme-all,err-alsa,-ole,-toolbar
ENV WINEARCH win64

COPY --from=mt4 ["/root/.wine/drive_c/Program Files/MetaTrader 4/metaeditor.exe", "/metaeditor.exe"]
COPY --from=mt5 ["/root/.wine/drive_c/Program Files/MetaTrader 5/metaeditor64.exe", "/metaeditor64.exe"]

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]