#!/bin/bash

SRC=quran

echo "<?xml version=\"1.0\" encoding=\"utf-8\" ?>"
echo "<quran>"
sura=1
basmala=`head -n 1 $SRC/001.txt | sed -e 's/\(.*\) \xDB\x9D.*$/\1/'`
for i in $SRC/???.txt; do
    aya=1

    echo "<sura index=\"$sura\">"
    sura=`expr $sura + 1`

    cat $i | sed -e 's/\(.*\) *\xDB\x9D *[^ ]* *\( *.*\)$/\1\2/' | while read l; do
	if [ $aya -eq 1 ]; then
	    if [ $sura -eq 1 ]; then
		echo "<aya index=\"$aya\" text=\"$l\" />"
	    elif [ $sura -eq 9 ]; then
		echo "<aya index=\"$aya\" text=\"$l\" />"
	    else
		echo "<aya index=\"$aya\" text=\"$l\" bismillah=\"$basmala\" />"
	    fi
	else
	    echo "<aya index=\"$aya\" text=\"$l\" />"
	fi

	aya=`expr $aya + 1`
    done

    echo "</sura>"

done

echo "</quran>"
