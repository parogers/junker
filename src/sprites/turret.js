/* turret.js */

/* Stationary turret that tracks and shoots at the player periodically */
function Turret()
{
    /* Constructor */
    Sprite.call(this);

    /* Sprite for the turrent gun. This is constructed in the next call
     * to 'update' below. */
    this.gunSprite = null;
    /* Maximum number of shots per second */
    this.firingRate = 1;
    /* Cooldown counter between shots (calculate from the rate and 
     * decremented in 'update') */
    this.cooldown = 0;
    /* Whether we are tracking the player */
    this.tracking = false;

    //this.set_image(resources.images.turretBase);
}

Turret.prototype = new Sprite;

Turret.prototype.update = function(dt) 
{
    if (this.gunSprite === null) 
    {
	/* Build the gun sprite and add it to the level */
	this.gunSprite = new Sprite();
	this.gunSprite.set_image(resources.images.turretGun);
	this.gunSprite.offsetX = this.gunSprite.width()/2;
	this.gunSprite.offsetY = this.gunSprite.height()/2;
	this.gunSprite.x = this.x+this.offsetX;
	this.gunSprite.y = this.y+this.offsetY;
	/* Make sure the gun is rendered above the turret base */
	this.level.middleSprites.add(this.gunSprite);
    }

    this.gunSprite.rotation += 3*dt;

    /* Aim the barrel towards the player, if they're close enough */
    /* ... */
    this.tracking = true;

    /* Periodically shoot at the player */
    if (this.tracking) 
    {
	this.cooldown -= dt;
	if (this.cooldown <= 0) {
	    /* Ready to fire another shot */
	    this.cooldown = 1.0 / this.firingRate;
	}
    }
}
