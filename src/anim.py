# anim.py

import pygame

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
    def size(this):
        return (this.width, this.height)

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
