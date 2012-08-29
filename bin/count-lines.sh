#!/bin/bash
# count-lines.sh -- created 2011-05-28, Anders Evenrud
# @Last Change: 24-Dez-2004.
# @Revision:    0.0

echo "Core:"
echo -n "  JS Base:       "; cat src/javascript/*.js | wc -l
echo -n "  JS Locales:    "; cat src/javascript/locale/*/*.js | wc -l
echo -n "  CSS Base:      "; cat src/javascript/*.css | wc -l
echo -n "  PHP Sources:   "; cat src/*.php | wc -l
echo -n "  PHP Libs:      "; cat lib/*.php | wc -l
echo -n "  PHP Public:    "; cat header.php public_html/*.php | wc -l
echo -n "  Templates:     "; cat src/templates/*.* | wc -l

echo ""

TOTAL=`cat src/javascript/*.js src/javascript/*.css src/*.php lib/*.php header.php public_html/*.php src/templates/*.* src/javascript/locale/*/*.js | wc -l`
echo "Total: $TOTAL (Excluding Vendor files)"

echo ""

echo "Packages:"
echo -n "  PHP:           "; cat src/packages/*/*.php | wc -l
echo -n "  JS:            "; cat src/packages/*/*.js | wc -l
echo -n "  CSS:           "; cat src/packages/*/*.css | wc -l
echo -n "  XML:           "; cat src/packages/*/*.xml | wc -l
echo -n "  Glade:         "; cat src/packages/*/*.glade | wc -l

echo ""

TOTAL=`cat src/packages/*/*.php src/packages/*/*.js src/packages/*/*.css | wc -l`
echo "Total: $TOTAL (Excluding XML/Glade files)"

# vi: 
