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

/* gamestate.js */

/* The state machine that drives the entire game. It transitions through
 * the title screen, gameplay to the game over screen. */
function GameStateMachine()
{
    StateMachine.call(this, {
	/* Title sequence */
	title: {
	    title: new TitleScreen(),
	    /*enter: function() {
	    },
	    leave: function() {
	    },*/
	    update: function(dt) {
		this.title.update(dt);
		//return "name-of-next-state";
	    },
	    handle_event: function(event) {
		/* Waiting for the user to mouse click or press a key */
		if (event.type === "mousedown" || event.type === "keydown") {
		    var key = event.which || event.keyCode;
		    /* Press the control or alt key alone doesn't start 
		     * the game */
		    if (key == CONTROL || key == ALT) return;
		    //return "startFadeOut";
		    return "loadLevel";
		}
	    },
	    draw_frame: function(ctx) {
		this.title.draw_frame(ctx);
	    },
	},

	/* Show the intro sequence */
	startFadeOut: {
	    enter: function() {
		this.orig = copy_image(canvas);
		this.trans = new Fadeout(this.orig, 0.5);
		this.delay = 1;
	    },
	    update: function(dt) {
		this.trans.update(dt);
		if (this.trans.done) {
		    this.delay -= dt;
		    if (this.delay <= 0)
			return "loadLevel";
		};
	    },
	    draw_frame: function(ctx) {
		this.trans.draw_frame(ctx);
	    },
	},

	/* Loading the level before starting gameplay */
	loadLevel: {
	    enter: function() {
		/* Load the game level via callback */
		resources.load_level("levels/demo.json", function(level) {
		    /* TODO - find a better place to store this */
		    resources.level = level;

		}).fail(function(obj, err, msg) {
		    alert("Failed to load level: " + msg);

		});

	    },
	    update: function() {
		/* Waiting for the above code to load the level */
		if (resources.level !== null) {
		    return "gameplay";
		}
	    },
	},

	/* The gameplay */
	gameplay: {
	    enter : function() {
		/* Switch to a crosshair cursor for gameplay */
		canvas.style.cursor = "crosshair";
	    },
	    leave : function() {
		/* Switch back to the regular default cursor */
		canvas.style.cursor = "auto";
		/* Stop playing all audio */
		resources.shotAudio.pause();
		resources.sounds.motorIdle.pause();
	    },
	    update: function(dt) {
		//resources.level.terrainView.ypos -= 100*dt;
		resources.level.update(dt);
	    },
	    handle_event: function(event) {
		var key=null;
		switch(event.type) 
		{
		case "keypress":
		    var key = event.which || event.keyCode;

		    /* Let the user refresh the page */
		    if ((key === R_KEY || key === LOWER_R_KEY) &&
			event.ctrlKey || key === F5_KEY) {
			return;
		    }
		    utils_stop_event(event);
		    break;

		case "mousemove":
		    /* TODO - test this on other browsers */
		    var rect = canvas.getBoundingClientRect();
		    controls.cursorX = event.clientX - rect.left;
		    controls.cursorY = event.clientY - rect.top;
		    break;

		case "mousedown":
		    if (event.button == MOUSE_LEFT) {
			controls.fire = true;
		    } else if (event.button == MOUSE_RIGHT) {
			controls.secondary = true;
		    }
		    break;

		case "mouseup":
		    if (event.button == MOUSE_LEFT) {
			controls.fire = false;
		    } else if (event.button == MOUSE_RIGHT) {
			controls.secondary = false;
		    }
		    break;

		case "keydown":
		    var key = event.which || event.keyCode;
		    /* Return to the title screen. We handle the escape key
		     * here because it works in both Chrome and Firefox */
		    if (key === ESCAPE) return "title";
		    /* Handle the arcade controls */
		    if (key === UP) controls.up = true;
		    else if (key === DOWN) controls.down = true;
		    else if (key === LEFT) controls.left = true;
		    else if (key === RIGHT) controls.right = true;
		    else if (key === FIRE) controls.fire = true;
		    else break;
		    /* If we've handled the key press above, stop the event
		     * now to prevent unwanted side effects from the browser
		     * handling the event. (eg scrolling the window) */
		    utils_stop_event(event);
		    break;

		case "keyup":
		    var key = event.which || event.keyCode;
		    if (key === UP) controls.up = false;
		    else if (key === DOWN) controls.down = false;
		    else if (key === LEFT) controls.left = false;
		    else if (key === RIGHT) controls.right = false;
		    else if (key === FIRE) controls.fire = false;
		    else break;
		    /* If we've handled the key press above, stop the event
		     * now to prevent unwanted side effects from the browser
		     * handling the event. (eg scrolling the window) */
		    utils_stop_event(event);
		    break;

		}
	    },
	    draw_frame: function(ctx) {
		resources.level.draw_frame(ctx);
	    },
	},

    });
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
