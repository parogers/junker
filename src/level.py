# level.py

import pygame

TILEW = 16
TILEH = 16

class Tileset(object):
    # Sound effects
    # Dust effect
    # Destructable
    # Solid
    name = None
    size = None
    tiles = None
    solid = False

    def __init__(this, name, img):
        this.name = name
        this.tiles = {}
        (w, h) = img.get_size()
        cols = 5
        rows = 3
        if (w % cols != 0 or h % rows != 0):
            raise Exception("terrain image wrong size")
        w /= cols
        h /= rows
        this.size = (w, h)

        # Break up the image into the tiles
        row = 0
        col = 0
        for name in (
            "topLeftHole",
            "bottom",
            "topRightHole",
            "topLeft",
            "topRight",

            "right",
            "base",
            "left",
            "bottomLeft",
            "bottomRight",

            "bottomLeftHole",
            "top",
            "bottomRightHole"):
            surf = img.subsurface(col*w, row*h, w, h)
            #setattr(this, name, surf)
            this.tiles[name] = surf
            col += 1
            if (col >= cols):
                row += 1
                col = 0

        base = this["base"]
        surf = pygame.Surface((w*2, h*2)).convert()
        surf.blit(base, (0, 0))
        surf.blit(base, (TILEW, 0))
        surf.blit(base, (TILEW, TILEH))
        surf.blit(base, (0, TILEH))
        this.tiles["base2"] = surf

    def __getitem__(this, name):
        return this.tiles[name]

    def get_layout(this, layer, pos):
        assert(this.name)
        (r, c) = pos

        # n,w
        topLeftDef = {
            (0,0) : "topLeft",
            (1,0) : "left", 
            (0,1) : "top", 
            (1,1) : None,
        }
        # n,e
        topRightDef = {
            (0,0) : "topRight", 
            (1,0) : "right", 
            (0,1) : "top", 
            (1,1) : None
        }
        # s,w
        bottomLeftDef  = {
            (0,0) : "bottomLeft", 
            (1,0) : "left", 
            (0,1) : "bottom", 
            (1,1) : None
        }
        # s,e
        bottomRightDef = {
            (0,0) : "bottomRight", 
            (1,0) : "right", 
            (0,1) : "bottom", 
            (1,1) : None
        }

        (r, c) = pos
        name = this.name
        n = this.connects_to(layer[r-1,c])
        s = this.connects_to(layer[r+1,c])
        w = this.connects_to(layer[r,c-1])
        e = this.connects_to(layer[r,c+1])
        nw = this.connects_to(layer[r-1,c-1])
        ne = this.connects_to(layer[r-1,c+1])
        sw = this.connects_to(layer[r+1,c-1])
        se = this.connects_to(layer[r+1,c+1])

        if (n and w and not nw): 
            topLeft = "bottomRightHole"
        else: 
            topLeft = topLeftDef[n,w]

        if (n and e and not ne): 
            topRight = "bottomLeftHole"
        else:
            topRight = topRightDef[n,e]

        if (s and w and not sw):
            bottomLeft = "topRightHole"
        else: 
            bottomLeft = bottomLeftDef[s,w]

        if (s and e and not se):
            bottomRight = "topLeftHole"
        else: 
            bottomRight = bottomRightDef[s,e]

        if (not topLeft): topLeft = "base"
        if (not topRight): topRight = "base"
        if (not bottomLeft): bottomLeft = "base"
        if (not bottomRight): bottomRight = "base"

        return (topLeft, topRight, bottomLeft, bottomRight)

    def connects_to(this, tileset):
        return (this.name == tileset)

class Layer(object):
    tiles = None
    height = 0
    level = None
    cached = None
    bg = None

    def __init__(this):
        this.tiles = {}
        this.cached = {}

    def __getitem__(this, pos):
        return this.tiles.get(pos, None)

    def __setitem__(this, pos, tile):
        this.tiles[pos] = tile

    @property
    def rows(this):
        return this.level.rows

    @property
    def cols(this):
        return this.level.cols

    def update_cache(this):
        this.cached = {}
        for (r, c) in this.tiles.keys():
            tile = this[r,c]
            if (tile):
                tileset = this.level.tilesets[tile]
                this.cached[r,c] = tileset.get_layout(this, (r, c))

