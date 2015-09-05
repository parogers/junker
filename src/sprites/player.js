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

var MOTOR_SOUNDS = false;

function Player()
{
    /* Constructor */
    Sprite.call(this);

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

Player.prototype.check_passable = function(x, y) 
{
    /* Checks if the given map coordinate is passable, or blocked */
    var row = (y/(2*TILEW))|0;
    var col = (x/(2*TILEW))|0;
    if (row >= 0 && row < this.level.ground.rows &&
	col >= 0 && col < this.level.ground.cols) {
	return ((this.level.ground[row][col] == DIRT ||
		 this.level.ground[row][col] == GRASS ||
		 this.level.ground[row][col] == WATER) &&
	    	this.level.midground[row][col] == NOTHING);
    }
    return false;
}

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
    }

    /* Check that the new position isn't blocked */
    this.moving = false;
    if (mag > 0)
    {
	this.moving = true;
	if (this.check_passable(this.x+dx, this.y+dy)) {
	    /* The way is clear */
	    this.x += dx;
	    this.y += dy;
	} else if (dy && this.check_passable(this.x, this.y+dy)) {
	    /* We can move forward/backward */
	    this.y += dy;
	} else if (dx && this.check_passable(this.x+dx, this.y)) {
	    /* We can move left/right */
	    this.x += dx;
	}

	var terr = this.level.get_ground_terrain(this.x, this.y);
	if (terr == WATER) {
	    this.img = resources.images.tankWater;
	} else {
	    this.frame = (this.frame + 15*dt) % this.frames.length;
	    this.img = this.frames[this.frame|0];
	}
    }

    /* Aim the gun at the mouse cursor */
    var dx = controls.cursorX - (this.x - this.level.terrainView.xpos);
    var dy = controls.cursorY - (this.y - this.level.terrainView.ypos);
    this.gunSprite.rotation = Math.atan2(dy, dx);;
    //this.gunSprite.rotation = -Math.PI/2; //this.rotation;

    if (controls.fire)
    {
	if (this.shotCooldown <= 0) 
	{
	    var shot = new Shot();
	    var mag = Math.sqrt(dx*dx + dy*dy);
	    shot.dirX = Math.cos(this.gunSprite.rotation);
	    shot.dirY = Math.sin(this.gunSprite.rotation);
	    shot.x = this.x + 15*shot.dirX;
	    shot.y = this.y + 15*shot.dirY;
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	    resources.shotAudio.play();
	}
	//this.motor.pause();
    }

    if (MOTOR_SOUNDS) 
    {
	if (this.moving && this.motorRun.paused) {
	    /* Start the motor running sound, stop the idling sound */
	    this.motorIdle.pause();
	    this.motorRun.play();
	} else if (!this.moving && this.motorIdle.paused) {
	    /* Start the idling sound, stop the motor running sound */
	    this.motorIdle.play();
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
