# anim.py

import pygame

class Animation(object):
    img = None
    fps = 0
    numFrames = 0
    loopTo = 0
    origin = (0, 0)

    def __init__(this, imgs):
        #this.img = img
        #this.numFrames = numFrames
        this.images = imgs

    @property
    def numFrames(this):
        return len(this.images)

    @property
    def size(this):
        return (this.width, this.height)

    @property
    def width(this):
        #return int(this.img.get_width()/this.numFrames)
        return this.images[0].get_width()

    @property
    def height(this):
        #return this.img.get_height()
        return this.images[0].get_height()

    @staticmethod
    def fromImage(img, numFrames):
        imgs = []
        width = img.get_width() / numFrames
        for n in range(numFrames):
            imgs.append(
                img.subsurface(n*width, 0, width, img.get_height()))
        return Animation(imgs)

    def __len__(this):
        return len(this.images)

    def __getitem__(this, fnum):
        fnum = int(fnum)
        if (fnum < 0 or fnum >= this.numFrames):
            fnum = (fnum-this.loopTo) % (this.numFrames-this.loopTo)+this.loopTo
        #return this.img.subsurface(fnum*this.width, 0, this.width, this.height)
        return this.images[fnum]

