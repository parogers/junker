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

/* explosion.js */

function ExplosionBase(frames, x, y)
{
    /* Constructor */
    Sprite.call(this);

    this.explosionFrames = frames;
    this.fps = 25;
    this.frame = 0;
    this.x = x;
    this.y = y;
}

ExplosionBase.prototype = new Sprite;

ExplosionBase.prototype.spawn = function(level)
{
    this.set_image(this.explosionFrames[0]);
    this.level = level;
    this.level.airSprites.add(this);
}

ExplosionBase.prototype.update = function(dt)
{
    /* Update the animation frame */
    this.img = this.explosionFrames[this.frame|0];
    this.frame += this.fps*dt;
    if ((this.frame|0) >= this.explosionFrames.length)
    {
	this.level.remove_sprite(this);
	return;
    }
}

/*************/
/* Explosion */
/*************/

function Explosion(x, y)
{
    ExplosionBase.call(this, resources.explosionFrames, x, y);
}

Explosion.prototype = ExplosionBase.prototype;

/****************/
/* BigExplosion */
/****************/

function BigExplosion(x, y)
{
    ExplosionBase.call(this, resources.bigExplosionFrames, x, y);
}

BigExplosion.prototype = ExplosionBase.prototype;

/******************/
/* MultiExplosion */
/******************/

function MultiExplosion(x, y, radius, duration)
{
    Sprite.call(this);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = duration;
    this.time = 0;
    this.period = 0.05;
    this.counter = 0;
}

MultiExplosion.prototype = new Sprite;

MultiExplosion.prototype.spawn = function(level)
{
    this.level = level;
    this.level.airSprites.add(this);
    //this.set_image(resources.bigExplosionFrames[1]);
    resources.bombAudio.play();

    for (var id in this.level.targets.sprites)
    {
	var sprite = this.level.targets.sprites[id];
	if (Math.abs(sprite.x - this.x) < this.radius &&
	    Math.abs(sprite.y - this.y) < this.radius) 
	{
	    sprite.handle_shot_collision(this);
	    sprite.handle_shot_collision(this);
	    sprite.handle_shot_collision(this);
	}
    }
}

MultiExplosion.prototype.update = function(dt)
{
    this.time += dt;
    if (this.time > this.duration) 
    {
	/* Don't spawn any more explosions */
	this.level.remove_sprite(this);
	return;
    }

    this.counter -= dt;
    if (this.counter <= 0) 
    {
	var px = 2*(Math.random()-0.5);
	var py = 2*(Math.random()-0.5);
	var exp = new BigExplosion(
	    this.x + px * this.radius, 
	    this.y + py * this.radius);
	exp.spawn(this.level);
	this.counter = this.period;
    }
}
