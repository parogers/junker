# world.py

import os
import time
import math
import pygame
import random
from loader import Loader
from random import randint

from vector import vector
from sprites import Tank, Enemy, GunTurretBase
from level import Tileset, Level, Camera

class World(object):
    size = None
    ships = None
    enemies = None
    midground = None
    foreground = None
    tilesets = None

    def __init__(this):
        # Create a display
        this.display = pygame.display.set_mode((800, 600))
        pygame.display.set_caption("JUNKER")
        this.tilesets = {}

        Loader.loader = Loader(os.path.join("..", "media"))

        # Load various sounds
        this.explodeSnd = Loader.loader.load_sound("explode2.wav", vol=0.2)
        this.shotSnd = Loader.loader.load_sound("shot2.wav", vol=0.5)
        this.motorSnd = Loader.loader.load_sound("motor-run.wav", vol=0.5)
        this.motorIdleSnd = Loader.loader.load_sound("motor-idle.wav", vol=0.5)

        this.background = pygame.sprite.RenderUpdates()
        this.midground = pygame.sprite.RenderUpdates()
        this.foreground = pygame.sprite.RenderUpdates()
        this.explosions = pygame.sprite.RenderUpdates()
        this.smokeGroup = pygame.sprite.RenderUpdates()
        this.enemies = pygame.sprite.Group()
        this.setup()

    @property
    def renderGroups(this):
        return (this.background,
                this.midground, 
                this.foreground, 
                this.explosions, 
                this.smokeGroup)

    # Returns the maximum targetting distance for computer AI
    @property
    def maxTargetDist(this):
        return this.disp.get_width()/2

    def setup(this):
        # Load the terrains
        for (name, fname, solid, destructable) in (
            ("grass",  "grass.png",   False, False),
            ("water",  "water.png",   False, False),
            ("sea",    "water.png",   False, False),
            ("dirt",   "dirt.png",    False, False),
            ("stone",  "stone.png",   True,  False),
            ("tree",   "tree.png",    True,  True),
            ("burnt",  "burnt.png",   False, False),
            ("burnt2", "burnt2.png",  False, False),
            ("wall",   "wall.png",    True,  False),
            ):
            terr = Tileset(name, Loader.loader.load_image(
                    os.path.join("terrains", fname)))
            terr.solid = solid
            terr.destructable = destructable
            this.tilesets[terr.name] = terr

        this.tilesets["sea"].add_connection(this.tilesets["water"])

        this.player = Tank(this)
        this.player.pos = vector(0, 0)
        this.player.velAngle = 50
        #this.player.world = this
        this.midground.add(this.player)
        this.foreground.add(this.player.turret)

        gun = GunTurretBase(this)
        gun.pos = vector(430, 3600)
        this.background.add(gun)
        this.foreground.add(gun.turret)
        this.enemies.add(gun)

        gun = GunTurretBase(this)
        gun.pos = vector(230, 3600)
        this.background.add(gun)
        this.foreground.add(gun.turret)
        this.enemies.add(gun)

        for n in range(50):
            e = Enemy(this)
            e.world = this
            e.pos = vector(100, 100)
            e.vel = vector.from_angle(random.randint(0, 360))*50
            this.enemies.add(e)
            this.midground.add(e)

    def mainloop(this):
        rows = 100
        cols = 20

        #this.level = generate_level(this, (rows, cols))

        tileMapping = {
            (0,0,0) : None,
            (0,255,0) : "grass",
            (0,0,255) : "water",
            (0,0,200) : "sea",
            (128,128,128) : "road",
            (255,255,0) : "dirt",
            (0,128,0) : "tree",
            (128,128,128) : "stone",
            (80,80,80) : "wall",
        }

        this.level = Loader.loader.load_level("testlevel.png", tileMapping)
        this.level.world = this
        #this.level = generate_level(this, (rows, cols))

        this.level.update_cache()

        cam = Camera()

        # Main loop
        fps = 60
        done = False
        clock = pygame.time.Clock()

        this.area = this.display.get_rect().inflate(-10,-10)

        cam.level = this.level
        cam.size = this.display.get_size()
        cam.pos = (this.display.get_width()/2, this.display.get_height()/2)
        cam.render()

        bg = cam.surf

        this.disp = this.display
        #this.disp.blit(bg, (0,0))
        #pygame.display.flip()
        lastTime = 0

        (r1, r2, c1, c2) = this.level.calculate_map_area()
        (xpos, ypos) = this.level.grid_to_map(r2-13, (c2-c1)/2)

        this.player.pos = vector(xpos, ypos)

        while not done:
            # Handle events
            for event in pygame.event.get():
                if (event.type == pygame.QUIT or event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                    done = True
            # Handle user input
            keys = pygame.key.get_pressed()
            this.player.controlForward = keys[pygame.K_UP] or keys[pygame.K_w]
            this.player.controlBackward = keys[pygame.K_DOWN] or keys[pygame.K_s]
            this.player.controlLeft = keys[pygame.K_LEFT] or keys[pygame.K_a]
            this.player.controlRight = keys[pygame.K_RIGHT] or keys[pygame.K_d]
            this.player.controlFire = keys[pygame.K_SPACE] or sum(pygame.mouse.get_pressed()) > 0
            # Always have the turret point at the mouse cursor
            pos = cam.camera_to_map(pygame.mouse.get_pos())
            this.player.turret.point_to(pos)

            dt = clock.tick(fps)/1000.0
            #if (int(time.time()) - int(lastTime) > 0):
            #    print 1/dt
            lastTime = time.time()

            # Update the sprites in this level
            for g in this.renderGroups:
                g.update(dt)

            # Center the camera
            #cam.pos = this.player.pos
            cam.pos = (xpos, this.player.pos.y)
            cam.render()

            # Position the sprites on the screen, based on where the camera is 
            # located.
            for g in this.renderGroups:
                for sp in g:
                    sp.update_rect(cam)

            this.display.blit(cam.surf, (0, 0))

            # Render the enemies first so the player always appears on top
            lst = []
            for g in this.renderGroups:
                lst += g.draw(this.disp)

            # Update display
            pygame.display.flip()
