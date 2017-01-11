/* JUNKER - Arcade tank shooter written in Javascript using HTML5
 * Copyright (C) 2015  Peter Rogers (peter.rogers@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * See LICENSE.txt for the full text of the license.
 */

/* terrain.js */

/* Each terrain type has certain metadata info attached to it (eg whether
 * the terrain is passable to the player, enemies, inflicts player damage, 
 * etc). This is the number of bits reserved for that data */
var TERRAIN_META_BITS = 5;

/* Bit masks for the various terrain metadata properties */
var TERRAIN_META_BLOCKED = 1;
var TERRAIN_META_DESTRUCTABLE = 2;
var TERRAIN_META_PLAYER_DMG = 4;

/* Convenience function for combining a unique ID with a set of flags to
 * make a terrain number. */
function make_terrain(id, flags)
{
    return (id << TERRAIN_META_BITS) | flags;
}

/* The global list of terrain numbers */
var NOTHING  = make_terrain(0, 0);
var DIRT     = make_terrain(1, 0);
var GRASS    = make_terrain(2, 0);
var WATER    = make_terrain(3, 0);
var TREES    = make_terrain(4, TERRAIN_META_BLOCKED);
var FLOWERS  = make_terrain(5, 0);
var CRATER   = make_terrain(6, TERRAIN_META_BLOCKED);
var WALL     = make_terrain(7, TERRAIN_META_BLOCKED);
var FOG      = make_terrain(8, 0);
var STONE    = make_terrain(9, TERRAIN_META_BLOCKED);
var AIRSTRIP = make_terrain(10);
var TRACK    = make_terrain(11);

/* Maps a terrain name (used in terrain data files) to the terrain number
 * used internally. */
var TERRAIN_NAME_MAPPING = {
    "-" : NOTHING,
    "dirt" : DIRT,
    "grass" : GRASS,
    "water" : WATER,
    "trees" : TREES,
    "flowers" : FLOWERS,
    "crater" : CRATER,
    "wall" : WALL,
    "stone" : STONE,
    "fog" : FOG,
    "airstrip" : AIRSTRIP,
    "track" : TRACK,
};

var SE_HOLE_TILE = 0;
var S_TILE = 1;
var SW_HOLE_TILE = 2;
var NW_TILE = 3;
var NE_TILE = 4;
var E_TILE = 5;
var FULL_TILE = 6;
var W_TILE = 7;
var SW_TILE = 8;
var SE_TILE = 9;
var NE_HOLE_TILE = 10;
var N_TILE = 11;
var NW_HOLE_TILE = 12;
var NW_SE_TILE = 13;
var NE_SW_TILE = 14;

var NOTHING_TILE = 49;

var GRASS_TILE_START = 0;
var GRASS_NW_SE_TILE = 46;
var GRASS_NE_SW_TILE = 47;
var GRASS_SW_NE_TILE = 51;
var GRASS_SE_NW_TILE = 52;

var WATER_TILE_START = 15;
var TREES_TILE_START = 30;
var FLOWERS_TILE_START = 55;
var DIRT_TILE = 45;
var GRID_TILE = 50;
var CRATER_TILE_START = 70;
var WALL_TILE_START = 85;
var FOG_TILE_START = 100;
var STONE_TILE_START = 115;
var AIRSTRIP_TILE_START = 130;
var TRACK_TILE_START = 145;

/* Now map the terrain number onto the tile starting position within the 
 * big tile image. */
/*var TERRAIN_TILE_START = {
    NOTHING : NOTHING_TILE,
    DIRT : DIRT_TILE,
    GRASS : GRASS_TILE_START,
    WATER : WATER_TILE_START,
    TREES : TREES_TILE_START,
    FLOWERS : FLOWERS_TILE_START,
    CRATER : CRATER_TILE_START,
    WALL : WALL_TILE_START,
    FOG : FOG_TILE_START,
    STONE : STONE_TILE_START,
};*/

