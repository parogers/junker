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

/* powerup.js */

function Powerup(type)
{
    /* Constructor */
    Sprite.call(this);
    this.origx = null;
    this.origy = null;
    this.time = 0;
    this.type = type;
}

Powerup.prototype = new Sprite;

Powerup.prototype.spawn = function(level)
{
    res = {
	"bomb" : resources.images.powerupBomb,
	"multishot" : resources.images.powerupMultiShot,
	"flameshot" : resources.images.powerupFlameShot,
	"speed" : resources.images.powerupSpeed
    };

    this.set_image(res[this.type]);
    this.level = level;
    this.level.groundSprites.add(this);
}

Powerup.prototype.update = function(dt)
{
    if (this.origx === null) {
	/* First time calling update. Take note of the starting map position
	 * so we can oscillate around it. */
	this.origx = this.x;
	this.origy = this.y;
    }

    this.time += dt;
    this.x = this.origx + 6*Math.cos(4*this.time);
    this.y = this.origy + 3*Math.cos(this.time);

    /* Check if the player collects this powerup */
    if (this.level.player.check_collision(this.x, this.y)) {
	this.level.player.collect_powerup(this);
	this.level.remove_sprite(this);
    }
}

/* Convenience classes */

function SpeedPowerup()
{
    Powerup.call(this, "speed");
}
SpeedPowerup.prototype = Powerup.prototype;

function MultishotPowerup()
{
    Powerup.call(this, "multishot");
}
MultishotPowerup.prototype = Powerup.prototype;

