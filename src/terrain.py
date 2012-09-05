# terrain.py

TILEW = 8
TILEH = 8
TERRAIN_EMPTY = 0

class Layer(object):
    bg = None

    def __init__(this):
        this.grid = {}

    def __getitem__(this, pos):
        return this.grid.get(pos, None)

    def render(this, surf, dest, r1, r2, c1, c2):
        for r in range(r1, r2+1):
            for c in range(c1, c2+1):
                tileName = this[r,c]
                if (tileName):
                    tile = this.tiles
                    x = dest[0] + (c-c1)*TILEW
                    y = dest[1] + (r-r1)*TILEH