TERRAIN_TILE_START = {}
TERRAIN_TILE_START[NOTHING] = NOTHING_TILE;
TERRAIN_TILE_START[DIRT] = DIRT_TILE;
TERRAIN_TILE_START[GRASS] = GRASS_TILE_START;
TERRAIN_TILE_START[WATER] = WATER_TILE_START;
TERRAIN_TILE_START[TREES] = TREES_TILE_START;
TERRAIN_TILE_START[FLOWERS] = FLOWERS_TILE_START;
TERRAIN_TILE_START[CRATER] = CRATER_TILE_START;
TERRAIN_TILE_START[WALL] = WALL_TILE_START;
TERRAIN_TILE_START[FOG] = FOG_TILE_START;
TERRAIN_TILE_START[STONE] = STONE_TILE_START;
TERRAIN_TILE_START[AIRSTRIP] = AIRSTRIP_TILE_START;
TERRAIN_TILE_START[TRACK] = TRACK_TILE_START;

/* A set of tiles for rendering a tiled grid */
function Tileset(img, tileWidth, tileHeight) 
{
    this.image = img;
    this.rows = img.width / tileHeight;
    this.cols = img.height / tileWidth;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    this.blank = document.createElement("canvas");
    this.blank.width = this.tileWidth;
    this.blank.height = this.tileHeight;
    this.blank.getContext("2d").fillRect(
	0, 0, this.tileWidth, this.tileHeight);

    this.renderTile = function(num, context, destx, desty) {
	var row = Math.floor(num / this.rows);
	var col = num % this.rows;
	context.drawImage(
	    this.image, 
	    col*this.tileWidth, row*this.tileHeight, // source
	    this.tileWidth, this.tileHeight,
	    destx, desty, // dest
	    this.tileWidth, this.tileHeight);
    }
}

/* A simple tiled map of cells. Each cell is a basic terrain type (water, 
 * grass, etc) rather than being a kind of cell to render. (eg corner water
 * piece, side grass piece, etc) */
function Layer(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    //this.depth = depth;
    //for (var dep = 0; dep < depth; dep++) {
    //this[dep] = [];
	for (var row = 0; row < rows; row++) {
	    this[row] = [];
	    for (var col = 0; col < cols; col++) {
		this[row][col] = NOTHING;
	    }
	}
    //}
}

/* Used to render a 'layer' as a tiled map. This class decides how to best
 * render the layer given connections between tiles. (eg grass connects with
 * grass, but not water) It does this by subdividing each cell in the layer
 * into 2x2 cells and rendering each quadrant based on neighbouring 
 * connections. */
