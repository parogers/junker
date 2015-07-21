/* title.js - Title screen code */

function TitleScreen()
{
    this.titleImage = null;
    this.lastTime = null;

    this.init = function() {
	/* Load the title screen, centered and scaled to the canvas */
	this.titleImage  = resize_image(
	    resources.images.title, canvas.width, canvas.height);

	/* Create a map for the background titlescreen */
	var rows = 50;
	var cols = 50;

	tileset = new Tileset(resources.images.tiles, TILEW, TILEH);

	//var level = new Level(rows, cols, 2);
	var ground = new Layer(rows, cols);
	var trees = new Layer(rows, cols);
	var fog = new Layer(rows, cols);
	for (var row = 0; row < rows; row++) {
	    for (var col = 0; col < cols; col++) {
		if (Math.random() < 0.5) 
		    ground[row][col] = WATER;
		else
		    ground[row][col] = GRASS;

		if (ground[row][col] == GRASS) {
		    if (Math.random() > 0.3) {
			trees[row][col] = TREES;
		    } else if (Math.random() > 0.25) {
			trees[row][col] = FLOWERS;
		    }
		}
	    }
	}

	for (var n = 0; n < 70; n++) 
	{
	    row = randint(0, rows-1);
	    col = randint(0, cols-1);
	    for (var r = 0; r < 3; r++)
		for (var c = 0; c < 5; c++)
		    if (col+c < cols && row+r < rows)
			fog[row+r][col+c] = FOG;
	}

	terr = new Terrain(tileset, ground, DIRT);
	terr2 = new Terrain(tileset, trees);
	terr3 = new Terrain(tileset, fog, NOTHING);

	this.view = new TerrainView([terr, terr2], canvas.width, canvas.height);
	this.view.update();
	this.view.xpos = 50;
	this.view.ypos = 50;

	this.fogview = new TerrainView([terr3], canvas.width, canvas.height);
	this.fogview.update();
    }

    this.draw_frame = function(context)
    {
	var now = Date.now();

	context.save();
	//ctx.scale(1.5, 1.5);
	if (this.lastTime != null) {
	    var dt = (now - this.lastTime)/1000; // (ms to s)
	    /* Enforce the minimum FPS */
	    dt = Math.min(dt, 1.0/MIN_FPS);

	    this.fogview.xpos = this.view.xpos + 50*Math.cos(now/2000.0);
	    this.fogview.ypos = this.view.ypos+10*Math.sin(now/2400.0);

	    /* Update the terrains */
	    this.fogview.update();
	    this.view.update();

	    /* Updates sprites and the player */
	    /*grp.update(dt);
	    if (xpos != -1) {
		player.x = xpos;
		player.y = ypos;
		xpos = -1;
	    }
	    player.rotation += dt;
	    player.rotateOffsetX = 12;
	    player.rotateOffsetY = 12;*/

	    /* Render the terrain layers */
	    this.view.render(context, 0, 0);
	    this.fogview.render(context, 0, 0);
	    /* Now render the sprites */
	    /*grp.render(ctx);*/

	    /* Render the title image over the terrain */
	    context.drawImage(this.titleImage, 0, 0);

	    /* Render some starter text (the shadow first)*/
	    context.font = "30px Arial";
	    var msg = "Press any key to play";
	    var w = context.measureText(msg).width;
	    var x = canvas.width/2-w/2-1
	    var y = (canvas.height*0.9)|0;
	    /* Render the text shadow */
	    context.fillText(msg, x-2, y-2);

	    /* Have the text flash a bit, overtop the shadow */
	    var n = (200+50*Math.sin(now/150))|0;
	    context.fillStyle = "rgb(" + n + "," + n + "," + n + ")";
	    context.fillText(msg, x, y);
	}
	context.restore();
	this.lastTime = now;
    }
}

