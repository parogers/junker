/* utils.js */

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

function randint(a, b)
{
    return (Math.random() * (b-a) + a)|0;
}

function resize_image(img, width, height)
{
    /* Create the offscreen canvas */
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    /* Now tile the background image across it */
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

