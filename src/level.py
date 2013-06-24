# level.py

import sys
import pygame

TILEW = 16
TILEH = 16

MIN_HEIGHT = -1

class Tileset(object):
    # Sound effects
    # Dust effect
    # Destructable
    # Solid
    name = None
    size = None
    tiles = None
    solid = False
    destructable = False
    # How much damage the tile can sustain before breaking (0=indestructable)
    damage = 0
    connections = None

    def __init__(this, name, img):
        this.name = name
        this.tiles = {}
        this.connections = [this]
        if (img):
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
        (r, c, h) = pos

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

        name = this.name
        n = this.connects_to(layer[r-1,c,h])
        s = this.connects_to(layer[r+1,c,h])
        w = this.connects_to(layer[r,c-1,h])
        e = this.connects_to(layer[r,c+1,h])
        nw = this.connects_to(layer[r-1,c-1,h])
        ne = this.connects_to(layer[r-1,c+1,h])
        sw = this.connects_to(layer[r+1,c-1,h])
        se = this.connects_to(layer[r+1,c+1,h])

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

    def add_connection(this, other):
        if (not other in this.connections):
            this.connections.append(other)
            other.connections.append(this)

    def connects_to(this, tileset):
        return (tileset in this.connections)

# A level consists of a set of layers with stuff on them (player, enemies, etc)
class Level(object):
    layers = None
    world = None
    bg = None
    rows = 0
    cols = 0
    _tiles = None
    _cached = None
    # If not None, the level instance will track a list of changes made to the map. This is 
    # used by the Camera so it knows what cells have to be redrawn.
    updates = None

    def __init__(this, world=None):
        this.world = world
        #this.rows = rows
        #this.cols = cols
        #this.layers = []
        this.templates = {}
        this.tileWidth = TILEW
        this.tileHeight = TILEH
        this._tiles = {}
        this._cached = {}
        this.maxHeight = 0
        this.empty = Tileset("empty", None)

    # Returns the terrain at the given position (r, c, h)
    def __getitem__(this, pos):
        (r, c, h) = pos
        if (type(r) == slice or type(c) == slice or type(h) == slice):
            # Return an iterator
            pass

        try:
            tile = this._tiles[pos]
        except KeyError:
            return this.empty
        else:
            return this.tilesets[tile]

    def __setitem__(this, pos, value):
        (r, c, h) = pos
        if (isinstance(value, basestring)):
            tile = value
        else:
            tile = value.name
        this.maxHeight = max(this.maxHeight, pos[2])
        this._tiles[pos] = tile

    def __delitem__(this, pos):
        try:
            del this._tiles[pos]
        except KeyError:
            pass

    @property
    def tilesets(this):
        return this.world.tilesets

    def calculate_map_area(this):
        r1 = sys.maxint
        r2 = -sys.maxint
        c1 = sys.maxint
        c2 = -sys.maxint
        for (r, c, h) in this._tiles:
            r1 = min(r1, r)
            r2 = max(r2, r)
            c1 = min(c1, c)
            c2 = max(c2, c)
        return (r1, r2, c1, c2)

    # Converts grid (row, col) to map position (pixels)
    def grid_to_map(this, row, col):
        return (col*TILEW*2 + TILEW, row*TILEH*2 + TILEH)

    # Converts from map (pixel) to grid position
    def map_to_grid(this, rect):
        if (len(rect) == 4):
            # Passed in a rectangle
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
            # Passed in a single point
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

    def render(this, surf, dest, r1, r2, c1, c2):
        #for layer in this.layers:
        for h in range(MIN_HEIGHT, this.maxHeight+1):
            y = dest[1]
            for r in range(r1, r2+1):
                x = dest[0]
                for c in range(c1, c2+1):
                    #tile = layer[r,c]
                    tileset = this[r,c,h]
                    if (this.bg and h == MIN_HEIGHT):
                        bg = this.tilesets[this.bg]["base2"]
                        surf.blit(bg, (x, y))

                    if (tileset != this.empty):
                        (topLeft, topRight, 
                         bottomLeft, bottomRight) = this._cached[r,c,h]

                        surf.blit(tileset[topLeft], (x, y))
                        surf.blit(tileset[topRight], (x+this.tileWidth, y))
                        surf.blit(tileset[bottomLeft], (x, y+this.tileHeight))
                        surf.blit(tileset[bottomRight], 
                                  (x+this.tileWidth, y+this.tileHeight))
                    x += 2*this.tileWidth
                y += 2*this.tileHeight

    # Fill an area of the map with the same tile
    def fill_area(this, r1, r2, c1, c2, h, tile):
        lst = []
        for r in range(r1, r2+1):
            for c in range(c1, c2+1):
                this[r,c,h] = tile
                lst.append((r, c, h))
        this.update_cache_list(lst)

    def update_cache_list(this, lst):
        updates = set()
        for (r, c, h) in lst:
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    updates.add((r+dr, c+dc, h))

        for p in list(updates):
            tileset = this[p]
            if (tileset):
                this._cached[p] = tileset.get_layout(this, p)
            else:
                try:
                    del this._cached[p]
                except KeyError:
                    pass
            if (this.updates != None):
                # Track the update
                this.updates.append(p)

    def update_cache_single(this, pos):
        # Update the tile cache for a cell and it's neighbours
        this.update_cache_list((pos,))

    def update_cache(this):
        # Updating the entire map
        this._cached = {}
        for pos in this._tiles.keys():
            tileset = this[pos]
            if (tileset):
                this._cached[pos] = tileset.get_layout(this, pos)

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
        # Have the level track updates to the terrain
        this._level.updates = []

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

        # Now do the manual updates
        for pos in this.level.updates:
            (r1, r2, c1, c2) = this.gridPos
            (r, c, h) = pos
            dest = (-this.gridOffset[0] + (c-c1)*2*this.level.tileWidth, 
                    -this.gridOffset[1] + (r-r1)*2*this.level.tileHeight)
            this.level.render(this.surf, dest, r, r+1, c, c+1)

        # Clear the updates
        this.level.updates = []
        this.lastPos = this.pos

