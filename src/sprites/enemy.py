# enemy.py

import random

from base import Base
from vector import vector
from loader import Loader
from anim import Animation

class Enemy(Base):
    frames = None

    def __init__(this, world):
        super(Enemy, this).__init__(world)
        this.anim = Animation(Loader.loader.load_image("pod.png"), 6)
        this.vel = (
            vector.from_angle(random.randint(0,360)) * 
            random.uniform(50, 150))
        this.image = this.anim[0]
        this.rect = this.image.get_rect()
        this.fps = 12
        this.frame = 0

    def update(this, dt):
        this.pos += this.vel*dt
        this.rect.center = (int(this.pos.x), int(this.pos.y))
        
        this.frame += dt*this.fps
        this.image = this.anim[this.frame]

        # Check for collisions with the walls
        border = 15
        area = this.world.area
        if (this.rect.bottom > area.bottom):
            this.vel.y = -abs(this.vel.y)
        elif (this.rect.top < area.top):
            this.vel.y = abs(this.vel.y)
        if (this.rect.right > area.right):
            this.vel.x = -abs(this.vel.x)
        elif (this.rect.left < area.left):
            this.vel.x = abs(this.vel.x)

    def take_damage(this, dmg):
        smoke = Explosion(this.world, this.pos)
        smoke.vel = this.vel
        this.world.explosions.add(smoke)

        smoke = Smoke(this.world, this.pos)
        smoke.vel = this.vel
        this.world.explosions.add(smoke)

        # Play the explosion sound
        this.world.explodeSnd.play()

        this.kill()

class GunTurret(Base):
    def __init__(this, tankBase):
        super(GunTurret, this).__init__(tankBase.world)
        this.origImage = Loader.loader.load_image("gun-turret/turret.png")
        this.image = this.origImage
        this.rect = this.origImage.get_rect()
        this.tankBase = tankBase

class GunTurretBase(Base):
    def __init__(this, world):
        super(GunTurretBase, this).__init__(this)
        this.world = world
        this.anim = Animation(Loader.loader.load_image("gun-turret/base.png"),1)
        this.turret = GunTurret(this)
        this.image = this.anim[0]
        this.rect = this.anim[0].get_rect()

    def update(this, dt):
        #this.rect.size = this.image.get_size()
        #this.rect.center = (int(this.pos.x), int(this.pos.y))
        this.turret.pos = this.pos