function Terrain(tileset, layer, base) {
    this.tileset = tileset;
    this.layer = layer;
    this.base = base;
    this.baseTile = TERRAIN_TILE_START[base];
    this.rows = 2*layer.rows;
    this.cols = 2*layer.cols;
    this.dirty = true;

    /* The grid of subdivided cells */
    this.grid = [];
    for (var row = 0; row < this.rows; row++) {
	this.grid[row] = [];
	for (var col = 0; col < this.rows; col++) {
	    this.grid[row][col] = 0;
	}
    }

    /* Returns the grid position (row, col) and offset for the given
     * map position */
    this.get_cell_pos = function(x, y)
    {
	var row = (y/this.tileset.tileHeight)|0;
	var col = (x/this.tileset.tileWidth)|0;
	var xoffset = x - col*this.tileset.tileWidth;
	var yoffset = y - row*this.tileset.tileHeight;
	return [row, col, xoffset, yoffset];
    }

    this.render = function(context, destx, desty, r1, r2, c1, c2)
    {
/*	r1 = Math.max(r1, 0);
	c1 = Math.max(c1, 0);
	r2 = Math.min(r2, this.rows-1);
	c2 = Math.min(c2, this.cols-1);*/
	var x=0, y=desty, img, sx, sy, num, tile, row, col;

	for (row = r1; row <= r2; row++) {
	    x = destx;
	    for (col = c1; col <= c2; col++) {
		if (col < 0 || col >= this.cols || row < 0 || row >= this.rows)
		{
		    /* Outside of the terrain - render a blank image */
		    if (this.base !== NOTHING) {
			context.drawImage(this.tileset.blank, x, y);
			//this.tileset.renderTile(this.baseTile, context, x, y);
		    }
		} else {
		    /* Render the tile */
		    tile = this.grid[row][col];
		    if (this.baseTile !== undefined) {
			this.tileset.renderTile(this.baseTile, context, x, y);
		    }
		    if (tile !== NOTHING_TILE) {
			this.tileset.renderTile(tile, context, x, y);
		    }
		    //this.tileset.renderTile(GRID_TILE, context, x, y);
/*
		    tile >>= 8;
		    if (tile != 0) {
			this.tileset.renderTile(tile & 0xFF, context, x, y);
		    }*/
		}
		x += this.tileset.tileWidth;
	    }
	    y += this.tileset.tileHeight;
	}
    }

    this.update = function() 
    {
	if (!this.dirty) {
	    return;
	}
	this.dirty = false;
	log_message("updating terrain mapping");

	var row=0, col=0;
	var neTile, nwTile, seTile, swTile;
	var n, s, e, w, ne, nw, se, sw;
	var tile;
	var other;
	var layer = this.layer;
	for (row = 0; row < layer.rows; row++) {
	    for (col = 0; col < layer.cols; col++) {
		n = s = e = w = DIRT;
		ne = nw = se = sw = DIRT;

		if (row > 0) n = layer[row-1][col];
		if (col > 0) w = layer[row][col-1];
		if (row < layer.rows-1) s = layer[row+1][col];
		if (col < layer.cols-1) e = layer[row][col+1];

		/* We only need to check if 'row' is within the range of
		 * possible rows. (so layer[row] always evals to an array)
		 * We don't need to check if 'col' is within range because
		 * layer[row][col] will eval to undefined in that case,
		 * which works with the logic below. */
		if (row > 0) // && col > 0) 
		    nw = layer[row-1][col-1];
		if (row > 0) // && col < layer.cols-1) 
		    ne = layer[row-1][col+1];
		if (row < layer.rows-1) // && col > 0) 
		    sw = layer[row+1][col-1];
		if (row < layer.rows-1) // && col < layer.cols-1)
		    se = layer[row+1][col+1];

		/*n = (row > 0 ? layer[row-1][col] : DIRT);
		s = (row < layer.rows-1 ? layer[row+1][col] : DIRT);
		w = (col > 0 ? layer[row][col-1] : DIRT);
		e = (col < layer.cols-1 ? layer[row][col+1] : DIRT);*/

		/* Figure out which tiles in the eight compass directions
		 * are connected to the current tile */
		current = layer[row][col];

		other = -1;
/*		if (current == GRASS) {
		    other = TREES;
		} else if (current == TREES) {
		    other = GRASS;
		}*/
		n = (n === current || n === other);
		s = (s === current || s === other);
		e = (e === current || e === other);
		w = (w === current || w === other);

		ne = (ne === current || ne === other);
		nw = (nw === current || nw === other);
		se = (se === current || se === other);
		sw = (sw === current || sw === other);

		if (current === NOTHING) {
		    nwTile = NOTHING_TILE;
		    neTile = NOTHING_TILE;
		    swTile = NOTHING_TILE;
		    seTile = NOTHING_TILE;
		} else if (current === DIRT) {
		    /* Dirt is the base tile so it always renders as a 
		     * full block of dirt */
		    nwTile = DIRT_TILE;
		    neTile = DIRT_TILE;
		    swTile = DIRT_TILE;
		    seTile = DIRT_TILE;
		} else {
		    tile = TERRAIN_TILE_START[current];
		    neTile = nwTile = seTile = swTile = tile;

		    /* Upper-left subtile */
		    if (n && w && nw) nwTile += FULL_TILE;
		    else if (n && w) nwTile += NW_HOLE_TILE;
		    else if (n) nwTile += W_TILE;
		    else if (w) nwTile += N_TILE;
		    //else if (current === GRASS && nw) nwTile += GRASS_NW_SE_TILE;
		    else nwTile += NW_TILE;

		    /* Upper-right subtile */
		    if (n && e && ne) neTile += FULL_TILE;
		    else if (n && e) neTile += NE_HOLE_TILE;
		    else if (n) neTile += E_TILE;
		    else if (e) neTile += N_TILE;
		    //else if (current === GRASS && ne) neTile += GRASS_NE_SW_TILE;
		    else neTile += NE_TILE;

		    /* Lower-left subtile */
		    if (s && w && sw) swTile += FULL_TILE;
		    else if (s && w) swTile += SW_HOLE_TILE;
		    else if (s) swTile += W_TILE;
		    else if (w) swTile += S_TILE;
		    //else if (current === GRASS && sw) swTile += GRASS_SW_NE_TILE;
		    else swTile += SW_TILE;

		    /* Lower-right subtile */
		    if (s && e && se) seTile += FULL_TILE;
		    else if (s && e) seTile += SE_HOLE_TILE;
		    else if (s) seTile += E_TILE;
		    else if (e) seTile += S_TILE;
		    //else if (current === GRASS && se) seTile += GRASS_SE_NW_TILE;
		    else seTile += SE_TILE;
		}

		this.grid[2*row][2*col] = nwTile;
		this.grid[2*row][2*col+1] = neTile;
		this.grid[2*row+1][2*col] = swTile;
		this.grid[2*row+1][2*col+1] = seTile;
	    }
	}
    }

    this.update();
}

