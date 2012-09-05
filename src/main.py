#!/usr/bin/env python

import pygame
import sys
import math
import random
import site
import os

site.addsitedir(os.path.join("..", "..", "pgu"))

from pgu import gui
from world import World

random.seed(1)

#############
# Constants #
#############

MAIN_MENU = ("New game", "Options", "Credits", "Quit")

MAIN_NEW = 0
MAIN_OPTIONS = 1
MAIN_CREDITS = 2
MAIN_QUIT = 3

########
# Main #
########

# Init pygame
pygame.display.init()
pygame.font.init()

display = pygame.display.set_mode((800,600))

app = gui.Desktop(theme=gui.Theme("clean"))
app.theme.configure("""
[desktop]
background = #FFFF00

[button.label]
color = #a000d0
font = Vera.ttf 20

[button.label:down]
color = #900080

[button#mainmenu]
width = 200

[table#options]
vpadding = 10

[label#options]
font = Vera.ttf 20
""")

app.style.background = pygame.Surface(display.get_size())
app.style.background.fill((255,0,0))

def show_options_menu():
    # Options menu
    table = gui.Table(width=200, height=-1, name="options")
    table.tr()
    table.td(gui.Spacer(150, 10))
    table.td(gui.Spacer(10, 10))

    # Brightness slider
    table.tr()
    table.td(gui.Label("Brightness:", name="options"))
    table.td(gui.HSlider(value=0, min=0, max=100, size=10, width=200))

    # Volume slider
    table.tr()
    table.td(gui.Label("Volume:", name="options"))
    table.td(gui.HSlider(value=0, min=0, max=100, size=10, width=200))

    # Fullscreen
    g = gui.Group()
    table.tr()
    table.td(gui.Label("Fullscreen:", name="options"))
    table.td(gui.Checkbox(g), align=-1)

    # Difficulty
    table.tr()
    table.td(gui.Label("Difficulty", name="options"))

    g = gui.Group()
    tbl = gui.Table(width=200)
    tbl.tr()
    tbl.td(gui.Label("Easy"))
    tbl.td(gui.Label("Normal"))
    tbl.td(gui.Label("Hard"))
    tbl.tr()
    tbl.td(gui.Radio(g, value=0))
    tbl.td(gui.Radio(g, value=1))
    tbl.td(gui.Radio(g, value=2))
    table.td(tbl)

    table.tr()
    table.td(gui.Spacer(10, 10))

    # Back button
    def cb(*args):
        # Save the settings
        # ...
        app.quit()
    btn = gui.Button("Return")
    btn.connect(gui.CLICK, cb)
    table.tr()
    table.td(btn, colspan=2)

    app.init(table)
    app.run()

# Displays the main menu
def show_main_menu():
    table = gui.Table(width=200, height=300)
    table.tr()
    table.td(gui.Spacer(10, 100))
    # The button callback when the user makes a choice
    def choose(num):
        app.choice = num
        app.quit()
    # Pack the buttons
    count = 0
    for label in MAIN_MENU:
        btn = gui.Button(label, name="mainmenu")
        btn.connect(gui.CLICK, choose, count)
        table.tr()
        table.td(btn)
        count += 1
    # Enter into the main loop
    while 1:
        # Show the buttons and wait for the user to click on one
        app.init(table, display)
        app.run()
        if (app.choice == MAIN_OPTIONS):
            show_options_menu()
        elif (app.choice == MAIN_QUIT):
            break

#show_main_menu()

world = World()
world.mainloop()

