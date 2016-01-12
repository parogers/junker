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

/* bomb.js */

function Bomb(x, y, targetX, targetY)
{
    /* Constructor */
    Sprite.call(this);

    this.x = x;
    this.y = y;
    this.startx = x;
    this.starty = y;
    this.speed = 300;
    this.targetX = targetX;
    this.targetY = targetY;
    this.frame = 0;
    this.time = 0;
    this.frames = [];

    var dist = Math.sqrt(Math.pow(x - targetX, 2) + 
			 Math.pow(y - targetY, 2));
    this.duration = dist / 200.0;
}

Bomb.prototype = new Sprite;

Bomb.prototype.spawn = function(level)
{
    this.frames = [
	resources.images.bomb1,
	resources.images.bomb2,
	resources.images.bomb3,	
	resources.images.bomb3,	
	resources.images.bomb2,	
	resources.images.bomb2,	
	resources.images.bomb1,
	resources.images.bomb1,
    ];
    this.set_image(this.frames[0]);
    this.level = level;
    this.level.airSprites.add(this);
}

Bomb.prototype.update = function(dt)
{
    this.time += dt;
    if (this.time > this.duration) 
    {
	/* The bomb explodes */
	//resources.explodeAudio.play();
	var exp = new MultiExplosion(this.x, this.y, 50, 2);
	exp.spawn(this.level);
	this.level.remove_sprite(this);
	return;
    }

    /* Shows the bomb getting bigger, then smaller as it approaches the 
     * target. */
    var n = Math.round((this.time / this.duration) * (this.frames.length-1));
    this.set_image(this.frames[n]);

    /* Update the bomb position */
    var tm = Math.sin(Math.PI * (this.time/this.duration)/2);
    //tm = Math.pow(tm, 0.7);
    this.x = this.startx + tm * (this.targetX - this.startx);
    this.y = this.starty + tm * (this.targetY - this.starty);

    /* Remove the shot when it's no longer on screen */
    if (!this.level.check_pos_visible(this.x, this.y)) 
    {
	this.level.remove_sprite(this);
    }
}
