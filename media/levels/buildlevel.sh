#!/bin/sh

XCF2PNG=`which xcf2png`
if [ "XCF2PNG" = "" ]; then
	echo "xcf2png not found"
	exit
fi

LEVEL=testlevel
N=0
while xcf2png ${LEVEL}.xcf $N -o ${LEVEL}-$N.png 2> /dev/null; do
	echo Exporting layer $N
	N=$((N+1))
done

