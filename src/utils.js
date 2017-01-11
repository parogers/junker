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

/* utils.js */

MOUSE_LEFT = 0
MOUSE_MIDDLE = 1
MOUSE_RIGHT = 2

/* Cross platform way of requesting an animation update
 * (see http://jlongster.com/Making-Sprite-based-Games-with-Canvas) */
var requestAnimFrame = (function() {
    return (
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){
	    window.setTimeout(callback, 1000 / 60);
	});
})();

/* Stop an event from propagating and triggering any browser default actions */
function utils_stop_event(event)
{
    /* Use every known method for stopping the event */
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    event.cancelBubble = true;
}

/* Create an offscreen canvas for rendering the background */
function create_tiled_background(img, width, height)
{
    /* Create the offscreen canvas */
    var bg = document.createElement("canvas");
    bg.width = width;
    bg.height = height;
    /* Now tile the background image across it */
    var ctx = bg.getContext("2d");
    var pat = ctx.createPattern(img, "repeat");
    ctx.fillStyle = pat;
    ctx.rect(0, 0, width, height);
    ctx.fill();
    return bg;
}

/* Returns a random integer */
function randint(a, b)
{
    return (Math.random() * (b-a) + a)|0;
}

/* Resize the given image to a new size, returning a new canvas */
function resize_image(img, width, height)
{
    /* Create an offscreen canvas */
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    /* Calculate the scale factor that fits the image to the desired size */
    var ctx = canvas.getContext("2d");
    var scale = Math.min(canvas.width/img.width, 
			 canvas.height/img.height);
    var w = (img.width*scale)|0;
    var h = (img.height*scale)|0;

    ctx.drawImage(img, 
		  0, 0, // source
		  img.width, img.height,
		  (canvas.width-w)/2, (canvas.height-h)/2,
		  w, h);

    return canvas;
}

/* Returns a copy of the given image as a canvas object */
function copy_image(img)
{
    /* Create an offscreen canvas */
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    /* Now tile the background image across it */
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas;
}

function scroll_canvas(context, w, h, dx, dy)
{
    var srcx, srcy, srcw, srch;
    var x, y;

    if (dx > 0) {
	x = dx;
	srcx = 0;
	srcw = w-dx;
    } else {
	x = 0;
	srcx = -dx;
	srcw = w+dx;
    }

    if (dy > 0) {
	y = dy;
	srcy = 0;
	srch = h-dy;
    } else {
	y = 0;
	srcy = -dy;
	srch = h+dy;
    }

    var data = context.getImageData(srcx, srcy, srcw, srch);
    context.putImageData(data, x, y);
}

function endswith(str, sub)
{
    return (str.substr(-sub.length) == sub);
}
