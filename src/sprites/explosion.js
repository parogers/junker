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

/* explosion.js */

function Explosion()
{
    /* Constructor */
    Sprite.call(this);

    this.fps = 25;
    this.frame = 0;
}

Explosion.prototype = new Sprite;

Explosion.prototype.spawn = function(level)
{
    this.set_image(resources.explosionFrames[0]);
    this.level = level;
    this.level.airSprites.add(this);
}

Explosion.prototype.update = function(dt)
{
    /* Update the animation frame */
    this.img = resources.explosionFrames[this.frame|0];

    this.frame += this.fps*dt;
    if ((this.frame|0) >= resources.explosionFrames.length)
    {
	this.level.remove_sprite(this);
	return;
    }
}
