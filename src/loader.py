# loader.py

import os
import pygame

from anim import Animation
from level import Level

class Loader(object):
    basedir = None
    cache = None

    def __init__(this, basedir):
        this.cache = {}
        this.basedir = basedir

    def has(this, fname):
        return fname in this.cache

    def load_image(this, fname):
        try:
            return this.cache[fname]
        except:
            img = pygame.image.load(os.path.join(this.basedir, fname)).convert_alpha()
            this.cache[fname] = img
            return img

    def load_sound(this, fname, vol=1):
        try:
            return this.cache[fname]
        except:
            snd = pygame.mixer.Sound(os.path.join(this.basedir, "sound", fname))
            snd.set_volume(vol)
            this.cache[fname] = snd
            return snd

    def load_animation(this, fname, nframes):
        img = this.load_image(fname)
        return Animation(img, nframes)

    def load_level(this, fname, tileMapping):
        (base, ext) = os.path.splitext(fname)
        height = 0
        lvl = Level()
        while 1:
            path = "%s-%d%s" % (base, height, ext)
            try:
                img = this.load_image(os.path.join("levels", path)).convert_alpha()
            except pygame.error:
                break

            for x in range(img.get_width()):
                for y in range(img.get_height()):
                    (r, g, b, a) = img.get_at((x, y))
                    if (a == 255):
                        terrain = tileMapping[r,g,b]
                        if (terrain):
                            lvl[y,x,height] = terrain
            height += 1
        return lvl
