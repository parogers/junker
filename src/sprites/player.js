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

/* player.js */

function Player()
{
    /* Constructor */
    Sprite.call(this);

    this.speed = 120;
    this.frames = [
	resources.images.tankBase1,
	resources.images.tankBase2,
	resources.images.tankBase3,
	resources.images.tankBase4];

    this.directions = [
	[225, 270, -45], // north (west, NA, east)
	[180,   0,   0], // NA    (west, NA, east)
	[135,   90, 45]  // south (west, NA, east)
    ];

    this.gunSprite = null;
}

Player.prototype = new Sprite;

Player.prototype.update = function(dt)
{
    if (this.img == null) 
    {
	/* Setup the player's tank */
	this.set_image(this.frames[0]);

	this.gunSprite = new Sprite(resources.images.tankGun);
	//this.gunSprite.offsetX = this.gunSprite.width()/2;
	//this.gunSprite.offsetY = this.gunSprite.height()/2;
	this.level.middleSprites.add(this.gunSprite);
    }

    this.gunSprite.rotation += 5*dt;

    var dx = 0, dy = 0;
    if (controls.up) dy = -1;
    else if (controls.down) dy = 1;

    if (controls.left) dx = -1;
    else if (controls.right) dx = 1;

    var mag = Math.sqrt(dx*dx + dy*dy);

    if (mag > 0) {
	/* Aim the tank base in the right direction */
	this.rotation = Math.PI*this.directions[dy+1][dx+1]/180;
    }

    if (mag > 0) {
	dx *= this.speed*dt/mag;
	dy *= this.speed*dt/mag;
    }

    /* Check that the new position isn't blocked */
    if (mag > 0)
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

    /* Move the gun sprite back into position */
    this.gunSprite.x = this.x;
    this.gunSprite.y = this.y;
}

function Controls()
{
    this.up = null;
    this.down = null;
    this.left = null;
    this.right = null;
}
