/* test.js */

var MIN_FPS = 10;

var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

var TILEW = 16;
var TILEH = 16;

var titleImage = null;
var tileset = null;
var player = null;
var canvas = null;
var ctx = null;
var imageLoader = null;
var audioLoader = null;
var bg = null;
var shot = null;
var music = null;

function documentLoaded(cvs)
{
    canvas = cvs;
    ctx = canvas.getContext("2d");
//    ctx.fillRect(10,10,50,20);

//    ctx.font = "bold 14pt sans-serif";
//    ctx.fillText("hello world", 30, 60);

    canvas.focus();

    //canvas.addEventListener("mousemove", mouse_move, true);
    canvas.addEventListener("mousedown", mouse_press, true);
    canvas.addEventListener("keydown", key_down, true);
    canvas.addEventListener("keypress", key_press, true);
    canvas.addEventListener("keyup", key_up, true);

    imageLoader = new ImageLoader("../media/");
    imageLoader.onComplete = function() {
	/* Now load the audio */
	load_audio();
    };
    imageLoader.load(
	{"dot" : "image.png", 
	 "dot2" : "image2.png", 
	 "bg" : "junker-title.png", 
	 "bg3" : "bg.jpg",
	 "bg2" : "bg2.png",
	 "tiles" : "tiles2.png"}
    );
}

function load_audio()
{
    audioLoader = new AudioLoader("../media/");
    audioLoader.onComplete = function() {
	/* Start the game proper */
	main();
    };
    audioLoader.load(
	{"shot" : "shot1.wav",
	 "tunes" : "music.wav"}
    );
}

var xpos = -1, ypos = -1;
var y = 10;
function mouse_press(event)
{
    var rect = canvas.getBoundingClientRect();
//    ctx.fillRect(0,0,50,y);
    shot.play();
//    y += 10;
    xpos = event.clientX - rect.left;
    ypos = event.clientY - rect.top;
}

function mouse_move(event)
{
    var rect = canvas.getBoundingClientRect();
    xpos = event.clientX - rect.left;
    ypos = event.clientY - rect.top;
}

function key_down(event)
{
    /* TODO - test this on chrome and IE8- */
    var key = event.which || event.keyCode;
    if (key == UP) player.controls.up = true;
    else if (key == DOWN) player.controls.down = true;
    else if (key == LEFT) player.controls.left = true;
    else if (key == RIGHT) player.controls.right = true;
    event.stopPropagation();
}

function key_press(event)
{
    event.stopPropagation();
}

function key_up(event)
{
    var key = event.which || event.keyCode;
    if (key == UP) player.controls.up = false;
    else if (key == DOWN) player.controls.down = false;
    else if (key == LEFT) player.controls.left = false;
    else if (key == RIGHT) player.controls.right = false;
    event.stopPropagation();
}

/************/
/* Mainline */
/************/

function main()
{
    function update(dt)
    {
	this.tm += dt;
	this.x = 200+100*Math.sin(2*this.tm);
	this.y = 300+100*Math.sin(1.5*this.tm);
	//this.y += 500*dt;
    }

    var rows = 50;
    var cols = 50;

    tileset = new Tileset(imageLoader.images.tiles, TILEW, TILEH);

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

    view = new TerrainView([terr, terr2], canvas.width, canvas.height);
    view.update();
    view.xpos = 50;
    view.ypos = 50;

    fogview = new TerrainView([terr3], canvas.width, canvas.height);
    fogview.update();

    player = new Sprite();
    player.controls = new Controls();
    player.img = imageLoader.images.dot2;
    player.update = player_update;
    player.speed = 150;
    //player.rotation = 0.4;

    shot = new AudioPool(audioLoader.sounds.shot);
    shot.set_volume(0.5);

    music = new AudioPool(audioLoader.sounds.tunes);
    music.set_volume(0.4);
    //music.play();

    grp = new SpriteGroup();
    grp.add(player);

/*    for (var n = 0; n < 15; n++) {
	var spr = new Sprite();
	spr.img = imageLoader.images.dot;
	spr.update = update;
	spr.y = 30+20*n;
	spr.tm = n;
	grp.add(spr);
    }*/

    /* Show the title screen, centered and scaled to the canvas */
    titleImage  = resize_image(
	imageLoader.images.bg, canvas.width, canvas.height);
    ctx.drawImage(titleImage, 0, 0);

    loop();
}

var lastTime = null;
var frames = 0;

function loop()
{
    var now = Date.now();

    ctx.save();
    //ctx.scale(1.5, 1.5);
    if (lastTime != null) {
	var dt = (now - lastTime)/1000; // (ms to s)

	/* Enforce the minimum FPS */
	dt = Math.min(dt, 1.0/MIN_FPS);

	frames++;

	/*if (Math.floor(lastTime/1000) != Math.floor(now/1000)) {
	    console.log("FPS: " + frames);
	    frames = 0;
	}*/

/*	xp = Math.floor(50*Math.cos(now/200.));
	yp = Math.floor(100*Math.sin(now/100.));
	ctx.drawImage(bg, xp, yp);*/

	/*xp = Math.floor(50*Math.cos(now/100.));
	yp = Math.floor(100*Math.sin(now/80.));
	ctx.drawImage(bg, xp, yp);*/

	//view.xpos = -50+100*Math.cos(now/1200.0);
	//view.ypos = 100+200*Math.cos(now/1600.0);
	//cam.ypos += 50*dt;

	fogview.xpos = view.xpos + 50*Math.cos(now/2000.0);
	fogview.ypos = view.ypos+10*Math.sin(now/2400.0);

	/* Update the terrains */
	fogview.update();
	view.update();

	/* Updates sprites and the player */
	grp.update(dt);
	if (xpos != -1) {
	    player.x = xpos;
	    player.y = ypos;
	    xpos = -1;
	}
	player.rotation += dt;
	player.rotateOffsetX = 12;
	player.rotateOffsetY = 12;

	/* Render the terrain layers */
	view.render(ctx, 0, 0);
	fogview.render(ctx, 0, 0);
	/* Now render the sprites */
	grp.render(ctx);
	/* Render the title image */
	ctx.drawImage(titleImage, 0, 0);
    }
    ctx.restore();
    lastTime = now;
    requestAnimFrame(loop);
}
