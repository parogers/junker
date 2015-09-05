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

/* loader.js */

function AudioLoader(basePath)
{
    this.basePath = basePath;
    this.sounds = {};
    this.remaining = {};
    this.onComplete = null;

    this.handleSoundLoaded = function(src) 
    {
	delete this.remaining[src];
	var remains = Object.keys(this.remaining).length;
	console.log("loaded clip: " + src + ", " + remains + " left");
	if (remains == 0 && this.onComplete != null) {
	    this.onComplete();
	}
	/* TODO - handle errors */
    }

    this.handleSoundFailed = function(src) {
	alert("Failed to load: " + src);
    }

    this.load = function(srcList) 
    {
	for (var name in srcList)
	{
	    var src = srcList[name];
	    var snd = new Audio();

	    snd.oncanplaythrough = function(ldr, src) {
		return function() {
		    /* Remove the event handler so it's not called later. This
		     * can happen in Firefox when an audio clip is looped */
		    this.oncanplaythrough = undefined;
		    ldr.handleSoundLoaded(src);
		}
	    }(this, src);
	    snd.src = this.basePath + src;
	    snd.onerror = function(ldr, src)
	    {
		return function() {
		    /* Remove the event handler so it's not called later */
		    this.onerror = undefined;
		    return ldr.handleSoundFailed(src);
		}
	    }(this, src);

	    this.sounds[name] = snd;
	    this.remaining[src] = true;
	}
    }
}

function ImageLoader(basePath)
{
    this.basePath = basePath;
    this.images = {};
    this.remaining = {};

    this.onComplete = null;
    this.onLoaded = null;
    this.onProgress = null;

    this.handleImageLoaded = function(src) 
    {
	delete this.remaining[src];
	var remains = Object.keys(this.remaining).length;
	/* Notify that another image was loaded */
	if (this.onLoaded != null) {
	    this.onLoaded(src);
	}
	if (this.onProgress != null) {
	    this.onProgress(Object.keys(this.images).length-remains,
			    Object.keys(this.images).length);
	}
	/* Check if the complete set was loaded, and send a notification */
	if (this.onComplete != null && remains == 0) {
	    this.onComplete();
	}
    }

    this.handleImageFailed = function(src)
    {
	alert("Failed to load image: " + src);
    }

    this.load = function(srcList) 
    {
	for (var name in srcList)
	{
	    var src = srcList[name];
	    var img = new Image();
	    img.onload = function(ldr, src) 
	    {
		return function() {
		    /* Pass along the image loaded event */
		    ldr.handleImageLoaded(src);
		}
	    }(this, src);

	    img.onerror = function(ldr, src)
	    {
		return function() {
		    return ldr.handleImageFailed(src);
		}
	    }(this, src);

	    this.images[name] = img;
	    this.remaining[src] = true;
	    /* This will start loading the image data when this
	     * function exits */
	    img.src = this.basePath + src;
	}
    }
}

function Resources(basePath, imageList, audioList)
{
    this.basePath = basePath;
    this.onComplete = null;
    this.onError = null;
    this.imageList = imageList;
    this.audioList = audioList;
    this.tileset = null;
    this.level = null;
    /* The Sound objects hashed by name */
    this.sounds = null;

    this.load = function()
    {
	this._load_images();
    }

    this._load_images = function()
    {
	var imageLoader = new ImageLoader(this.basePath);
	imageLoader.onComplete = function(res, ldr) {
	    return function() {
		/* Now load the audio */
		log_message("Images loaded");
		res.images = ldr.images;
		res._load_audio();
	    }
	}(this, imageLoader);
	imageLoader.load(this.imageList);
    }

    this._load_audio = function()
    {
	var audioLoader = new AudioLoader(this.basePath);
	audioLoader.onComplete = function(res, ldr) {
	    return function() {
		log_message("Audio loaded");
		res.sounds = ldr.sounds;
		if (res.onComplete != null)
		    res.onComplete();
	    }
	}(this, audioLoader);
	audioLoader.load(this.audioList);
    }
}
