/* sprite.js */

SpriteID = 0;

function Rect() {
}

/* Sprite */
function Sprite() {
    this.id = SpriteID++;
    this.img = null;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.rotateOffsetX = 0;
    this.rotateOffsetY = 0;
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

SpriteGroup.prototype.render = function(context) 
{
    for (var id in this.sprites)
    {
	var sprite = this.sprites[id];
	if (sprite.rotation != 0) {
	    /* Draw the sprite rotated */
	    context.save();
	    context.translate(
		(sprite.x-sprite.rotateOffsetX)|0, 
		(sprite.y-sprite.rotateOffsetY)|0);
	    context.rotate(sprite.rotation);
	    context.drawImage(sprite.img, 
			      -sprite.rotateOffsetX, -sprite.rotateOffsetY);
	    context.restore();
	} else {
	    context.drawImage(
		sprite.img, 
		sprite.x|0, 
		sprite.y|0);
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

	if (sprite.rotation != 0) {
	    /* TODO - buggy */
	    /* Clear the rotated position of the sprite */
	    context.save();
	    context.translate(
		(sprite.x-sprite.rotateOffsetX)|0-1, 
		(sprite.y-sprite.rotateOffsetY)|0-1);
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
		sprite.x|0, sprite.y|0, // dest
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
