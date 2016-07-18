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

/* sprite.js - The Sprite and SpriteGroup code and concepts are directly
 * inspired by pygame sprite code. */

/* Global counter for sprite IDs, so that each sprite created gets a 
 * unique identifier. (useful for storing in dictinoaries) */
var SpriteID = 0;

/* Sprite */
function Sprite(img) {
    /* Unique identifier for the sprite (useful for storing sprites in 
     * dictionaries) */
    this.id = SpriteID++;
    this.img = img || null;
    /* The position of the sprite within the map (the centre point) */
    this.x = 0;
    this.y = 0;
    /* The sprites angle of rotation */
    this.rotation = 0;
    /* The centre of the sprite relative to the upper-left corner of 
     * it's rendered image. */
    if (img) {
	this.offsetX = img.width/2;
	this.offsetY = img.height/2;
    } else {
	this.offsetX = 0;
	this.offsetY = 0;
    }
}

Sprite.prototype.set_image = function(img)
{
    this.img = img;
    this.offsetX = img.width/2;
    this.offsetY = img.height/2;
}

Sprite.prototype.width = function()
{
    return this.img.width;
}

Sprite.prototype.height = function()
{
    return this.img.height;
}

Sprite.prototype.update = function(dt)
{
}

Sprite.prototype.check_collision = function(x, y)
{
    return (x >= this.x - this.offsetX && 
	    y >= this.y - this.offsetY &&
	    x < this.x - this.offsetX + this.width() &&
	    y < this.y - this.offsetY + this.height());
}

/* Have the sprite move in the given direction, possibly sliding along
 * any obstacle terrain that might be in the way */
Sprite.prototype.do_normal_move = function(dx, dy)
{
    if (this.level.check_passable(this.x+dx, this.y+dy)) {
	/* The way is clear */
	this.x += dx;
	this.y += dy;
    } else if (dy && this.level.check_passable(this.x, this.y+dy)) {
	/* We can move forward/backward */
	this.y += dy;
    } else if (dx && this.level.check_passable(this.x+dx, this.y)) {
	/* We can move left/right */
	this.x += dx;
    }
}

/* SpriteGroup */
function SpriteGroup() {
    this.sprites = {};
}

SpriteGroup.prototype.render = function(context, clipx1, clipy1, clipx2, clipy2)
{
    for (var id in this.sprites)
    {
	var sprite = this.sprites[id];
	if (sprite.x < clipx1 || sprite.y < clipy1 ||
	    sprite.x > clipx2 || sprite.y > clipy2 || !sprite.img) {
	    continue;
	}

	if (sprite.rotation !== 0) {
	    /* Draw the sprite rotated */
	    context.save();
	    try {
		context.translate(
		    sprite.x|0, 
		    sprite.y|0);
		context.rotate(sprite.rotation);
		context.drawImage(
		    sprite.img, -sprite.offsetX, -sprite.offsetY);
	    } finally {
		context.restore();
	    }

	} else {
	    /* Draw the sprite normally, not rotated */
	    context.drawImage(
		sprite.img, 
		(sprite.x-sprite.offsetX), 
		(sprite.y-sprite.offsetY));
	}
    }
}

SpriteGroup.prototype.clear = function(context, bg)
{
    for (var id in this.sprites)
    {
	var sprite = this.sprites[id];
	var w = sprite.width();
	var h = sprite.height();
	var srcx = sprite.x|0;
	var srcy = sprite.y|0;

	if (sprite.rotation !== 0) {
	    /* TODO - buggy */
	    /* Clear the rotated position of the sprite */
	    context.save();
	    context.translate(
		(sprite.x-sprite.offsetX)|0-1, 
		(sprite.y-sprite.offsetY)|0-1);
	    context.rotate(sprite.rotation);
	    srcx -= 1;
	    srcy -= 1;
//	    w += 2;
//	    h += 2;
	    if (srcx < 0) srcx = 0;
	    if (srcy < 0) srcy = 0;

	    context.drawImage(
		bg, 
		srcx, srcy, // source
		w, h,
		0, 0, // dest
		w+2, h+2);
	    context.restore();

	} else {
	    /* Clear the sprite using the normal method */
	    if (srcx < 0) srcx = 0;
	    if (srcy < 0) srcy = 0;
	    context.drawImage(
		bg, 
		srcx, srcy, // source
		w, h,
		(sprite.x-sprite.offsetX)|0, 
		(sprite.y-sprite.offsetY)|0, // dest
		w, h);
	}
    }    
}

/* Add a sprite to this group */
SpriteGroup.prototype.add = function(sprite) {
    this.sprites[sprite.id] = sprite;
}

/* Remove a sprite from this group */
SpriteGroup.prototype.remove = function(sprite) {
    if (this.sprites[sprite.id]) {
	delete this.sprites[sprite.id];
    }
}

/* Call the 'update' function on all sprites in this group */
SpriteGroup.prototype.update = function(dt) {
    for (var id in this.sprites) {
	this.sprites[id].update(dt);
    }
}

/* Returns the (first) sprite that collides with the given map pos */
SpriteGroup.prototype.check_collision = function(x, y)
{
    var sprite = null;
    for (var id in this.sprites) 
    {
	if (this.sprites[id].check_collision(x, y)) {
	    return this.sprites[id];
	}
   }
    return null;
}
