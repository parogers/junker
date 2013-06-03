#!/bin/sh

LEVEL=testlevel
N=0
while xcf2png ${LEVEL}.xcf $N -o ${LEVEL}-$N.png 2> /dev/null; do
	N=$((N+1))
done

