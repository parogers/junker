# effects.py

import pygame
import random
import time
import numpy

from anim import Animation
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
                this.pos + vector(0, this.anim.height/3), 
                size=40)
            smoke.vel = vector(0, -random.uniform(20, 50))
            this.world.smokeGroup.add(smoke)
            this.nextSmoke = time.time() + random.uniform(0.5, 0.7)

class Shot(Base):
    def __init__(this, owner, img):
        super(Shot, this).__init__(owner.world)
        this.anim = Animation(img)
        this.rotSpeed = 720
        this.angle = 0
        this.lifetime = 1
        this.vel = vector(0, 0)
        #this.rect = this.origImage.get_rect()
        this.owner = owner
        this.damage = 1
        this.lifetime = 1

    def update(this, dt):
        # Have the projectile rotate as it moves
        this.angle += this.rotSpeed*dt
        this.pos += this.vel*dt
        if (this.lifetime < 0):
            this.kill()

        this.lifetime -= dt

        # Check for a collision with the terrain
        (r, c, off) = this.level.map_to_grid(this.pos)
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
            this.level.fill_area(r, r, c, c, h, None)
            this.level.fill_area(r, r, c, c, h, "burnt")
            #this.level.fill_area(r, r+1, c, c+1, h-1, "burnt")

            # Add some random fire near the centre of the tile
            # that was destroyed.
            tilePos = vector(this.level.grid_to_map(r, c))

            for n in range(random.randint(1, 3)):
                fire = Fire(this.world, duration=random.uniform(2,8))
                fire.pos = (tilePos + 
                            random.uniform(3,5)*
                            vector.from_angle(random.uniform(0,360)))
                fire.frame = random.uniform(0,10)
                fire.fps = random.uniform(5,10)
                this.world.explosions.add(fire)
            # Play the explosion sound
            this.world.explodeSnd.play()
            break

        # Check for collisions
        if (this.owner == this.world.player):
            # Owned by the player, check for an enemy collision
            hit = pygame.sprite.spritecollideany(this, this.world.enemies)
            if (hit):
                hit.take_damage(this.damage)
                this.kill()
        #else:
        #    # Check for a collision with the player
        #    if (this.world.player.colliderect(hit.rect)):
        #        this.world.player.take_damage(this.damage)
        #        this.kill()

class Smoke(Base):
    def __init__(this, world, pos=None, size=50):
        super(Smoke, this).__init__(world)
        # We only need to build the smoke animation once, and share it
        # across all smoke instances.
        if (not Smoke.anim):
            smokeImg = Loader.loader.load_image("smoke-mask.png")
            frames = []
            nframes = 10
            for n in range(nframes):
                value = (nframes-n)/float(nframes)
                #scale = (1.2/nframes)*(n+1)
                scale = (1.0/smokeImg.get_width()) * size * (float(n+1)/nframes)
                img = pygame.transform.rotozoom(smokeImg, 0, scale)

                alpha = pygame.surfarray.pixels_alpha(img)
                multAlpha = alpha * (value**0.5)
                alpha[:] = multAlpha.astype(numpy.uint8)

                frames.append(img)
            Smoke.anim = Animation(frames)

        this.frame = 0
        this.fps = 10+random.random()*2
        if (pos): this.pos = pos

    def update(this, dt):
        this.pos += this.vel*dt
        this.frame += dt*this.fps
        if (this.frame >= len(this.anim)):
            # Ran out of frames - animation finished
            this.kill()
            return

class Explosion(Base):

    def __init__(this, world, pos=None):
        super(Explosion, this).__init__(world)
        if (not Explosion.anim):
            expImg = Loader.loader.load_animation("explosion-mask.png", 6)
            frames = []
            for n in range(len(expImg)):
                mask = expImg[n]
                mask = pygame.transform.rotozoom(mask, 0, 1.2)

                img = pygame.Surface(mask.get_size()).convert_alpha()
                # Have the explosion shift colors from red to yellow
                img.fill((255,50+int(200*(n/float(len(expImg)))),50))

                alpha = pygame.surfarray.pixels_alpha(mask)
                #multAlpha = alpha * (value**0.5)
                #alpha[:] = multAlpha.astype(numpy.uint8)

                pygame.surfarray.pixels_alpha(img)[:] = alpha

                frames.append(img)
            Explosion.anim = Animation(frames)

        this.frame = 0
        this.fps = 14
        if (pos): this.pos = pos

    def update(this, dt):
        this.pos += this.vel*dt/4
        this.frame += dt*this.fps
        if (this.frame >= len(this.anim)):
            this.kill()
            return
