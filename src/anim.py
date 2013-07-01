# anim.py

import pygame

class Animation(object):
    img = None
    fps = 0
    numFrames = 0
    loopTo = 0
    origin = (0, 0)

    def __init__(this, imgs):
        try:
            this.images = tuple(imgs)
        except TypeError:
            # Not actually a list - passed in a single frame
            this.images = (imgs,)

    @property
    def size(this):
        return (this.width, this.height)

    @property
    def width(this):
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
        if (fnum < 0 or fnum >= len(this)):
            fnum = (fnum-this.loopTo) % (len(this)-this.loopTo)+this.loopTo
        return this.images[fnum]

