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

/* shot.js */

function Shot(owner)
{
    /* Constructor */
    Sprite.call(this);

    this.owner = owner;
    this.speed = 500;
    this.dirX = 0;
    this.dirY = 0;
    this.frame = 0;
}

Shot.prototype = new Sprite;

Shot.prototype.spawn = function(level)
{
    this.set_image(resources.shotFrames[0]);
    this.level = level;
    this.level.airSprites.add(this);
}

Shot.prototype.update = function(dt)
{
    /* Update the bullet position */
    this.x += this.dirX * this.speed * dt;
    this.y += this.dirY * this.speed * dt;
    this.frame = (this.frame + 15*dt) % resources.shotFrames.length;
    this.img = resources.shotFrames[this.frame|0];

    var collide = null;
    if (this.owner === this.level.player)
    {
	/* Check for a collision with an enemy */
	collide = this.level.targets.check_collision(this.x, this.y);
    } 
    else 
    {
	/* Otherwise this is a bullet from an enemy. Check for a collision
	 * with the player. */
	if (this.level.player.check_collision(this.x, this.y)) {
	    collide = this.level.player;
	}
    }

    /* Check if the shot either collides with another sprite, or part
     * of the terrain. */
    if ((collide && collide.handle_shot_collision && 
	 collide.handle_shot_collision(this)) || 
	!this.level.check_passable(this.x, this.y))
    {
	/* The shot collided with something so have it explode */
	this.level.remove_sprite(this);
	var exp = new Explosion(this.x, this.y);
	exp.spawn(this.level);
	resources.explodeAudio.play();
    }

    /* Remove the shot when it's no longer on screen */
    if (!this.level.check_pos_visible(this.x, this.y)) 
    {
	this.level.remove_sprite(this);
    }
}
