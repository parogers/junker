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

/* turret.js */

JET_IDLE = 0,
JET_TAKEOFF = 1
JET_FLYING = 2

/* Jet that flys around for a while attacking the player */
function Jet()
{
    /* Constructor */
    Sprite.call(this);

    /* Maximum number of shots per second */
    this.firingRate = 1.25+0.5*Math.random();
    /* Speed of fired projectiles in pixels/sec */
    this.shotSpeed = 300;
    this.maxHealth = 3;
    this.explodeTimer = 0;
    this.state = JET_IDLE;
    this.flame = null;
    this.flameOffset = 25;
    this.velocity = 0;
    this.timer = 0;
    this.takeoffSpeed = 250;
    /* Whether the jet is banking left (-1) right (1) or not (0) */
    this.banking = 0;
    this.bankingSpeed = 40;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
}

Jet.prototype = new Sprite;

Jet.prototype.update = function(dt) 
{
    /* Check if we're exploding */
    if (this.explodeTimer > 0) 
    {
	this.explodeTimer -= dt;
	if (this.explodeTimer <= 0) 
	{
	    this.level.remove_sprite(this.flame);
	    this.level.remove_sprite(this);
	    return;
	}
    }

    if (this.flame != null) 
    {
	/* Move the flame into position as the jet flys around */
	this.flame.x = this.x;
	this.flame.y = this.y - this.flameOffset*Math.sign(this.velocity);
    }

    this.x += dt*this.bankingSpeed*this.banking;
    this.y += dt*this.velocity;

    switch(this.state) 
    {
    case JET_IDLE:
	/* The jet starts it's takeoff after it becomes visible on the screen
	 * (after a short delay) */
	if (this.level.check_pos_visible(this.x, this.y)) {
	    this.timer -= dt;
	}
	/* We also take off immediately if shot at */
	if (this.timer <= 0 || this.health < this.maxHealth) {
	    this.state = JET_TAKEOFF;
	}
	break;

    case JET_TAKEOFF:
	if (this.flame === null) {
	    /* Create a sprite for the flame exhaust */
	    this.flame = new Sprite(resources.images.jetFlame1);
	    this.flame.x = this.x;
	    this.flame.y = this.y + this.flameOffset;
	    this.level.airSprites.add(this.flame);
	}
	/* Slowly accelerate to our take off speed */
	this.velocity -= 200*dt;
	if (Math.abs(this.velocity) > this.takeoffSpeed) {
	    this.state = JET_FLYING;
	    this.banking = 0;
	}
	break;

    case JET_FLYING:
	if (this.velocity < 0 && this.y < this.level.terrainView.ypos - 100)
	{
	    this.rotation = Math.PI;
	    this.flame.rotation = Math.PI;
	    this.velocity *= -1;
	    if (this.banking == 0) this.banking = 1;
	}

	if (this.velocity > 0 && this.y > this.level.terrainView.ypos + 
	    this.level.terrainView.height+100)
	{
	    this.rotation = 0;
	    this.flame.rotation = 0;
	    this.velocity *= -1;
	}

	if (this.x < this.level.terrainView.xpos-50) 
	{
	    this.banking = 1;
	} 
	else if (this.x > this.level.terrainView.xpos + 
		 this.level.terrainView.width+50) 
	{
	    this.banking = -1;
	}
	break;
    }
}

/* Called to spawn this sprite into the level */
Jet.prototype.spawn = function(level)
{
    this.health = this.maxHealth;
    this.level = level;
    this.timer = 1;
    this.set_image(resources.images.jet);
    /* Add this jet to the level in the air */
    this.level.airSprites.add(this);
    this.level.targets.add(this);
}

Jet.prototype.handle_shot_collision = function(shot)
{
    this.health--;
    if (this.health <= 0) {
	//resources.explodeTurretAudio.play();
	var exp = new BigExplosion(this.x, this.y);
	exp.fps = 15;
	exp.spawn(this.level);
	this.explodeTimer = 0.1;
    }
    return true;
}
