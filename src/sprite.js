/* sprite.js */

var SpriteID = 0;

/* Sprite */
function Sprite() {
    /* Unique identifier for the sprite (useful for storing sprites in 
     * dictionaries) */
    this.id = SpriteID++;
    this.img = null;
    /* The position of the sprite within the map (the centre point) */
    this.x = 0;
    this.y = 0;
    /* The sprites angle of rotation */
    this.rotation = 0;
    /* The centre of the sprite relative to the upper-left corner of 
     * it's rendered image. */
    this.offsetX = 0;
    this.offsetY = 0;
}

Sprite.prototype.set_image = function(img)
{
    this.img = img;
    this.offsetX = img.width/2;
    this.offsetY = img.height/2;
}

Sprite.prototype.width = function()
{
    return this.img.width;
}

Sprite.prototype.height = function()
{
    return this.img.height;
}

Sprite.prototype.update = function(dt)
{
}

/* SpriteGroup */
function SpriteGroup() {
    this.sprites = {};
}

SpriteGroup.prototype.render = function(context, clipx1, clipy1, clipx2, clipy2)
{
    for (var id in this.sprites)
    {
	var sprite = this.sprites[id];
	if (sprite.x < clipx1 || sprite.y < clipy1 ||
	    sprite.x > clipx2 || sprite.y > clipy2) {
	    continue;
	}

	if (sprite.rotation !== 0) {
	    /* Draw the sprite rotated */
	    context.save();
	    try {
		context.translate(
		    (sprite.x-sprite.offsetX)|0, 
		    (sprite.y-sprite.offsetY)|0);
		context.rotate(sprite.rotation);
		context.drawImage(
		    sprite.img, -sprite.offsetX, -sprite.offsetY);
	    } finally {
		context.restore();
	    }

	} else {
	    /* Draw the sprite normally, not rotated */
	    context.drawImage(
		sprite.img, 
		(sprite.x-sprite.offsetX)|0, 
		(sprite.y-sprite.offsetY)|0);
	}
    }
}

SpriteGroup.prototype.clear = function(context, bg)
{
    for (var id in this.sprites)
    {
	var sprite = this.sprites[id];
	var w = sprite.width();
	var h = sprite.height();
	var srcx = sprite.x|0;
	var srcy = sprite.y|0;

	if (sprite.rotation !== 0) {
	    /* TODO - buggy */
	    /* Clear the rotated position of the sprite */
	    context.save();
	    context.translate(
		(sprite.x-sprite.offsetX)|0-1, 
		(sprite.y-sprite.offsetY)|0-1);
	    context.rotate(sprite.rotation);
	    srcx -= 1;
	    srcy -= 1;
//	    w += 2;
//	    h += 2;
	    if (srcx < 0) srcx = 0;
	    if (srcy < 0) srcy = 0;

	    context.drawImage(
		bg, 
		srcx, srcy, // source
		w, h,
		0, 0, // dest
		w+2, h+2);
	    context.restore();

	} else {
	    /* Clear the sprite using the normal method */
	    if (srcx < 0) srcx = 0;
	    if (srcy < 0) srcy = 0;
	    context.drawImage(
		bg, 
		srcx, srcy, // source
		w, h,
		(sprite.x-sprite.offsetX)|0, 
		(sprite.y-sprite.offsetY)|0, // dest
		w, h);
	}
    }    
}

SpriteGroup.prototype.add = function(sprite) {
    this.sprites[sprite.id] = sprite;
}

SpriteGroup.prototype.remove = function(sprite) {
    delete this.sprites[sprite.id];
}

SpriteGroup.prototype.update = function(dt) {
    for (var id in this.sprites) {
	this.sprites[id].update(dt);
    }
}
