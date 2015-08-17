/* level.js */

function Level(tileset, rows, cols)
{
    /* The layers */
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
    this.terrainView.ypos = 3500;

    this.player = null;
    this.sprites = null;

    this.update = function(dt) 
    {
	//this.terrainView.xpos = ...;
	//this.terrainView.ypos = ...;
	this.terrainView.update(dt);
    }

    this.draw_frame = function(context)
    {
	this.terrainView.render(context, 0, 0);
    }
}

/* Takes a chunk of JSON type data and returns a Level object */
function parse_level(data)
{
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
