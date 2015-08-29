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
    this.firingRate = 1;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
    /* Whether we are tracking the player */
    this.tracking = false;
}

Turret.prototype = new Sprite;

Turret.prototype.update = function(dt) 
{
    if (this.img === null) 
    {
    }

    //this.gunSprite.rotation += 3*dt;

    /* Aim the barrel towards the player, if they're close enough */
    /* ... */
    this.tracking = true;

    /* Periodically shoot at the player */
    if (this.tracking) 
    {
	this.cooldown -= dt;
	if (this.cooldown <= 0) {
	    /* Ready to fire another shot */
	    this.cooldown = 1.0 / this.firingRate;
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
    /* Make sure the gun is rendered above the turret base */
    this.level.groundSprites.add(this);
    this.level.middleSprites.add(this.gunSprite);
    /* Also make the turret (base) a valid target for the player */
    this.level.targets.add(this);
}

Turret.prototype.handle_shot_collision = function(shot)
{
    return true;
}
