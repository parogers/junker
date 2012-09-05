# appearance.py

import os
import pygame

class Action(object):
    img = None
    framesByDir = None
    fps = 0
    numFrames = 0
    loopTo = 0
    origin = (0, 0)

    def __init__(this):
        this.framesByDir = {}

    def get_frame(this, dname, fnum):
        lst = this.framesByDir[dname]
        fnum = int(fnum)
        if (fnum >= len(lst)):
            fnum = (fnum-this.loopTo) % (len(lst)-this.loopTo) + this.loopTo
        return lst[fnum]

class AppearanceFactory(object):
    def __init__(this):
        this.actionsByName = {}

    def __getitem__(this, name):
        return this.actionsByName[name]

    def get_frame(this, action, dname, fnum):
        return this.actionsByName[action].get_frame(dname, fnum)

class Appearance(object):
    def __init__(this, appf):
        this.appf = appf
        this.frame = 0
        this._action = "idle"
        this.direction = "south"
        this.paused = False
        this.speed = 1

    def update(this, dt):
        if (not this.paused):
            this.frame += dt*this.appf[this.action].fps*this.speed

    @property
    def action(this):
        return this._action

    @action.setter
    def action(this, act):
        if (act != this._action):
            this._action = act
            this.frame = 0

    @property
    def origin(this):
        return this.appf[this.action].origin

    @property
    def image(this):
        return this.appf.get_frame(this.action, this.direction, this.frame)

