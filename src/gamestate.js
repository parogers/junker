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
		if (event.type === "mousedown" || event.type === "keypress") {
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
		/* Load the level JSON file */
		$.getJSON("levels/out.json", function(data) {
		    /* TODO - find a better place to store this */
		    resources.level = parse_level(data);

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
	    update: function(dt) {
		//resources.level.terrainView.ypos -= 100*dt;
		resources.level.update(dt);
	    },
	    handle_event: function(event) {
		if (event.type === "mousedown" || event.type === "keypress") {
		    return "title";
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
