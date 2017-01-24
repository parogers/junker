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

function Text(text, duration, args)
{
    /* Constructor */
    Sprite.call(this);

    this.velx = 0;
    this.vely = 0;
    this.text = text;
    this.startDuration = duration;
    this.duration = duration;
    if (args) {
	this.text_colour = args.text_colour;
	this.text_height = args.text_height;
    }
}

Text.prototype = new Sprite;

Text.prototype.spawn = function(level)
{
    this.level = level;
    this.level.airSprites.add(this);

    if (this.text_height) {
	font_height = this.text_height;
    } else {
	font_height = 20;
    }
    font_desc = "bold " + font_height + "px Arial";

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = font_desc;
    var width = context.measureText(this.text).width;

    canvas.width = width;
    canvas.height = font_height;

    /* Changing the canvas size resets some context options, so get a fresh
     * context here just in case. */
    var context = canvas.getContext("2d");
    context.font = font_desc;
    context.fillStyle = this.text_colour;

    var x = canvas.width/2-width/2-1;
    var y = canvas.height;
    /* Render the text shadow */
    context.fillText(this.text, x, y);
    this.set_image(canvas);
}

Text.prototype.update = function(dt)
{
    this.x += this.velx * dt;
    this.y += this.vely * dt;

    this.duration -= dt;
    if (this.duration <= 0) {
	this.level.remove_sprite(this);
    }
}
