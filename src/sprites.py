# sprites.py

import math
import os
import pygame
import random
import numpy

from loader import Loader
from vector import vector

class Animation(object):
    img = None
    fps = 0
    numFrames = 0
    loopTo = 0
    origin = (0, 0)

    def __init__(this, img, numFrames):
        this.img = img
        this.numFrames = numFrames

    @property
    def width(this):
        return int(this.img.get_width()/this.numFrames)

    @property
    def height(this):
        return this.img.get_height()

    def __getitem__(this, fnum):
        fnum = int(fnum)
        if (fnum < 0 or fnum >= this.numFrames):
            fnum = (fnum-this.loopTo) % (this.numFrames-this.loopTo) + this.loopTo
        return this.img.subsurface(fnum*this.width, 0, this.width, this.height)

class Base(pygame.sprite.Sprite):
    def __init__(this, world):
        super(Base, this).__init__()
        this.pos = vector()
        this.vel = vector()
        this.accel = vector()
        this.world = world

    def take_damage(this, dmg):
        pass

    def update_rect(this, camera):
        this.rect.center = (
            int(this.pos[0]) - camera.topleft[0],
            int(this.pos[1]) - camera.topleft[1])

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

    def update(this, dt):
        # Have the projectile rotate as it moves
        this.angle += this.rotSpeed*dt
        this.image = pygame.transform.rotozoom(this.origImage, int(this.angle/90)*90, 1)
        this.pos += this.vel*dt
        this.rect.center = (int(this.pos.x), int(this.pos.y))
        if (this.rect.right > this.world.area.right or
            this.rect.left < this.world.area.left or
            this.rect.top < this.world.area.top or
            this.rect.bottom > this.world.area.bottom):
            this.kill()
            return
        # Check for collisions
        if (this.owner == this.world.player):
            # Check for an enemy collision
            hit = pygame.sprite.spritecollideany(this, this.world.enemies)
            if (hit):
                hit.take_damage(this.damage)
                this.kill()
        else:
            # Check for a collision with the player
            if (this.world.player.colliderect(hit.rect)):
                this.world.player.take_damage(this.damage)
                this.kill()

class TankTurret(Base):
    origImage = None
    angle = 0

    def __init__(this, ship):
        super(TankTurret, this).__init__(ship.world)
        this.origImage = Loader.loader.get("tank/turret.png")
        this.image = this.origImage
        this.rect = this.origImage.get_rect()
        this.ship = ship

    def update(this, dt):
#        this.image = pygame.transform.rotozoom(this.origImage, -this.angle, 1)
#        this.rect.size = this.image.get_size()
        pass

    def update_image(this):
        this.image = pygame.transform.rotozoom(this.origImage, -this.angle, 1)
        this.rect.size = this.image.get_size()
        #this.rect.center = this.ship.rect.center

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
    # The angle of rotation of the ship
    angle = 0
    smokes = None
    maxSmokes = 15
    nextSmoke = 0
    smoking = False

    def __init__(this, world):
        super(Tank, this).__init__(world)
        this.anim = Animation(Loader.loader.get("tank/base.png"), 4)
        this.shotImage = Loader.loader.get("playershot.png")
        this.rect = this.anim[0].get_rect()
        this.turret = TankTurret(this)
        this.smokes = pygame.sprite.Group()
        this.frame = 0

    # Have the turret at the given position
    def point_to(this, pos):
        this.turret.angle = math.degrees(math.atan2(pos[1]-this.rect.center[1], pos[0]-this.rect.center[0]))

    # Returns a unit vector pointing in the forward direction for this ship
    @property
    def forward(this):
        return vector.from_angle(this.angle)

    @property
    def level(this):
        return this.world.level

    def update(this, dt):
        vel = vector(0,0)
        if (this.controlForward):
            vel += vector(0,-1)
        elif (this.controlBackward):
            vel += vector(0,1)
        if (this.controlLeft):
            vel += vector(-1,0)
        elif (this.controlRight):
            vel += vector(1,0)

        this.vel = vel.unit()*this.maxSpeed
        if (abs(this.vel) > 0):
            this.angle = -this.vel.angle
            this.frame -= 10*dt

        this.image = pygame.transform.rotozoom(this.anim[this.frame], this.angle, 1)

        # Update the position (centre of the square)
        newpos = this.pos + this.vel*dt
        # Check if the new position is blocked by the terrain
        (r, c, off) = this.level.map_to_grid(newpos.toint())
        if (not this.level.check_solid(r, c)):
            this.pos = newpos

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
        this.anim = Animation(Loader.loader.get("pod.png"), 6)
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
        smoke = Explosion(this.world)
        smoke.pos = this.pos
        smoke.vel = this.vel
        this.world.explosions.add(smoke)

        smoke = Smoke(this.world)
        smoke.pos = this.pos
        smoke.vel = this.vel
        this.world.explosions.add(smoke)

        this.kill()

class Smoke(Base):
    frames = None

    def __init__(this, world):
        super(Smoke, this).__init__(world)
        smokeImg = Loader.loader.get("smoke-mask.png")
        if (not Smoke.frames):
            Smoke.frames = []
            nframes = 10
            for n in range(nframes):
                value = (nframes-n)/float(nframes)
                scale = (1.2/nframes)*(n+1)
                img = pygame.transform.rotozoom(smokeImg, 0, scale)

                alpha = pygame.surfarray.pixels_alpha(img)
                multAlpha = alpha * (value**0.5)
                alpha[:] = multAlpha.astype(numpy.uint8)

                Smoke.frames.append(img)

        this.frame = 0
        this.fps = 10+random.random()*2
        this.image = this.frames[0]
        this.rect = this.image.get_rect()

    def update(this, dt):
        this.pos += this.vel*dt/4
        this.frame += dt*this.fps
        if (this.frame >= len(this.frames)):
            this.kill()
            return
        this.image = this.frames[int(this.frame)]
        this.rect.size = this.image.get_size()
        this.rect.center = (int(this.pos.x), int(this.pos.y))

class Explosion(Base):
    frames = None

    def __init__(this, world):
        super(Explosion, this).__init__(world)
        expImg = Loader.loader.get("explosion-mask.png")
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

    def update(this, dt):
        this.pos += this.vel*dt/4
        this.frame += dt*this.fps
        if (this.frame >= len(this.frames)):
            this.kill()
            return
        this.image = this.frames[int(this.frame)]
        this.rect.size = this.image.get_size()
        this.rect.center = (int(this.pos.x), int(this.pos.y))

