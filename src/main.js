/* JUNKER - Arcade tank shooter written in Javascript using HTML5
 * Copyright (C) 2015  Peter Rogers (peter.rogers@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * See LICENSE.txt for the full text of the license.
 */

/* main.js */

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
    "tiles" : "tiles2.png",
    "turretBase" : "turret/turret-base.png",
    "turretGun" : "turret/turret-gun.png"
};

var AUDIO = {
    "shot" : "shot1.wav",
    "tunes" : "music.wav"};

var gameState = null;
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

function log_message(txt)
{
    var div = document.getElementById("message_area");
    div.innerHTML += txt + "<br/>";
}

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
    var key = event.which || event.keyCode;
    //event.stopPropagation();
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

/* The main entry point for the game, called after the basic resources
 * like sounds and images have been loaded. */
function main()
{
    log_message("Starting game");
    function update(dt)
    {
	this.tm += dt;
	this.x = 200+100*Math.sin(2*this.tm);
	this.y = 300+100*Math.sin(1.5*this.tm);
	//this.y += 500*dt;
    }

    /* Construct the tileset */
    resources.tileset = new Tileset(resources.images.tiles, TILEW, TILEH);

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

    gameState = new GameStateMachine();

    cb = function(ev) {
	gameState.handle_event(ev);
    }

    canvas.addEventListener("mousedown", cb, true);
    canvas.addEventListener("keypress", cb, true);

    gameState.change_state("title");
    gameState.draw_frame();

/*    $.ajax({
	url: "something.txt",
	dataType: "text",
	success: function(data) {
	    alert("DONE " + data);
	}
    });*/

    log_message("Entering mainloop...");
}
