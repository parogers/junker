/* state.js - Game state machine */

function GameState()
{
    this.NONE = -1;
    this.TITLE = 0;
    this.GAMEPLAY = 1;
    this.DEAD = 2;
    this.GAMEOVER = 3;

    this.lastState = this.NONE;
    this.state = this.NONE;
    this.title = null;

    this.change_state = function(newState)
    {
	if (this.state == newState) {
	    /* Nothing changed */
	    return;
	}

	this.lastState = this.state;
	this.state = newState;

	if (this.state == this.TITLE) {
	    /* Show the title screen */
	    this.title = new TitleScreen();
	    this.title.init();
	} else if (this.state == this.GAMEPLAY) {
	    /* Start the gameplay */
	} else if (this.state == this.DEAD) {
	    /* Respawn the player */
	} else if (this.state == this.GAMEOVER) {
	    /* Show the game over screen */
	}
    }

    this.handle_event = function(event) {
	if (this.state == this.TITLE) {
	    /* Waiting for the user to mouse click or press a key */
	    if (event.type == "mousedown") {
		this.change_state(this.GAMEPLAY);
	    }
	}
    }

    this.draw_frame = function() 
    {
	if (this.state == this.TITLE) {
	    this.title.draw_frame(ctx);
	}

	requestAnimFrame(function(st) {
	    return function() {
		st.draw_frame();
	    }
	}(this));
    }
}
