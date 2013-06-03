# sprites.py

import math
import os
import pygame
import random
import numpy
import time

from loader import Loader
from vector import vector
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

class Fire(Base):
    def __init__(this, world):
        super(Fire, this).__init__(world)
        this.anim = Loader.loader.load_animation("fire.png", 2)
        this.frame = 0
        this.fps = 10
        this.nextSmoke = 0

    def update(this, dt):
        this.frame += this.fps*dt
        this.image = this.anim[this.frame]

        if (time.time() > this.nextSmoke):
            # Create some smoke and add it to the smoke layer (above explosions)
            smoke = Smoke(this.world, this.pos + vector(0, this.image.get_height()/3), size=40)
            smoke.vel = vector(0, -random.uniform(20, 50))
            this.world.smokeGroup.add(smoke)
            this.nextSmoke = time.time() + random.uniform(0.5, 0.7)

class Shot(Base):
    def __init__(this, owner, img):
        super(Shot, this).__init__(owner.world)
        this.origImage = img
        this.rotSpeed = 720
        this.angle = 0
        this.lifetime = 1
        this.vel = vector(0, 0)
        this.rect = this.origImage.get_rect()
        this.owner = owner
        this.damage = 1
        this.lifetime = 1

    def update(this, dt):
        # Have the projectile rotate as it moves
        this.angle += this.rotSpeed*dt
        this.image = pygame.transform.rotozoom(this.origImage, int(this.angle/90)*90, 1)
        this.pos += this.vel*dt
        this.rect.center = (int(this.pos.x), int(this.pos.y))
#        if (this.rect.right > this.world.area.right or
#            this.rect.left < this.world.area.left or
#            this.rect.top < this.world.area.top or
#            this.rect.bottom > this.world.area.bottom):
#            this.kill()
#            return
        if (this.lifetime < 0):
            this.kill()

        this.lifetime -= dt

        # Check for collisions
        if (this.owner == this.world.player):
            # Owned by the player, check for an enemy collision
            hit = pygame.sprite.spritecollideany(this, this.world.enemies)
            if (hit):
                hit.take_damage(this.damage)
                this.kill()
            # Check for a collision with the terrain
            (r, c, off) = this.level.map_to_grid(this.pos)
            if (this.level[r,c,0].solid):
                smoke = Explosion(this.world, this.pos)
                this.world.explosions.add(smoke)
                this.kill()
                h = 0
                del this.level[r,c,h]
                this.level.update_cache_single((r, c, h))
                this.level.fill_area(r-1, r+1, c-1, c+1, -1, "burnt2")

                for n in range(random.randint(1, 3)):
                    fire = Fire(this.world)
                    fire.pos = this.pos + random.uniform(0,16)*vector.from_angle(random.uniform(0,360))
                    fire.frame = random.uniform(0,10)
                    fire.fps = random.uniform(5,12)
                    this.world.explosions.add(fire)
                # Play the explosion sound
                this.world.explodeSnd.play()
        else:
            # Check for a collision with the player
            if (this.world.player.colliderect(hit.rect)):
                this.world.player.take_damage(this.damage)
                this.kill()

class TankTurret(Base):
    origImage = None
    angle = 0

    def __init__(this, tankBase):
        super(TankTurret, this).__init__(tankBase.world)
        this.origImage = Loader.loader.load_image("tank/turret.png")
        this.image = this.origImage
        this.rect = this.origImage.get_rect()
        this.tankBase = tankBase

    def update_image(this):
        this.image = pygame.transform.rotozoom(this.origImage, -this.angle, 1)
        this.rect.size = this.image.get_size()

    # Returns the position of the barrel tip
    @property
    def barrelTip(this):
        return vector(*this.pos) + vector.from_angle(this.angle)*20

