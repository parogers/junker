# loader.py

import os
import pygame

class Loader(object):
    basedir = None
    cache = None

    def __init__(this, basedir):
        this.cache = {}
        this.basedir = basedir

    def has(this, fname):
        return fname in this.cache

    def get(this, fname):
        try:
            return this.cache[fname]
        except:
            img = pygame.image.load(os.path.join(this.basedir, fname)).convert_alpha()
            this.cache[fname] = img
            return img

