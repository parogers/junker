# player.py

import pygame
import math

from base import Base
from vector import vector
from loader import Loader
from anim import Animation
from effects import Shot

class TankTurret(Base):
    origImage = None
    angle = 0

    def __init__(this, tankBase):
        super(TankTurret, this).__init__(tankBase.world)
        this.anim = Loader.loader.load_animation("tank/turret.png", 1)
        this.tankBase = tankBase

#    def update_image(this):
#        this.image = pygame.transform.rotozoom(this.origImage, -this.angle, 1)
#        this.rect.size = this.image.get_size()

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
            this.angle = this.vel.angle

        #this.image = pygame.transform.rotozoom(this.anim[this.frame], 
        #                                       this.angle, 1)

        # Update the position (centre of the square)
        if (abs(this.vel) > 0):
            # Play the motor sound
            if (not this.motorSndCh):
                this.motorSndCh = this.world.motorSnd.play(-1)
            if (this.motorIdleSndCh):
                this.motorIdleSndCh.stop()
                this.motorIdleSndCh = None

            for newpos in (this.pos + this.vel*dt, 
                           this.pos + velx, 
                           this.pos + vely):
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

        this.rect.size = this.anim.size
        this.rect.center = (int(this.pos.x), int(this.pos.y))
        #this.turret.update_image()

        if (this.smoking and 
            this.nextSmoke <= 0 and 
            len(this.smokes) < this.maxSmokes):
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