class Tank(Base):
    angle = 0
    velAngle = 0
    maxSpeed = 100
    origImage = None
    leftImage = None
    rightImage = None
    # The user controls
    controlForward = False
    controlBackward = False
    controlLeft = False
    controlRight = False
    controlShoot = False
    # Number of seconds to wait until we can shoot again
    shootDelay = 0
    # The "cooldown time" for shooting projectiles
    shootCooldown = 0.1
    turret = None
    # The angle of rotation of the tank
    angle = 0
    collisionSize = None
    smokes = None
    maxSmokes = 15
    nextSmoke = 0
    motorSndCh = None
    motorIdleSndCh = None
    smoking = False

    def __init__(this, world):
        super(Tank, this).__init__(world)
        this.anim = Animation(Loader.loader.load_image("tank/base.png"), 4)
        this.shotImage = Loader.loader.load_image("playershot.png")
        this.rect = this.anim[0].get_rect()
        this.turret = TankTurret(this)
        this.smokes = pygame.sprite.Group()
        this.collisionSize = (this.anim.width/2, this.anim.height/2)
        this.frame = 0

    # Have the turret at the given position
    def point_to(this, pos):
        this.turret.angle = math.degrees(math.atan2(pos[1]-this.rect.center[1], pos[0]-this.rect.center[0]))

    # Returns a unit vector pointing in the forward direction for this tank
    @property
    def forward(this):
        return vector.from_angle(this.angle)

    def update(this, dt):
        velx = vector(0,0)
        vely = vector(0,0)
        if (this.controlForward):
            vely = vector(0,-1)
        elif (this.controlBackward):
            vely = vector(0,1)
        if (this.controlLeft):
            velx = vector(-1,0)
        elif (this.controlRight):
            velx = vector(1,0)

        vel = velx + vely

        this.vel = vel.unit()*this.maxSpeed
        if (abs(this.vel) > 0):
            this.angle = -this.vel.angle

        this.image = pygame.transform.rotozoom(this.anim[this.frame], this.angle, 1)

        # Update the position (centre of the square)
        if (abs(this.vel) > 0):
            # Play the motor sound
            if (not this.motorSndCh):
                this.motorSndCh = this.world.motorSnd.play(-1)
            if (this.motorIdleSndCh):
                this.motorIdleSndCh.stop()
                this.motorIdleSndCh = None

            for newpos in (this.pos + this.vel*dt, this.pos + velx, this.pos + vely):
                # Check if the new position is blocked by the terrain
                col = pygame.Rect((0,0), this.collisionSize)
                col.center = newpos.toint()
                (r1, r2, c1, c2, off) = this.level.map_to_grid(col)
                hit = False
                for r in range(r1, r2+1):
                    for c in range(c1, c2+1):
                        for h in range(0, this.level.maxHeight+1):
                            if (this.level[r,c,h].solid):
                                hit = True

                if (not hit):
                    this.pos = newpos
                    this.frame -= 10*dt
                    break
        else:
            if (this.motorSndCh):
                this.motorSndCh.stop()
                this.motorSndCh = None
            if (not this.motorIdleSndCh):
                this.motorIdleSndCh = this.world.motorIdleSnd.play(-1)

        this.rect.size = this.image.get_size()
        this.rect.center = (int(this.pos.x), int(this.pos.y))
        this.turret.update_image()

        if (this.smoking and this.nextSmoke <= 0 and len(this.smokes) < this.maxSmokes):
            # Generate a puff of smoke
            xp = random.normalvariate(this.turret.barrelTip.x, 10)
            yp = random.normalvariate(this.turret.barrelTip.y, 10)
            smoke = Smoke()
            smoke.pos = vector(xp, yp)
            smoke.vel = this.vel
            this.world.explosions.add(smoke)
            this.smokes.add(smoke)
            this.nextSmoke = random.uniform(0.01, 0.3)
        elif (this.nextSmoke > 0):
            this.nextSmoke -= dt

        this.shootDelay -= dt
        if (this.shootDelay < 0):
            this.shootDelay = 0

        (x, y) = this.pos

        if (this.controlFire):
            if (this.shootDelay == 0):
                # Play a shooting sound
                this.world.shotSnd.play()
                # Ready to shoot again
                shot = Shot(this, this.shotImage)
                shot.world = this.world
                shot.pos = vector(*this.turret.barrelTip)
                shot.vel = vector.from_angle(this.turret.angle)*300
                this.shootDelay = this.shootCooldown
                this.world.foreground.add(shot)
                # Make the turret recoil away from the shot
                x -= 2*math.cos(math.radians(this.turret.angle))
                y -= 2*math.sin(math.radians(this.turret.angle))

        this.turret.pos = (x, y)

