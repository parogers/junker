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

/* Stationary turret that tracks and shoots at the player periodically */
function Turret()
{
    /* Constructor */
    Sprite.call(this);

    /* Sprite for the turrent gun. This is constructed in the next call
     * to 'update' below. */
    this.gunSprite = null;
    /* Maximum number of shots per second */
    this.firingRate = 0.7+0.5*Math.random();
    /* Speed of fired projectiles in pixels/sec */
    this.shotSpeed = 150;
    this.maxHealth = 3;
    this.health = this.maxHealth;
    /* Maximum turning speed of the turret in radians per sec */
    //this.turnSpeed = 3.14/2;
    this.explodeTimer = 0;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
    /* Whether we are tracking the player */
    this.tracking = false;
}

Turret.prototype = new Sprite;

Turret.prototype.update = function(dt) 
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
	    this.level.remove_sprite(this.gunSprite);
	    this.level.remove_sprite(this);
	    return;
	}
    }

    /* If the turret isn't visible don't do anything */
    if (!this.level.check_pos_visible(this.x, this.y))
    {
	return;
    }

    /* Aim the barrel towards the player, if they're close enough */
    /* ... */
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
	this.gunSprite.rotation = Math.atan2(dy, dx);

	this.cooldown -= dt;
	if (this.cooldown <= 0) {
	    /* Ready to fire another shot */
	    this.cooldown = 1.0 / this.firingRate;

	    var shot = new Shot(this);
	    //var mag = Math.sqrt(dx*dx + dy*dy);
	    shot.speed = this.shotSpeed;
	    shot.dirX = Math.cos(this.gunSprite.rotation);
	    shot.dirY = Math.sin(this.gunSprite.rotation);
	    shot.x = this.x + 15*shot.dirX;
	    shot.y = this.y + 15*shot.dirY;
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	    resources.turretShotAudio.play();
	}
    }
}

/* Called to spawn this sprite into the level */
Turret.prototype.spawn = function(level)
{
    this.level = level;
    this.set_image(resources.images.turretBase);
    /* Build the gun sprite and add it to the level, centred on the
     * turret base. */
    this.gunSprite = new Sprite(resources.images.turretGun);
    this.gunSprite.x = this.x;
    this.gunSprite.y = this.y;
    this.gunSprite.rotation = 3.14/2;
    /* Make sure the gun is rendered above the turret base */
    this.level.groundSprites.add(this);
    this.level.middleSprites.add(this.gunSprite);
    /* Also make the turret (base) a valid target for the player */
    this.level.targets.add(this);
}

Turret.prototype.handle_shot_collision = function(shot)
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
