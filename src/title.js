/* title.js - Title screen code */

function TitleScreen()
{
    this.titleImage = null;
    this.lastTime = null;

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

    this.time = 0;

    this.update = function(dt)
    {
	this.time += dt;
	this.fogview.xpos = this.view.xpos + 50*Math.cos(this.time/3);
	this.fogview.ypos = this.view.ypos + 10*Math.sin(this.time/10);

	/* Update the terrains */
	this.fogview.update();
	this.view.update();
    }

    this.draw_frame = function(context)
    {
	context.save();
	//ctx.scale(1.5, 1.5);

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
	var n = (200+50*Math.sin(4*this.time))|0;
	context.fillStyle = "rgb(" + n + "," + n + "," + n + ")";
	context.fillText(msg, x, y);

//	    context.fillStyle = "rgba(255,0,0,.5)";
//	    context.fillRect(0, 0, 300, 200);
	context.restore();
    }
}

function GameStartSequence(next)
{
    Sequence.call(this, next, [
	/* Fade out */
	{
	    enter: function() {
		this.orig = copy_image(canvas);
		this.trans = new Fadeout(this.orig, 0.5);
	    },
	    update: function(dt) {
		this.trans.update(dt);
		return this.trans.done;
	    },
	    draw_frame: function(ctx) {
		this.trans.draw_frame(ctx);
	    },
	},
	/* Fade back in */
	{
	    enter: function(prev) {
		this.trans = new Fadein(prev.orig, 1);
	    },
	    update: function(dt) {
		this.trans.update(dt);
		return this.trans.done;
	    },
	    draw_frame: function(ctx) {
		this.trans.draw_frame(ctx);
	    },
	},

    ]);
}

function GameStateMachine()
{
    StateMachine.call(this, {
	/* Title sequence */
	title: {
	    title: new TitleScreen(),
	    enter: function() {
	    },
	    leave: function() {
	    },
	    update: function(dt) {
		this.title.update(dt);
		//return "name-of-next-state";
	    },
	    handle_event: function(event) {
		/* Waiting for the user to mouse click or press a key */
		if (event.type == "mousedown" || event.type == "keypress") {
		    return "gameplay";
		}
	    },
	    draw_frame: function(ctx) {
		this.title.draw_frame(ctx);
	    },
	},
	gameplay: new GameStartSequence("title"),

    });
}
