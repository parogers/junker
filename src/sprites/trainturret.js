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

/* Stationary turret that tracks and shoots at the player periodically */
function TrainTurret()
{
    /* Constructor */
    Sprite.call(this);

    /* Maximum number of shots per second */
    this.firingRate = 0.7+0.5*Math.random();
    /* Speed of fired projectiles in pixels/sec */
    this.shotSpeed = 150;
    this.maxHealth = 4;
    this.health = this.maxHealth;
    /* Maximum turning speed of the turret in radians per sec */
    //this.turnSpeed = 3.14/2;
    this.explodeTimer = 0;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
    /* Whether we are tracking the player */
    this.tracking = false;
    this.moveDist = 0;
    this.moveSpeed = 50;
    this.dirX = 0;
    this.dirY = 1;
}

TrainTurret.prototype = new Sprite;

TrainTurret.prototype.update = function(dt) 
{
    /* Check if we're exploding */
    if (this.explodeTimer > 0) 
    {
	this.explodeTimer -= dt;
	if (this.explodeTimer <= 0) 
	{
	    for (var n = 0; n < 5; n++) {
		var fire = new Fire();
		fire.duration = 5+3*Math.random();
		fire.x = this.x + 20*(Math.random()-0.5);
		fire.y = this.y + 20*(Math.random()-0.5);
		fire.spawn(this.level);
	    }
	    this.level.remove_sprite(this);
	    return;
	}
    }

    /* If the turret isn't visible don't do anything */
    if (!this.level.check_pos_visible(this.x, this.y))
    {
	return;
    }

    this.moveDist -= dt*this.moveSpeed;
    if (this.moveDist <= 0) 
    {
	/* Decide what direction to move in next, based on what tracks are
	 * around us. */
	var n = Math.floor(Math.random()*4);
	var terr = this.level.get_midground_terrain(
	    this.x + this.dirX*2*TILEW, this.y + this.dirY*2*TILEH);
	if (terr === TRACK) {
	    /* Clear to keep moving */
	    this.moveDist = TILEW*2;
	} else {
	    /* Find a new direction to move */
	    var dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]];
	    var found = false, dx, dy;
	    for (var n = 0; n < dirs.length; n++) {
		dx = dirs[n][0];
		dy = dirs[n][1];
		if (dx != -this.dirX || dy != -this.dirY) {
		    var other = this.level.get_midground_terrain(
			this.x + dx*2*TILEW, 
			this.y + dy*2*TILEH);
		    if (other === TRACK) {
			found = true;
			break
		    }
		}
	    }
	    if (found) {
		/* Found another piece of track, move in that direction */
		this.dirX = dx;
		this.dirY = dy;
	    } else {
		/* No other option but to move back from where we came */
		this.dirX = -this.dirX;
		this.dirY = -this.dirY;
	    }
	}
    } else {
	this.x += this.dirX * this.moveSpeed * dt;
	this.y += this.dirY * this.moveSpeed * dt;
    }

    /* Aim the barrel towards the player, if they're close enough */
    var dx = (this.level.player.x - this.x);
    var dy = (this.level.player.y - this.y);
    var playerDist = Math.sqrt(dx*dx + dy*dy);
    var engageDist = Math.max(this.level.terrainView.width,
			      this.level.terrainView.height)/1.5;
    this.tracking = (playerDist < engageDist) || this.health < this.maxHealth;

    /* Periodically shoot at the player */
    if (this.tracking) 
    {
	/* Aim the gun at the player */
	this.rotation = Math.atan2(dy, dx);

	this.cooldown -= dt;
	if (this.cooldown <= 0) {
	    /* Ready to fire another shot */
	    this.cooldown = 1.0 / this.firingRate;

	    var shot = new Shot(this);
	    shot.speed = this.shotSpeed;
	    shot.dirX = Math.cos(this.rotation);
	    shot.dirY = Math.sin(this.rotation);
	    shot.x = this.x + 15*shot.dirX;
	    shot.y = this.y + 15*shot.dirY;
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	    resources.turretShotAudio.play();
	}
    }
}

/* Called to spawn this sprite into the level */
TrainTurret.prototype.spawn = function(level)
{
    this.level = level;
    this.set_image(resources.images.turretGun);
    this.level.groundSprites.add(this);
    this.level.targets.add(this);
}

TrainTurret.prototype.handle_shot_collision = function(shot)
{
    this.health--;
    if (this.health <= 0) {
	//resources.explodeTrainTurretAudio.play();
	var exp = new BigExplosion(this.x, this.y);
	exp.fps = 15;
	exp.spawn(this.level);
	this.explodeTimer = 0.1;
    }
    return true;
}
