# base.py
import math
import os
import pygame
import random
import numpy
import time

from vector import vector
from loader import Loader
from anim import Animation

class Base(pygame.sprite.Sprite):
    def __init__(this, world):
        super(Base, this).__init__()
        this.pos = vector()
        this.vel = vector()
        this.accel = vector()
        this.world = world
        this.rect = pygame.Rect(0,0,0,0)

    @property
    def level(this):
        return this.world.level

    def take_damage(this, dmg):
        pass

    def update_rect(this, camera):
        if (this.image):
            this.rect.size = this.image.get_size()
        this.rect.center = (
            int(this.pos[0]) - camera.topleft[0],
            int(this.pos[1]) - camera.topleft[1])