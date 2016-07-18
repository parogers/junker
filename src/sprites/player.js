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

/* player.js */

var MOTOR_SOUNDS = true;

function Player()
{
    /* Constructor */
    Sprite.call(this);

    this.barrelLength = 15;
    this.slowDown = 0;
    this.speed = 125;
    this.frames = [
	resources.images.tankBase4,
	resources.images.tankBase3,
	resources.images.tankBase2,
	resources.images.tankBase1];
    this.frame = 0;
    /* Time between shots in seconds */
    this.shotDelay = 0.3;
    /* Time until the player can shoot again */
    this.shotCooldown = 0;
    /* Whether the player tank is currently in water */
    this.inWater = false;

    if (MOTOR_SOUNDS) 
    {
	this.motorIdle = resources.sounds.motorIdle;
	this.motorIdle.paused = true;
	this.motorIdle.volume = 0.5;
	/* Have the idling sound loop when it needs to loop */
	this.motorIdle.addEventListener("ended", function() {
	    this.currentTime = 0;
	});

	this.motorRun = resources.sounds.motorRun;
	this.motorRun.paused = true;
	this.motorRun.volume = 0.5;
	/* Have the motor sound loop */
	this.motorRun.addEventListener("ended", function() {
	    this.currentTime = 0;
	});
    }

    this.moving = false;

    this.directions = [
	[225, 270, -45], // north (west, NA, east)
	[180,   0,   0], // NA    (west, NA, east)
	[135,   90, 45]  // south (west, NA, east)
    ];

    this.gunSprite = null;
}

Player.prototype = new Sprite;

Player.prototype.update = function(dt)
{
    var dx = 0, dy = 0;
    if (controls.up) dy = -1;
    else if (controls.down) dy = 1;

    if (controls.left) dx = -1;
    else if (controls.right) dx = 1;

    var mag = Math.sqrt(dx*dx + dy*dy);

    if (mag > 0) {
	/* Aim the tank base in the right direction */
	this.rotation = Math.PI*this.directions[dy+1][dx+1]/180;
    }

    if (mag > 0) {
	dx *= this.speed*dt/mag;
	dy *= this.speed*dt/mag;

	if (this.inWater) {
	    /* Move a little slower while in water */
	    dx *= 0.75;
	    dy *= 0.75;
	}
    }

    /* Check that the new position isn't blocked */
    this.moving = false;
    if (mag > 0)
    {
	this.moving = true;
	/* Move the player tank */
	this.do_normal_move(dx, dy);

	/* Check if the tank has entered into water */
	var terr = this.level.get_ground_terrain(this.x, this.y);
	if (terr === WATER) {
	    /* If the tank has just moved into water play the splash sound */
	    if (!this.inWater) {
		resources.splashAudio.play();
		this.slowDown = 0.5;
	    }
	    this.inWater = true;
	    this.img = resources.images.tankWater;
	} else {
	    /* If tank has just moved out of water play the climbing sound */
	    if (this.inWater) {
		resources.rumbleAudio.play();
		this.slowDown = 0.5;
	    }

	    this.inWater = false;
	    this.frame = (this.frame + 15*dt) % this.frames.length;
	    this.img = this.frames[this.frame|0];
	}
    }

    /* Aim the gun at the mouse cursor */
    var dx = controls.cursorX - (this.x - this.level.terrainView.xpos);
    var dy = controls.cursorY - (this.y - this.level.terrainView.ypos);
    this.gunSprite.rotation = Math.atan2(dy, dx);
    var mag = Math.sqrt(dx*dx + dy*dy);
    dx = dx / mag;
    dy = dy / mag;
    //this.gunSprite.rotation = -Math.PI/2; //this.rotation;

    if (controls.fire)
    {
	if (this.shotCooldown <= 0) 
	{
	    var shot = new Shot(this);
	    shot.dirX = dx; //Math.cos(this.gunSprite.rotation);
	    shot.dirY = dy; //Math.sin(this.gunSprite.rotation);
	    shot.x = this.x + this.barrelLength*shot.dirX;
	    shot.y = this.y + this.barrelLength*shot.dirY;
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	    resources.shotAudio.play();
	}
	//this.motor.pause();
    }

    if (controls.secondary)
    {
	if (this.shotCooldown <= 0) 
	{
	    var shot = new Bomb(
		this.x + this.barrelLength*dx,
		this.y + this.barrelLength*dy,
		controls.cursorX + this.level.terrainView.xpos,
		controls.cursorY + this.level.terrainView.ypos);
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	    resources.bombShotAudio.play();
	}
	//this.motor.pause();
    }

    if (MOTOR_SOUNDS) 
    {
	if (this.moving && this.motorRun.paused) {
	    /* Start the motor running sound, stop the idling sound */
	    //this.motorIdle.pause();
	    this.motorRun.play();
	} else if (!this.moving && this.motorIdle.paused) {
	    /* Start the idling sound, stop the motor running sound */
	    //this.motorIdle.play();
	    this.motorRun.pause();
	}
    }

    if (this.shotCooldown > 0) {
	this.shotCooldown -= dt;
    }

    /* Move the gun sprite back into position */
    this.gunSprite.x = this.x;
    this.gunSprite.y = this.y;
}

Player.prototype.spawn = function(level)
{
    /* Setup the player's tank */
    this.set_image(this.frames[0]);
    this.gunSprite = new Sprite(resources.images.tankGun);
    this.level.middleSprites.add(this.gunSprite);
    this.level.groundSprites.add(this);
}

Player.prototype.handle_shot_collision = function(shot)
{
/*    this.health--;
    if (this.health <= 0) {
	//resources.explodeTurretAudio.play();
	var exp = new BigExplosion(this.x, this.y);
	exp.fps = 15;
	exp.spawn(this.level);
	this.explodeTimer = 0.1;
    }*/
    return true;
}
