#!/bin/bash
for filename in /var/lib/docker/volumes/openstreetmap-rendered-tiles/_data/dark/*/*/*.png; do
    [ -e "$filename" ] || continue
    convert "$filename" -channel RGB -negate "$filename"
done
