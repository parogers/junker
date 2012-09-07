# world.py

import os
import time
import math
import pygame
import random
from loader import Loader
from random import randint

from vector import vector
from sprites import Tank, Enemy, Shot
from level import Tileset, Level, Camera

def gen_circle(level, centre, size, value, var=0):
    (centR, centC) = centre
    (w, h) = size
    for r in range(centR-h, centR+h+1):
        for c in range(centC-h, centC+h+1):
            if ((r-centR)**2 + (c-centC)**2 <= w*h+1+random.randint(0,var)):
                level[r,c,0] = value

def generate_level(world, size):
    lvl = Level(world, *size)
    lvl.bg = "dirt"

    for r in range(lvl.rows):
        for c in range(lvl.cols):
            lvl[r,c,0] = "grass"

    for n in range(20):
        r = randint(0, lvl.rows-1)
        c = randint(0, lvl.cols-1)
        gen_circle(lvl, (r, c), (3, 3), "water", 2)

    for n in range(10):
        r = randint(0, lvl.rows-1)
        c = randint(0, lvl.cols-1)
        gen_circle(lvl, (r, c), (3, 3), "tree", 2)

    for r in range(lvl.rows):
        lvl[r,0,0] = "stone"
        if (random.random() < 0.8):
            lvl[r,1,0] = "stone"
        lvl[r,lvl.cols-1,0] = "stone"
        if (random.random() < 0.8):
            lvl[r,lvl.cols-2,0] = "stone"

    return lvl

###

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
        #this.disp = pygame.Surface((800,600)).convert()
        this.disp = this.display
        this.tilesets = {}

        Loader.loader = Loader(os.path.join("..", "media"))

        this.midground = pygame.sprite.RenderUpdates()
        this.foreground = pygame.sprite.RenderUpdates()
        this.explosions = pygame.sprite.RenderUpdates()
        this.enemies = pygame.sprite.Group()
        this.setup()

    def setup(this):
        # Load the terrains
        for (name, fname, solid, dmg) in (
            ("grass", "grass.png", False, 0),
            ("water", "water.png", False, 0),
            ("dirt", "dirt.png", False, 0),
            ("stone", "stone.png", True, 1),
            ("tree", "tree.png", True, 1),
            ):
            terr = Tileset(name, Loader.loader.get(os.path.join("terrains", fname)))
            terr.solid = solid
            terr.damage = dmg
            this.tilesets[terr.name] = terr

        this.player = Tank(this)
        this.player.pos = vector(400, 100)
        this.player.velAngle = 50
        this.player.world = this
        this.midground.add(this.player)
        this.foreground.add(this.player.turret)

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

        this.level = generate_level(this, (rows, cols))
        this.level.update_cache()

        cam = Camera()

        # Main loop
        fps = 60
        done = False
        clock = pygame.time.Clock()

        this.area = this.disp.get_rect().inflate(-10,-10)

        cam.level = this.level
        cam.size = this.disp.get_size()
        cam.pos = (this.disp.get_width()/2, this.disp.get_height()/2)
        cam.render()

        bg = cam.surf

        this.disp = this.display
        this.disp.blit(bg, (0,0))
        pygame.display.flip()
        lastTime = 0

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
            # Always have the ship point towards the mouse cursor
            this.player.point_to(pygame.mouse.get_pos())

            dt = clock.tick(fps)/1000.0
            #if (int(time.time()) - int(lastTime) > 0):
            #    print 1/dt
            lastTime = time.time()

            this.midground.update(dt)
            this.foreground.update(dt)
            this.explosions.update(dt)

            cam.pos = this.player.pos
            cam.render()

            for g in (this.midground, this.foreground, this.explosions):
                for sp in g:
                    sp.update_rect(cam)

            this.display.blit(cam.surf, (0, 0))

            # Render the enemies first so the player's square always appears on top
            lst = this.midground.draw(this.disp)
            lst += this.foreground.draw(this.disp)
            lst += this.explosions.draw(this.disp)
            # Update display
            #pygame.transform.scale(this.disp, this.display.get_size(), this.display)
            pygame.display.flip()
            #pygame.display.update(lst)
            # Clear the sprites
            #this.midground.clear(this.disp, bg)
            #this.foreground.clear(this.disp, bg)
            #this.explosions.clear(this.disp, bg)

