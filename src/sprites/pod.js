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

function Pod()
{
    /* Constructor */
    Sprite.call(this);

    /* Speed of fired projectiles in pixels/sec */
    this.shotSpeed = 300;
    this.maxHealth = 1;
    this.explodeTimer = 0;
    this.fps = 8;
    this.frame = 0;
    this.frames = [];
    this.dirx = 0;
    this.diry = 0;
    this.speed = 50;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
    this.active = false;
}

Pod.prototype = new Sprite;

Pod.prototype.update = function(dt) 
{
    this.img = this.frames[(this.frame|0) % this.frames.length];
    this.frame += this.fps*dt;

    /* Check if we're exploding */
    if (this.explodeTimer > 0) 
    {
	this.explodeTimer -= dt;
	if (this.explodeTimer <= 0) 
	{
	    /* Finished exploding, damage the player */
	    /* ... */
	    this.level.remove_sprite(this);
	}
	return;
    }

    if (this.active || this.level.check_pos_visible(this.x, this.y))
    {
	/* Move towards the player */
	var dirx = this.level.player.x - this.x;
	var diry = this.level.player.y - this.y;
	var mag = Math.sqrt(dirx*dirx + diry*diry);
	/* Explode if we get close enough */
	if (mag < 20)
	{
	    /* Animate the explosion */
	    var exp = new BigExplosion(this.x, this.y);
	    exp.fps = 15;
	    exp.spawn(this.level);
	    this.explodeTimer = 0.1;
	    return;
	}

	dirx = dt * this.speed * dirx / mag;
	diry = dt * this.speed * diry / mag;

	this.do_normal_move(dirx, diry);
	this.active = true;
    }
}

/* Called to spawn this sprite into the level */
Pod.prototype.spawn = function(level)
{
    this.frames = [
	resources.images.pod1,
	resources.images.pod2,
	resources.images.pod3,
	resources.images.pod4,
	resources.images.pod5,
	resources.images.pod6];
    this.health = this.maxHealth;
    this.level = level;
    this.set_image(this.frames[0]);
    this.level.groundSprites.add(this);
    this.level.targets.add(this);
}

Pod.prototype.handle_shot_collision = function(shot)
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
