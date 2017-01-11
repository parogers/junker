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

/* fire.js */

function Fire()
{
    /* Constructor */
    Sprite.call(this);

    this.frames = [resources.images.fire1, resources.images.fire2];
    this.fps = 10;
    this.frame = 0;
    this.duration = 0;
}

Fire.prototype = new Sprite;

Fire.prototype.spawn = function(level)
{
    this.set_image(this.frames[0]);
    this.level = level;
    this.level.airSprites.add(this);
}

Fire.prototype.update = function(dt)
{
    /* Update the animation */
    this.img = this.frames[Math.round(this.frame) % this.frames.length];
    this.frame += this.fps*dt;
    if (this.duration > 0 && this.frame > this.duration)
    {
	this.level.remove_sprite(this);
	return;
    }
}