class Level(object):
    tiles = None
    layers = None
    world = None

    def __init__(this, world, rows, cols):
        this.world = world
        this.rows = rows
        this.cols = cols
        this.layers = []
        this.templates = {}
        this.tileWidth = TILEW
        this.tileHeight = TILEH

    @property
    def tilesets(this):
        return this.world.tilesets

    # Converts from map (pixel) to grid position
    def map_to_grid(this, rect):
        if (len(rect) == 4):
            w = 2*this.tileWidth
            h = 2*this.tileHeight
            r1 = int(rect.y / h)
            r2 = int(rect.bottom / h)
            c1 = int(rect.x / w)
            c2 = int(rect.right / w)
            offset = (
                int(rect.x) % w,
                int(rect.y) % h)
            return (r1, r2, c1, c2, offset)
        elif (len(rect) == 2):
            w = 2*this.tileWidth
            h = 2*this.tileHeight
            row = int(rect[1] / h)
            col = int(rect[0] / w)
            offset = (
                int(rect[0]) % w,
                int(rect[1]) % h)
            return (row, col, offset)
        else:
            raise Exception("invalid rect or pos")

    def get_tileset(this, name):
        return this.tilesets[name]

    def update_cache(this):
        for layer in this.layers:
            layer.update_cache()

    def render(this, surf, dest, r1, r2, c1, c2):
        for layer in this.layers:
            y = dest[1]
            for r in range(r1, r2+1):
                x = dest[0]
                for c in range(c1, c2+1):
                    tile = layer[r,c]
                    if (layer.bg):
                        bg = this.tilesets[layer.bg]["base2"]
                        surf.blit(bg, (x, y))

                    if (tile):
                        tileset = this.tilesets[tile]
                        (topLeft, topRight, bottomLeft, bottomRight) = layer.cached[r,c]

                        surf.blit(tileset[topLeft], (x, y))
                        surf.blit(tileset[topRight], (x+this.tileWidth, y))
                        surf.blit(tileset[bottomLeft], (x, y+this.tileHeight))
                        surf.blit(tileset[bottomRight], (x+this.tileWidth, y+this.tileHeight))

                        #pygame.draw.rect(surf, (150,0,0), (x,y,tileset.tileWidth,tileset.tileHeight),1)
                        #pygame.draw.rect(surf, (255,0,0), (x,y,2*tileset.tileWidth,2*tileset.tileHeight),1)
                    x += 2*this.tileWidth
                y += 2*this.tileHeight

    def add_layer(this, layer):
        layer.level = this
        this.layers.append(layer)

    def check_solid(this, row, col):
        for layer in this.layers:
            tile = layer[row,col]
            if (tile):
                tileset = this.tilesets[tile]
                if (tileset.solid): return True
        return False

class Camera(object):
    # Area covered by the camera within the map as a pygame Rect
    _rect = None
    # Rows and columns covered by the camera in the map
    gridPos = None
    gridOffset = None
    # The level being rendered
    _level = None
    # The rendered image of what the camera sees
    surf = None
    tmpsurf = None
    lastPos = None

    def __init__(this):
        this._rect = pygame.Rect(0,0,0,0)

    @property
    def topleft(this):
        return this._rect.topleft

    @property
    def size(this):
        return this._rect.size

    @size.setter
    def size(this, s):
        pos = this._rect.center
        this._rect.size = s
        this._rect.center = pos
        this.surf = pygame.Surface(s).convert()
        this.tmpsurf = pygame.Surface(s).convert()
        # Clear the last position so the next call to 'render' will repaint everything visible
        this.lastPos = None
        this.update_grid_pos()

    @property
    def level(this):
        return this._level

    @level.setter
    def level(this, l):
        this._level = l
        this.lastPos = None

    @property
    def pos(this):
        return this._rect.center

    @pos.setter
    def pos(this, p):
        # Calculate the grid area covered by the new position
        this._rect.center = (int(p[0]), int(p[1]))
        this.update_grid_pos()

    def update_grid_pos(this):
        if (not this.level):
            raise ValueError("camera does not have a level")
        (r1, r2, c1, c2, off) = this.level.map_to_grid(this._rect)
        this.gridPos = (r1, r2, c1, c2)
        this.gridOffset = off

    def render(this):
        if (this.lastPos):
            # Scroll the image over by the amount the camera has moved
            (dx, dy) = (this.pos[0]-this.lastPos[0], this.pos[1]-this.lastPos[1])
            this.tmpsurf.fill((0,0,0))
            this.tmpsurf.blit(this.surf, (-dx, -dy))
            # Fill in the missing bits of the map that are exposed
            if (dx > 0):
                # The camera moved to the right, so relative to the camera the map moved to the left
                r = pygame.Rect((this._rect.right-dx, this._rect.top, dx, this._rect.height))
                (r1, r2, c1, c2, off) = this.level.map_to_grid(r)
                destx = this.tmpsurf.get_width()-dx

            elif (dx < 0):
                # Camera moved left, map moved right
                r = pygame.Rect((this._rect.left, this._rect.top, abs(dx), this._rect.height))
                (r1, r2, c1, c2, off) = this.level.map_to_grid(r)
                destx = 0

            if (dx != 0):
                # Fill in the missing vertical slice of the map
                dest = (destx-off[0], -off[1])
                this.level.render(this.tmpsurf, dest, r1, r2, c1, c2)

            # Now do the same for vertical camera movement
            if (dy > 0):
                # The camera moved down, map moves up
                r = pygame.Rect((this._rect.left, this._rect.bottom-dy, this._rect.width, dy))
                (r1, r2, c1, c2, off) = this.level.map_to_grid(r)
                desty = this.tmpsurf.get_height()-dy

            elif (dy < 0):
                # The camera moved up, map moves down
                r = pygame.Rect((this._rect.left, this._rect.top, this._rect.width, abs(dy)))
                (r1, r2, c1, c2, off) = this.level.map_to_grid(r)
                desty = 0

            if (dy != 0):
                # Fill in the missing horizontal slice of the map
                dest = (-off[0], desty-off[1])
                this.level.render(this.tmpsurf, dest, r1, r2, c1, c2)

            # Swap buffers
            (this.surf, this.tmpsurf) = (this.tmpsurf, this.surf)
        else:
            (r1, r2, c1, c2) = this.gridPos
            this.level.render(this.surf, (-this.gridOffset[0], -this.gridOffset[1]), r1, r2, c1, c2)

        this.lastPos = this.pos

