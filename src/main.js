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

/* TODO - put this into a JSON config file */
var IMAGES = {
    "dot" : "image.png", 
    "dot2" : "image2.png", 
    "title" : "junker-title.png", 
    "bg3" : "bg.jpg",
    "bg2" : "bg2.png",
    "tiles" : "tiles2.png",

    "shot1" : "shot/shot1.png",
    "shot2" : "shot/shot2.png",
    "shot3" : "shot/shot3.png",
    "shot4" : "shot/shot4.png",

    "bomb1" : "bomb/bomb1.png",
    "bomb2" : "bomb/bomb2.png",
    "bomb3" : "bomb/bomb3.png",

    "tankBase1" : "player/tankbase1.png",
    "tankBase2" : "player/tankbase2.png",
    "tankBase3" : "player/tankbase3.png",
    "tankBase4" : "player/tankbase4.png",

    "explode1" : "explosion/explode1.png",
    "explode2" : "explosion/explode2.png",
    "explode3" : "explosion/explode3.png",
    "explode4" : "explosion/explode4.png",
    "explode5" : "explosion/explode5.png",
    "explode6" : "explosion/explode6.png",

    "big_explode1" : "big-explosion/explode1.png",
    "big_explode2" : "big-explosion/explode2.png",
    "big_explode3" : "big-explosion/explode3.png",
    "big_explode4" : "big-explosion/explode4.png",
    "big_explode5" : "big-explosion/explode5.png",
    "big_explode6" : "big-explosion/explode6.png",

    "tankWater" : "player/tankbase-water.png",
    "tankGun" : "player/tank-gun.png",
    "turretBase" : "turret/turret-base.png",
    "turretGun" : "turret/turret-gun.png",
    "testing" : "testing.gif"
};

var AUDIO = {
    "motorIdle" : "audio/motor-idle.ogg",
    "motorRun" : "audio/motor-run.ogg",
    "shot1" : "audio/shot1.wav",
    "shot2" : "audio/shot2.wav",
    "shot3" : "audio/shot3.wav",
    "shot4" : "audio/shot4.wav",
    "hit1" : "audio/hit1.wav",
    "explode1" : "audio/explode1.wav",
    "explode2" : "audio/explode2.wav",
    "explode3" : "audio/explode3.wav",
    /*"music" : "audio/manoeuvre_0.ogg",*/
    "splash" : "audio/splash.wav",
    "rumble" : "audio/rumble.wav",
};

var gameState = null;
var titleImage = null;
var tileset = null;
var canvas = null;
var ctx = null;
var imageLoader = null;
var audioLoader = null;
var bg = null;
var shot = null;
var music = null;
var resources = null;

function Controls()
{
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.fire = false;
    this.secondary = false;
    this.cursorX = 0;
    this.cursorY = 0;
}

function log_message(txt)
{
    var div = document.getElementById("message_area");
    div.innerHTML += txt + "<br/>";
    div.scrollTop = div.scrollHeight;
}

function documentLoaded(cvs)
{
    canvas = cvs;
    ctx = canvas.getContext("2d");
//    ctx.fillRect(10,10,50,20);
//    ctx.font = "bold 14pt sans-serif";
//    ctx.fillText("hello world", 30, 60);

    canvas.focus();

    resources = new Resources("../media/", IMAGES, AUDIO, main);
    resources.load();
}

/************/
/* Mainline */
/************/

/* The main entry point for the game, called after the basic resources
 * like sounds and images have been loaded. */
function main()
{
    log_message("*** Starting game");

    /* Construct the tileset */
    resources.tileset = new Tileset(resources.images.tiles, TILEW, TILEH);

    /* TODO - create a loader for animations via JSON files */
    resources.shotFrames = [
	resources.images.shot1,
	resources.images.shot2,
	resources.images.shot3,
	resources.images.shot4];

    resources.explosionFrames = [
	resources.images.explode1,
	resources.images.explode2,
	resources.images.explode3,
	resources.images.explode4,
	resources.images.explode5,
	resources.images.explode6
    ];

    resources.bigExplosionFrames = [
	resources.images.big_explode1,
	resources.images.big_explode2,
	resources.images.big_explode3,
	resources.images.big_explode4,
	resources.images.big_explode5,
	resources.images.big_explode6
    ];

    controls = new Controls();

    resources.shotAudio = new AudioPool(resources.sounds.shot2);
    resources.shotAudio.set_volume(0.4);

    resources.turretShotAudio = new AudioPool(resources.sounds.shot3);
    resources.turretShotAudio.set_volume(0.2);

    resources.bombShotAudio = new AudioPool(resources.sounds.shot4);
    resources.bombShotAudio.set_volume(0.2);

    resources.explodeAudio = new AudioPool(resources.sounds.explode1);
    resources.explodeAudio.set_volume(0.3);

    resources.splashAudio = new AudioPool(resources.sounds.splash);
    resources.splashAudio.set_volume(0.4);

    resources.rumbleAudio = new AudioPool(resources.sounds.rumble);
    resources.rumbleAudio.set_volume(0.3);

    resources.bombAudio = new AudioPool(resources.sounds.explode3);
    resources.bombAudio.set_volume(0.4);

    //resources.explodeTurretAudio = new AudioPool(resources.sounds.explode1);
    //resources.explodeTurretAudio.set_volume(0.2);

    //music = new AudioPool(resources.sounds.music);
    //music.set_volume(0.3);
    //music.play();

    gameState = new GameStateMachine();

    cb = function(ev) {
	gameState.handle_event(ev);
	return false;
    }

    canvas.addEventListener("mousemove", cb, true);
    canvas.addEventListener("mouseup", cb, true);
    canvas.addEventListener("mousedown", cb, true);
    canvas.addEventListener("keypress", cb, true);
    canvas.addEventListener("keydown", cb, true);
    canvas.addEventListener("keyup", cb, true);

    /* Disable the content menu popup when the players clicks with the
     * right mouse button. */
    cb = function(ev) {
	utils_stop_event(ev);
	return false;
    }
    canvas.addEventListener("contextmenu", cb, true);

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