class Enemy(Base):
    frames = None

    def __init__(this, world):
        super(Enemy, this).__init__(world)
        this.anim = Animation(Loader.loader.load_image("pod.png"), 6)
        this.vel = vector.from_angle(random.randint(0,360)) * random.uniform(50, 150)
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

class Smoke(Base):
    frames = None

    def __init__(this, world, pos=None, size=50):
        super(Smoke, this).__init__(world)
        smokeImg = Loader.loader.load_image("smoke-mask.png")
        if (not Smoke.frames):
            Smoke.frames = []
            nframes = 10
            for n in range(nframes):
                value = (nframes-n)/float(nframes)
                #scale = (1.2/nframes)*(n+1)
                scale = (1.0/smokeImg.get_width()) * size * (float(n+1)/nframes)
                img = pygame.transform.rotozoom(smokeImg, 0, scale)

                alpha = pygame.surfarray.pixels_alpha(img)
                multAlpha = alpha * (value**0.5)
                alpha[:] = multAlpha.astype(numpy.uint8)

                Smoke.frames.append(img)

        this.frame = 0
        this.fps = 10+random.random()*2
        this.image = this.frames[0]
        this.rect = this.image.get_rect()
        if (pos): this.pos = pos

    def update(this, dt):
        this.pos += this.vel*dt
        this.frame += dt*this.fps
        if (this.frame >= len(this.frames)):
            this.kill()
            return
        this.image = this.frames[int(this.frame)]
        this.rect.size = this.image.get_size()
        this.rect.center = (int(this.pos.x), int(this.pos.y))

class Explosion(Base):
    frames = None

    def __init__(this, world, pos=None):
        super(Explosion, this).__init__(world)
        expImg = Loader.loader.load_image("explosion-mask.png")
        if (not Explosion.frames):
            Explosion.frames = []
            nframes = 6
            w = expImg.get_width()/nframes
            for n in range(nframes):
                #value = (nframes-n)/float(nframes)
                #scale = (1.2/nframes)*(n+1)
                #img = pygame.transform.rotozoom(expImg, 0, scale)
                mask = expImg.subsurface((w*n, 0, expImg.get_height(), w)).convert_alpha()
                mask = pygame.transform.rotozoom(mask, 0, 1.2)

                img = pygame.Surface(mask.get_size()).convert_alpha()
                # Have the explosion shift colors from red to yellow
                img.fill((255,50+int(200*(n/float(nframes))),50))

                alpha = pygame.surfarray.pixels_alpha(mask)
                #multAlpha = alpha * (value**0.5)
                #alpha[:] = multAlpha.astype(numpy.uint8)

                pygame.surfarray.pixels_alpha(img)[:] = alpha

                Explosion.frames.append(img)

        this.frame = 0
        this.fps = 14
        this.image = this.frames[0]
        this.rect = this.image.get_rect()
        if (pos): this.pos = pos

    def update(this, dt):
        this.pos += this.vel*dt/4
        this.frame += dt*this.fps
        if (this.frame >= len(this.frames)):
            this.kill()
            return
        this.image = this.frames[int(this.frame)]
        this.rect.size = this.image.get_size()
        this.rect.center = (int(this.pos.x), int(this.pos.y))

