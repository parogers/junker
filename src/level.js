/* level.js */

function Level(tileset, rows, cols)
{
    /* The layers */
    this.rows = rows;
    this.cols = cols;
    this.ground = new Layer(rows, cols);
    this.midground = new Layer(rows, cols);

    /* The ground terrain (dirt, water, etc) */
    this.groundTerr = new Terrain(tileset, this.ground, DIRT);
    /* The middle ground, being obstacles like trees, walls */
    this.midgroundTerr = new Terrain(tileset, this.midground, NOTHING);

    this.terrainView = new TerrainView(
	[this.groundTerr, this.midgroundTerr], 
	canvas.width, canvas.height);

    this.terrainView.xpos = 50;
    this.terrainView.ypos = this.rows*TILEH*2-2*canvas.height;

    this.player = null;
    /* Sprite groups for things on the ground, hovering above the ground
     * and those in the air. */
    this.groundSprites = new SpriteGroup();
    this.middleSprites = new SpriteGroup();
    this.airSprites = new SpriteGroup();
    this.sprites = null;

    this.update = function(dt) 
    {
	//this.terrainView.xpos = ...;
	//this.terrainView.ypos = ...;
	this.terrainView.update(dt);
	this.groundSprites.update(dt);
	this.middleSprites.update(dt);
	this.airSprites.update(dt);
    }

    this.draw_frame = function(context)
    {
	this.terrainView.render(context, 0, 0);
	context.save();
	try {
	    /* The sprite rendering code isn't aware of the terrain view, so
	     * we need to translate the graphics context so the sprites that
	     * should be visible are visible when rendered. */
	    context.translate(
		    -this.terrainView.xpos|0, 
		    -this.terrainView.ypos|0);
	    /* Construct a clipping box for drawing the sprites. We only need
	     * to render the sprites that are visible via the terrain's view */
	    var buf = TILEW*4;
	    var x1 = this.terrainView.xpos-buf;
	    var y1 = this.terrainView.ypos-buf;
	    var x2 = this.terrainView.xpos+this.terrainView.width+buf;
	    var y2 = this.terrainView.ypos+this.terrainView.height+buf;
	    /* Render the sprites in order by depth */
	    this.groundSprites.render(context, x1, y1, x2, y2);
	    this.middleSprites.render(context, x1, y1, x2, y2);
	    this.airSprites.render(context, x1, y1, x2, y2);
	} finally {
	    context.restore();
	}
    }
}

/* Takes a chunk of JSON type data and returns a Level object */
function parse_level(data)
{
    var enemies = data["enemies"];
    var ground = data["ground"];
    var midground = data["midground"];
    var cols = ground[0].length;
    var rows = ground.length;

    var level = new Level(resources.tileset, rows, cols);
    for (var row = 0; row < rows; row++) {
	for (var col = 0; col < cols; col++) {
	    /* Map the terrain number (used in the JSON file) to the
	     * terrain name, then to the terrain number used by the
	     * game engine. */
	    level.ground[row][col] = TERRAIN_NAME_MAPPING[
		data["terrains"][ground[row][col]]];

	    level.midground[row][col] = TERRAIN_NAME_MAPPING[
		data["terrains"][midground[row][col]]];
	}
    }

    for (var n = 0; n < enemies.length; n++) 
    {
	var type = enemies[n][0];
	var x = enemies[n][1];
	var y = enemies[n][2];

	if (type === "turret") 
	{
	    var e = new Turret();
	    e.level = level;
	    e.set_image(resources.images.turretBase);
	    e.x = 2*TILEW*x + TILEW;
	    e.y = 2*TILEH*y + TILEH;
	    /* The turret base sits on the ground */
	    level.groundSprites.add(e);
	}
    }

    return level;
}

function generate_level(tileset, rows, cols)
{
    var level = new Level(tileset, rows, cols);

    for (var row = 0; row < rows; row++) {
	for (var col = 0; col < cols; col++) {
	    level.ground[row][col] = GRASS;

/*	    if (Math.random() < 0.5) 
		level.ground[row][col] = WATER;
	    else
		level.ground[row][col] = GRASS;

	    if (level.ground[row][col] == GRASS) {
		if (Math.random() > 0.3) {
		    level.midground[row][col] = TREES;
		} else if (Math.random() > 0.25) {
		    level.midground[row][col] = FLOWERS;
		}
	    }*/
	}
    }

    return level;
}
