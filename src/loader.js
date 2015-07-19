/* loader.js */

function AudioLoader(basePath)
{
    this.basePath = basePath;
    this.sounds = {};
    this.remaining = {};
    this.onComplete = null;

    this.handleSoundLoaded = function(src) {
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
		    ldr.handleSoundLoaded(src);
		}
	    }(this, src);
	    snd.src = this.basePath + src;
	    snd.onerror = function(ldr, src)
	    {
		return function() {
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
