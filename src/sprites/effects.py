# effects.py

import pygame
import random
import time
import numpy

from base import Base
from vector import vector
from loader import Loader
from anim import Animation

class Fire(Base):
    def __init__(this, world, duration=None):
        super(Fire, this).__init__(world)
        this.anim = Loader.loader.load_animation("fire.png", 2, scale=1.2)
        this.frame = 0
        this.fps = 6
        this.nextSmoke = 0
        this.duration = duration

    def update(this, dt):
        this.frame += this.fps*dt
        this.image = this.anim[this.frame]
        if (this.duration != None):
            this.duration -= dt
            if (this.duration <= 0):
                # Expired
                this.kill()
                return

        if (time.time() > this.nextSmoke):
            # Create some smoke and add it to the smoke layer (above explosions)
            smoke = Smoke(
                this.world, 
                this.pos + vector(0, this.image.get_height()/3), 
                size=40)
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
        this.image = pygame.transform.rotozoom(
            this.origImage, int(this.angle/90)*90, 1)
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
            #if (this.level[r,c,0].solid):
            for h in range(this.level.maxHeight+1):
                if (not this.level[r,c,h].destructable and
                    not this.level[r,c,h].solid):
                    continue
                smoke = Explosion(this.world, this.pos)
                this.world.explosions.add(smoke)
                this.kill()
                if (not this.level[r,c,h].destructable):
                    break
                # Replace the terrain with a burnt patch of ground
                del this.level[r,c,h]
                this.level.update_cache_single((r, c, h))
                this.level.fill_area(r, r, c, c, h, "burnt2")

                for n in range(random.randint(1, 3)):
                    fire = Fire(this.world, duration=random.uniform(2,8))
                    fire.pos = (this.pos + 
                                random.uniform(3,8)*
                                vector.from_angle(random.uniform(0,360)))
                    fire.frame = random.uniform(0,10)
                    fire.fps = random.uniform(5,10)
                    this.world.explosions.add(fire)
                # Play the explosion sound
                this.world.explodeSnd.play()
                break
        else:
            # Check for a collision with the player
            if (this.world.player.colliderect(hit.rect)):
                this.world.player.take_damage(this.damage)
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
