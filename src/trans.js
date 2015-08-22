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

/* trans.js - Screen transitions */

function Fadeout(src, duration)
{
    this.done = false;
    this.srcImage = src;
    this.duration = duration;
    this.count = 0.0;

    this.update = function(dt)
    {
	this.count += dt;
	if (this.count > this.duration)
	    this.done = true;
    }

    this.draw_frame = function(ctx)
    {
	var alpha = Math.min(this.count / this.duration, 1);

	ctx.drawImage(this.srcImage, 0, 0);
	ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
	ctx.fillRect(0, 0, this.srcImage.width, this.srcImage.height);
    }
}

function Fadein(dest, duration)
{
    this.done = false;
    this.destImage = dest;
    this.duration = duration;
    this.count = 0.0;

    this.update = function(dt)
    {
	this.count += dt;
	if (this.count > this.duration)
	    this.done = true;
    }

    this.draw_frame = function(ctx)
    {
	var alpha = 1 - Math.min(this.count / this.duration, 1);

	ctx.drawImage(this.destImage, 0, 0);
	ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
	ctx.fillRect(0, 0, this.destImage.width, this.destImage.height);
    }
}

