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

/* level.js */

function Level(tileset, rows, cols)
{
    /* The layers */
    this.rows = rows;
    this.cols = cols;
    this.ground = new Layer(rows, cols);
    this.midground = new Layer(rows, cols);

    /* The ground terrain (dirt, water, etc) */
    this.groundTerr = new Terrain(tileset, this.ground, DIRT);
    /* The middle ground, being obstacles like trees, walls */
    this.midgroundTerr = new Terrain(tileset, this.midground, NOTHING);

    this.terrainView = new TerrainView(
	[this.groundTerr, this.midgroundTerr], 
	canvas.width, canvas.height);

    this.terrainView.xpos = 15;
    this.terrainView.ypos = this.rows*TILEH*2-3.4*canvas.height;

    /* TODO - maintain a list of visible sprites to speed things up */

    /* Sprite groups for things on the ground, hovering above the ground
     * and those in the air. */
    this.groundSprites = new SpriteGroup();
    this.middleSprites = new SpriteGroup();
    this.airSprites = new SpriteGroup();
    /* The sprites that are considered to be valid targets for the player */
    this.targets = new SpriteGroup();

    this.player = new Player();
    //this.player.controls = new Controls();
    //this.player.img = resources.images.dot2;
    this.player.x = this.terrainView.xpos + 150;
    this.player.y = this.terrainView.ypos + 200;
    this.player.level = this;
    this.player.spawn(this);
    //player.rotation = 0.4;

    this.update = function(dt) 
    {
	//this.terrainView.xpos = ...;
	var bottom = this.terrainView.height*0.7;
	if (this.player.y < this.terrainView.ypos + bottom) {
	    this.terrainView.ypos = this.player.y - bottom;
	}
	this.terrainView.update(dt);
	this.groundSprites.update(dt);
	this.middleSprites.update(dt);
	this.airSprites.update(dt);
    }

    this.draw_frame = function(context)
    {
	context.save();
	//context.scale(1, 0.5);
	try {
	    this.terrainView.render(context, 0, 0);
	    /* The sprite rendering code isn't aware of the terrain view, so
	     * we need to translate the graphics context so the sprites that
	     * should be visible are visible when rendered. */
	    context.translate(
		    -this.terrainView.xpos|0, 
		    -this.terrainView.ypos|0);
	    /* Construct a clipping box for drawing the sprites. We only need
	     * to render the sprites that are visible via the terrain's view */
	    var buf = TILEW*4;
	    var x1 = this.terrainView.xpos-buf;
	    var y1 = this.terrainView.ypos-buf;
	    var x2 = this.terrainView.xpos+this.terrainView.width+buf;
	    var y2 = this.terrainView.ypos+this.terrainView.height+buf;
	    /* Render the sprites in order by depth */
	    this.groundSprites.render(context, x1, y1, x2, y2);
	    this.middleSprites.render(context, x1, y1, x2, y2);
	    this.airSprites.render(context, x1, y1, x2, y2);
	} finally {
	    context.restore();
	}
    }

    /* Returns the terrain type (ground) at the given map position */
    this.get_ground_terrain = function(x, y)
    {
	var row = (y/(2*TILEW))|0;
	var col = (x/(2*TILEW))|0;
	if (row >= 0 && row < this.ground.rows &&
	    col >= 0 && col < this.ground.cols) {
	    return this.ground[row][col];
	}
	return NOTHING;
    }

    /* Checks if the given map position is currently visible */
    this.check_pos_visible = function(x, y)
    {
	return (x >= this.terrainView.xpos &&
		y >= this.terrainView.ypos &&
		x <= this.terrainView.xpos + this.terrainView.width &&
		y <= this.terrainView.ypos + this.terrainView.height);
    }

    this.remove_sprite = function(spr) 
    {
	this.groundSprites.remove(spr);
	this.middleSprites.remove(spr);
	this.airSprites.remove(spr);
	this.targets.remove(spr);
    }

    /* Checks if the given map coordinate is generally passable, or blocked */
    this.check_passable = function(x, y) 
    {
	var row = (y/(2*TILEW))|0;
	var col = (x/(2*TILEW))|0;
	if (row >= 0 && row < this.ground.rows &&
	    col >= 0 && col < this.ground.cols) {
	    return (!(this.ground[row][col] & TERRAIN_META_BLOCKED) && 
		    !(this.midground[row][col] & TERRAIN_META_BLOCKED));
	}
	return false;
    }
}

function generate_level(tileset, rows, cols)
{
    var level = new Level(tileset, rows, cols);

    for (var row = 0; row < rows; row++) {
	for (var col = 0; col < cols; col++) {
	    level.ground[row][col] = GRASS;

/*	    if (Math.random() < 0.5) 
		level.ground[row][col] = WATER;
	    else
		level.ground[row][col] = GRASS;

	    if (level.ground[row][col] == GRASS) {
		if (Math.random() > 0.3) {
		    level.midground[row][col] = TREES;
		} else if (Math.random() > 0.25) {
		    level.midground[row][col] = FLOWERS;
		}
	    }*/
	}
    }

    return level;
}
