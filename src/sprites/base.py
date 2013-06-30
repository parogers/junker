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
    angle = 0
    oldAngle = 0
    frame = 0
    anim = None

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

    # Returns a unit vector pointing in the forward direction for this entity
    @property
    def forward(this):
        return vector.from_angle(this.angle)

    # Have the entity point at the given (map) position
    def point_to(this, pos):
        this.angle = math.degrees(
            math.atan2(pos[1]-this.pos[1],
                       pos[0]-this.pos[0]))

    def take_damage(this, dmg):
        pass

    def update_rect(this, camera):
        if (this.anim):
            this.image = this.anim[int(this.frame)]
            if (this.angle != 0):
                # Rotate the animation too
                this.image = pygame.transform.rotozoom(
                    this.image, -this.angle, 1)
                this.oldAngle = this.angle

        if (this.image):
            this.rect.size = this.image.get_size()
        this.rect.center = (
            int(this.pos[0]) - camera.topleft[0],
            int(this.pos[1]) - camera.topleft[1])
