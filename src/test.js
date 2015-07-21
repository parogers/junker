/* test.js */

var MIN_FPS = 10;

var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

var TILEW = 16;
var TILEH = 16;

var IMAGES = {
    "dot" : "image.png", 
    "dot2" : "image2.png", 
    "title" : "junker-title.png", 
    "bg3" : "bg.jpg",
    "bg2" : "bg2.png",
    "tiles" : "tiles2.png"};

var AUDIO = {
    "shot" : "shot1.wav",
    "tunes" : "music.wav"};

var gameState = new GameState();
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
var resources = null;

function documentLoaded(cvs)
{
    canvas = cvs;
    ctx = canvas.getContext("2d");
//    ctx.fillRect(10,10,50,20);
//    ctx.font = "bold 14pt sans-serif";
//    ctx.fillText("hello world", 30, 60);

    canvas.focus();

    //canvas.addEventListener("mousemove", mouse_move, true);
    //canvas.addEventListener("mousedown", mouse_press, true);
    //canvas.addEventListener("keydown", key_down, true);
    //canvas.addEventListener("keypress", key_press, true);
    //canvas.addEventListener("keyup", key_up, true);

    resources = new Resources("../media/", IMAGES, AUDIO);
    resources.onComplete = main;
    resources.load();
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

    player = new Sprite();
    player.controls = new Controls();
    player.img = resources.images.dot2;
    player.update = player_update;
    player.speed = 150;
    //player.rotation = 0.4;

    shot = new AudioPool(resources.sounds.shot);
    shot.set_volume(0.5);

    music = new AudioPool(resources.sounds.tunes);
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

    cb = function(st) {
	return function(ev) {
	    st.handle_event(ev);
	}
    }(gameState);
    canvas.addEventListener("mousedown", cb, true);

    gameState.change_state(gameState.TITLE);
    gameState.draw_frame();

    //loop();
}

var lastTime = null;

function loop()
{
    title.draw_frame(ctx);
    requestAnimFrame(loop);
}
