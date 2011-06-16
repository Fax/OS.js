#!/bin/bash
# count-lines.sh -- created 2011-05-28, Anders Evenrud
# @Last Change: 24-Dez-2004.
# @Revision:    0.0

cat public_html/js/main.js public_html/js/app.* public_html/js/sys.* public_html/css/main.css public_html/css/theme.* public_html/css/app.* public_html/css/sys.* src/*.php src/apps/* | wc -l

# vi: 
