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

function PodEmitter()
{
    /* Constructor */
    Sprite.call(this);
    this.maxHealth = 5;
    this.health = this.maxHealth;
    this.count = 0;
    this.isOpen = false;
    this.spawned = false;
}

PodEmitter.prototype = new Sprite;

PodEmitter.prototype.update = function(dt) 
{
    if (!this.level.check_pos_visible(this.x, this.y)) {
	return;
    }

    this.count -= dt;
    if (this.count <= 0) {
	if (this.isOpen) {
	    var pod = new Pod();
	    pod.x = this.x;
	    pod.y = this.y;
	    pod.spawn(this.level);
	    this.count = 2;
	    this.isOpen = false;
	    this.set_image(this.closedImage);
	} else {
	    this.count = 1;
	    this.isOpen = true;
	    this.set_image(this.openImage);
	}
    }
}

/* Called to spawn this sprite into the level */
PodEmitter.prototype.spawn = function(level)
{
    this.level = level;
    this.openImage = resources.images.podEmitter1;
    this.closedImage = resources.images.podEmitter2;
    this.set_image(this.openImage);
    this.level.groundSprites.add(this);
    this.level.targets.add(this);
}

PodEmitter.prototype.handle_shot_collision = function(shot)
{
    this.health--;
    if (this.health <= 0) {
	var exp = new BigExplosion(this.x, this.y);
	exp.fps = 15;
	exp.spawn(this.level);
	this.explodeTimer = 0.1;
	this.level.remove_sprite(this);
    }
    return true;
}
