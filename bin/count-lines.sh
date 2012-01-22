#!/bin/bash
# count-lines.sh -- created 2011-05-28, Anders Evenrud
# @Last Change: 24-Dez-2004.
# @Revision:    0.0

echo "Core:"
echo -n "  JS Base:       "; cat src/base/*.js | wc -l
echo -n "  JS Misc:       "; cat public_html/js/utils.js | wc -l
echo -n "  JS Resources:  "; cat src/resources/*.js | wc -l
echo -n "  CSS Base:      "; cat src/base/*.css | wc -l
echo -n "  PHP Sources:   "; cat src/*.php | wc -l
echo -n "  PHP Libs:      "; cat lib/*.php | wc -l
echo -n "  PHP Misc:      "; cat header.php public_html/index.php | wc -l

echo ""

echo "Applications:"
echo -n "  PHP:           "; cat src/apps/*/*.php | wc -l
echo -n "  JS:            "; cat src/apps/*/*.js | wc -l
echo -n "  CSS:           "; cat src/apps/*/*.css | wc -l
echo -n "  XML:           "; cat src/apps/*/*.xml | wc -l
echo -n "  Glade:         "; cat src/apps/*/*.glade | wc -l

echo ""

TOTAL=`cat src/base/*.js src/base/*.css src/resources/*.js src/*.php lib/*.php src/apps/*/*.php src/apps/*/*.js src/apps/*/*.css header.php public_html/index.php public_html/js/utils.js | wc -l`
echo "Total: $TOTAL (Excluding XML/Glade files)"

# vi: 
