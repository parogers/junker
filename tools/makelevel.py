#!/usr/bin/env python

import tempfile
import subprocess
import re
import os
import argparse
import sys
import PIL, PIL.Image
import json

import imposition

TILE_MAPPING = {
    (0,0,0) : "-",
    (0,255,0) : "grass",
    (0,0,255) : "water",
    (0,0,200) : "sea",
    (128,128,128) : "road",
    (255,255,0) : "dirt",
    (0,128,0) : "trees",
    (128,128,128) : "stone",
    (80,80,80) : "wall",
    }

# Come up with a mapping for terrain name to number
TERRAIN_NAMES = list(sorted(TILE_MAPPING.values()))

def extract_level_info(src):
    # Extract the comment (contains extra level info)
    proc = subprocess.Popen(["exiftool", "-comment", "-b", src],
                            stdout=subprocess.PIPE)
    (out, err) = proc.communicate()

def extract_layer(src, name):
    tmp = tempfile.NamedTemporaryFile(suffix=".png")
    proc = subprocess.Popen(
        ["xcf2png", src, name, "-o", tmp.name],
        stderr=subprocess.PIPE)
    proc.wait()

    # Parse the image and generate a layer of terrain
    img = PIL.Image.open(tmp.name)
    (w, h) = img.size
    layer = []
    for y in range(h):
        layer.append([])
        for x in range(w):
            rgb = img.getpixel((x, y))[0:3]
            terr = TILE_MAPPING[rgb]
            layer[-1].append(TERRAIN_NAMES.index(terr))
    return layer

def extract_level_grid(src):
    n = 0
    layers = []
    n += 1

    return layers

#####

parser = argparse.ArgumentParser(
    description="Convert XCF game level to loadable JSON file")

# Required arguments
parser.add_argument("src", type=str, nargs=1, help="source XCF")
parser.add_argument("dest", type=str, nargs=1, help="destination file")

args = parser.parse_args(sys.argv[1:])

src = args.src[0]
dest = args.dest[0]

# Extract level info from the XCF file
extract_level_info(src)
#layers = extract_level_grid(src)

#out = {"terrains" : TERRAIN_NAMES, "layers" : layers}

ground = extract_layer(src, "ground")
midground = extract_layer(src, "midground")

out = {"terrains" : TERRAIN_NAMES,
       "ground" : ground,
       "midground" : midground}

fd = file(dest, "w")
fd.write(json.dumps(out))
fd.close()

