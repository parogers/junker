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

