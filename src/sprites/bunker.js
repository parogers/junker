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

function Bunker()
{
    /* Constructor */
    Sprite.call(this);
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.count = 0;
}

Bunker.prototype = new Sprite;

Bunker.prototype.update = function(dt) 
{
    this.count += dt;
    if (Math.floor(this.count/5.0) % 2 == 0) {
	this.set_image(this.openImage);
    } else {
	this.set_image(this.closedImage);
    }
}

/* Called to spawn this sprite into the level */
Bunker.prototype.spawn = function(level)
{
    this.level = level;
    this.openImage = resources.images.bunkerOpen;
    this.closedImage = resources.images.bunkerClosed;
    this.set_image(this.openImage);
    this.level.groundSprites.add(this);
    this.level.targets.add(this);
}

Bunker.prototype.handle_shot_collision = function(shot)
{
    this.health--;
    if (this.health <= 0) {
	var exp = new BigExplosion(this.x, this.y);
	exp.fps = 15;
	exp.spawn(this.level);
	this.explodeTimer = 0.1;
    }
    return true;
}
