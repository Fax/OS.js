#!/bin/bash
NOW=$(pwd)
cd src/locale/nb_NO.utf8/LC_MESSAGES
rm messages.mo
msgfmt -v messages.po
cd $NOW
cd src/locale/en_US.utf8/LC_MESSAGES
rm messages.mo
msgfmt -v messages.po
cd $NOW
