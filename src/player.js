/* player.js */

function Controls()
{
    this.up = null;
    this.down = null;
    this.left = null;
    this.right = null;
}

function player_update(dt)
{
    if (this.controls.up) {
	this.y -= this.speed*dt;
    }
    if (this.controls.down) {
	this.y += this.speed*dt;
    }
    if (this.controls.left) {
	this.x -= this.speed*dt;
    }
    if (this.controls.right) {
	this.x += this.speed*dt;
    }
}

