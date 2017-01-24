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
var WELCOME_TEXT = [
    "WELCOME TO",
    "THE DEMO!",
    "MOUSE AIMS.",
    "WADS MOVES.",
    "HAVE FUN!",
];

function Player()
{
    /* Constructor */
    Sprite.call(this);

    /* Which line of the welcome text is being shown */
    this.welcomeText = 0;
    this.welcomeTimer = 1;
    this.speedLevels = [125, 150, 175, 200];
    this.multishot = false;
    this.barrelLength = 15;
    this.slowDown = 0;
    this.speed = 0;
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
    /* Barrel vector (unit) */
    this.barrelDirX = 0;
    this.barrelDirY = 0;

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
	dx *= this.speedLevels[this.speed]*dt/mag;
	dy *= this.speedLevels[this.speed]*dt/mag;

	if (this.inWater) {
	    /* Move a little slower while in water */
	    dx *= 0.6;
	    dy *= 0.6;
	}
    }

    if (this.welcomeText >= 0) {
	this.welcomeTimer -= dt;
	if (this.welcomeTimer <= 0) {
	    this.welcomeTimer = 1;
	    /* Show the next line of welcome text */
	    this.show_text(WELCOME_TEXT[this.welcomeText], 
			   "rgb(255,255,0)", 4);
	    this.welcomeText += 1;
	    if (this.welcomeText >= WELCOME_TEXT.length) {
		/* No more text to show */
		this.welcomeText = -1;
	    }
	}
    }

    /* Check that the new position isn't blocked */
    this.moving = false;
    if (mag > 0 && this.y + dy < this.level.terrainView.ypos + this.level.terrainView.height)
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

    this.barrelAngle = this.gunSprite.rotation;
    this.barrelDirX = dx / mag;
    this.barrelDirY = dy / mag;
    //this.gunSprite.rotation = -Math.PI/2; //this.rotation;

    if (controls.fire) {
	this.primary_fire();
    }

    if (controls.secondary) {
	this.secondary_fire();
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

Player.prototype.primary_fire = function()
{
    if (this.shotCooldown > 0) {
	return;
    }
    if (this.multishot) {
	for (var n = 0; n < 3; n++) {
	    var shot = new Shot(this);
	    shot.dirX = Math.cos(this.barrelAngle+0.1*(n-1));
	    shot.dirY = Math.sin(this.barrelAngle+0.1*(n-1));
	    shot.x = this.x + this.barrelLength*shot.dirX;
	    shot.y = this.y + this.barrelLength*shot.dirY;
	    shot.spawn(this.level);
	    this.shotCooldown = this.shotDelay;
	}
	resources.shotAudio.play();
    } else {
	var shot = new Shot(this);
	shot.dirX = this.barrelDirX;
	shot.dirY = this.barrelDirY;
	shot.x = this.x + this.barrelLength*shot.dirX;
	shot.y = this.y + this.barrelLength*shot.dirY;
	shot.spawn(this.level);
	this.shotCooldown = this.shotDelay;
	resources.shotAudio.play();
    }
    //this.motor.pause();
}

Player.prototype.secondary_fire = function()
{
/*
    if (this.shotCooldown <= 0) 
    {
	var shot = new Bomb(
	    this.x + this.barrelLength*this.barrelDirX,
	    this.y + this.barrelLength*this.barrelDirY,
	    controls.cursorX + this.level.terrainView.xpos,
	    controls.cursorY + this.level.terrainView.ypos);
	shot.spawn(this.level);
	this.shotCooldown = this.shotDelay;
	resources.bombShotAudio.play();
    }
*/
    //this.motor.pause();
}

Player.prototype.collect_powerup = function(powerup)
{
    if (powerup.type == "multishot") this.multishot = true;
    else if (powerup.type == "speed" && 
	     this.speed < this.speedLevels.length-1) {
	this.speed += 1;
    }
    /* Briefly play a sound */
    resources.powerupAudio.play();

    /* Show some colourful text for the powerup */
    var names = {
	"speed" : "SPEED UP",
	"multishot" : "MULTISHOT",
	"flameshot" : "FLAMESHOT",
	"bomb" : "BOMB"};

    this.show_text(names[powerup.type], "rgb(255,255,0)");
}

Player.prototype.spawn = function(level)
{
    /* Setup the player's tank */
    this.set_image(this.frames[0]);
    this.gunSprite = new Sprite(resources.images.tankGun);
    this.level.middleSprites.add(this.gunSprite);
    this.level.groundSprites.add(this);
    this.rotation = -Math.PI/2;
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

Player.prototype.show_text = function(txt, colour, duration)
{
    if (!duration) duration = 2;
    var t = new Text(txt, duration, {text_colour: colour, text_height: 15});
    t.x = this.x;
    t.y = this.y-10;
    t.velx = 0;
    t.vely = -25;
    t.spawn(this.level);
}