/* Used for rendering a 2D tiled grid */
function TerrainView(terrains, width, height)
{
    this.terrains = terrains;
    this.terrain = terrains[0];
    /* Upper left corner of the camera within the terrain */
    this.xpos = 0;
    this.ypos = 0;
    this.xoffset = 0;
    this.yoffset = 0;
    this.lastx = null;
    this.lasty = null;

    this.width = width;
    this.height = height;

    this.startRow = 0;
    this.startCol = 0;
    /* Calculate the number of rows and columns that can be displayed
     * on the canvas */
    this.tileWidth = this.terrain.tileset.tileWidth;
    this.tileHeight = this.terrain.tileset.tileHeight;
    this.cols = Math.ceil(width / this.tileWidth)+1;
    this.rows = Math.ceil(height / this.tileHeight)+1;

    /* Create a canvas object to hold the pre-rendered tiles */
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.cols * this.tileWidth;
    this.canvas.height = this.rows * this.tileHeight;
    this.context = this.canvas.getContext("2d");

    /* A temporary canvas setup in case we need to render with double
     * buffering below */
    this.tempCanvas = document.createElement("canvas");
    this.tempCanvas.width = this.cols * this.tileWidth;
    this.tempCanvas.height = this.rows * this.tileHeight;
    this.tempContext = this.tempCanvas.getContext("2d");

    this.renderArea = function(context, destx, desty, r1, r2, c1, c2) 
    {
	context.clearRect(
	    destx, desty, 
	    (c2-c1+1)*this.tileWidth,
	    (r2-r1+1)*this.tileHeight);
	for (var n = 0; n < this.terrains.length; n++) {
	    this.terrains[n].render(this.context, 
				    destx, desty, 
				    r1, r2, c1, c2);
	}
    }

    this.update = function()
    {
	/* Update the terrain layers that are part of this view */
	for (var n = 0; n < this.terrains.length; n++) {
	    this.terrains[n].update();
	}

	/* Calculate the cell position of the camera (upper-left) */
	/*var cellPos = this.terrain.get_cell_pos(this.xpos, this.ypos);
	var row = cellPos[0];
	var col = cellPos[1];
	this.xoffset = cellPos[2];
	this.yoffset = cellPos[3];*/

	var tileset = this.terrain.tileset;
	var row = (this.ypos/tileset.tileHeight)|0;
	var col = (this.xpos/tileset.tileWidth)|0;
	this.xoffset = this.xpos % tileset.tileWidth;
	this.yoffset = this.ypos % tileset.tileHeight;

	if (this.lastx === null || 
	    Math.abs(row-this.startRow) > 1 ||
	    Math.abs(col-this.startCol) > 1) {
	    /* Either this is the first time rendering the map, or the camera
	     * moved far enough that we can't use the time-saving scrolling
	     * trick below. Instead we fully render the terrain */
	    console.log("full render");
	    this.renderArea(this.context, 
			    0, 0,
			    row, row+this.rows-1, 
			    col, col+this.cols-1);
	}
	else
	{
	    /* TODO - Currently this code properly handles scrolling up to
	     * a maximum of one tile size. It could be extended to handle
	     * larger steps (up to two tiles should be okay) */

	    if (row !== this.startRow || col !== this.startCol) {
		/* The camera has moved far enough that some of it's view lies
		 * outside of the rendering area. So shift the map to make room 
		 * for the newly visible area. */
		var dx = (this.startCol-col)*this.tileWidth;
		var dy = (this.startRow-row)*this.tileHeight;

		if (this.terrains[0].base === NOTHING) {
		    /* The rendered terrain (probably) has transparent
		     * areas, so we can't scroll the image by drawing it
		     * back onto itself. We need to use a slightly slower
		     * technique where we render to a temp buffer first */
		    this.tempContext.clearRect(
			0, 0, 
			this.tempCanvas.width, 
			this.tempCanvas.height);

		    var cvs = this.canvas;
		    var ctx = this.context;
		    this.tempContext.drawImage(this.canvas, dx, dy);
		    this.context = this.tempContext;
		    this.canvas = this.tempCanvas;

		    this.tempContext = ctx;
		    this.tempCanvas = cvs;

		} else {
		    this.context.drawImage(this.canvas, dx, dy);
		}
	    }

	    if (row < this.startRow) {
		// The camera has moved up, meaning that relatively the
		// map has moved down exposing the top row
		this.renderArea(this.context, 
				0, 0,
				row, row,
				col, col+this.cols);
	    } else if (row > this.startRow) {
		// The camera has moved down, meaning that relatively the
		// map has moved up exposing the bottom row
		this.renderArea(this.context, 
				0, (this.rows-1)*this.tileHeight,
				row+this.rows-1, row+this.rows-1,
				col, col+this.cols);
	    }

	    if (col < this.startCol) {
		// The camera moved left, or the map moved right exposing
		// the first column.
		this.renderArea(this.context,
				0, 0,
				row, row+this.rows-1,
				col, col);
	    } else if (col > this.startCol) {
		// The camera moved right, or the map moved left
		this.renderArea(this.context,
				this.canvas.width-this.tileWidth, 0,
				row, row+this.rows-1,
				col+this.cols-1, col+this.cols-1);
	    }
	}

	this.startRow = row;
	this.startCol = col;
	this.lastx = this.xpos;
	this.lasty = this.ypos;
    }

    this.render = function(target, destx, desty) {
	/* Renders a terrain (using this camera) onto the target graphics
	 * context at the given  position */
	if (this.xoffset < 0) {
	    throw "Cell X-offset is negative";
	}
	if (this.yoffset < 0) {
	    throw "Cell Y-offset is negative";
	}
	target.drawImage(
	    this.canvas, // source image
	    this.xoffset, this.yoffset, // source
	    this.width, this.height, // source size
	    destx|0, desty|0, // dest
	    this.width, this.height); // dest size
    }
}
