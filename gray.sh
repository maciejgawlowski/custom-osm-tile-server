#!/bin/bash
for filename in /var/lib/docker/volumes/openstreetmap-rendered-tiles/_data/gray/*/*/*.png; do
    [ -e "$filename" ] || continue
    convert "$filename" -grayscale Rec709Luma "$filename"
done
