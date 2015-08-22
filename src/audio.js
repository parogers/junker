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

/* audio.js */

/* Defines a collection of identical audio clips, so they can easily be 
 * played in rapid sequence, with overlapping. */
function AudioPool(audio, count)
{
    if (audio == undefined) throw "audio is undefined";

    this.audioObjs = [];
    this.next = 0;

    if (!count) count = 5;

    for (var n = 0; n < count; n++) {
	this.audioObjs.push(audio.cloneNode());
    }

    /* Plays the next audio clip in the managed pool */
    this.play = function()
    {
	this.audioObjs[this.next].play();
	this.next = (this.next + 1) % this.audioObjs.length;
    };

    this.set_volume = function(vol) {
	for (var n = 0; n < this.audioObjs.length; n++) {
	    this.audioObjs[n].volume = vol;
	}
    }
}
