#!/usr/bin/env python
#
# JUNKER - Arcade tank shooter written in Javascript using HTML5
# Copyright (C) 2015  Peter Rogers (peter.rogers@gmail.com)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
# See LICENSE.txt for the full text of the license.
#

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
    return out

def extract_layer(src, name):
    tmp = tempfile.NamedTemporaryFile(suffix=".png")
    proc = subprocess.Popen(
        ["xcf2png", src, name, "-o", tmp.name],
        stderr=subprocess.PIPE)
    proc.wait()

    # Parse the image and generate a layer of terrain
    img = PIL.Image.open(tmp.name)
    return img

def extract_terrain(src, name):
    img = extract_layer(src, name)
    (w, h) = img.size
    layer = []
    for y in range(h):
        layer.append([])
        for x in range(w):
            rgb = img.getpixel((x, y))[0:3]
            terr = TILE_MAPPING[rgb]
            layer[-1].append(TERRAIN_NAMES.index(terr))
    return layer

def extract_enemies(src):
    lst = []
    img = extract_layer(src, "enemies")
    for x in range(img.size[0]):
        for y in range(img.size[1]):
            rgba = img.getpixel((x, y))
            if (rgba[-1] == 0):
                continue
            try:
                enemy = enemyColours[rgba[0:-1]]
            except KeyError:
                pass
            else:
                lst.append((enemy, x, y))
    return lst

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
info = extract_level_info(src)
enemyColours = {}
for line in info.split("\n"):
    if (line):
        (name, r, g, b) = line.split()
        enemyColours[int(r), int(g), int(b)] = name

ground = extract_terrain(src, "ground")
midground = extract_terrain(src, "midground")
enemies = extract_enemies(src)

out = {"terrains" : TERRAIN_NAMES,
       "ground" : ground,
       "midground" : midground,
       "enemies" : enemies}

fd = file(dest, "w")
fd.write(json.dumps(out))
fd.close()
