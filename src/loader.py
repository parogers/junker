# loader.py

import os
import pygame

from anim import Animation

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
