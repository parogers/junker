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

/* state.js - Game state machine */

function StateMachine(states)
{
    this.states = states;
    this.current = "";
    this.lastTime = null;

    /* Returns the current state we are in */
    this.get_state = function()
    {
	return this.states[this.current];
    }

    this.handle_event = function(event)
    {
	/* Pass the event along to the current state */
	if (this.get_state().handle_event) {
	    var next = this.get_state().handle_event(event);
	    if (next) this.change_state(next);
	}
    }

    this.draw_frame = function()
    {
	/* Calculate how much time has passed since the last draw request */
	var dt = 0;
	var now = Date.now();
	var state = this.get_state();
	var next = null;

	if (this.lastTime !== null) {
	    dt = (now - this.lastTime)/1000; // (ms to s)
	    /* Enforce the minimum FPS */
	    dt = Math.min(dt, 1.0/MIN_FPS);
	}
	this.lastTime = now;

	if (state.update) {
	    /* Update the current state */
	    next = state.update(dt);
	}

	/* Pass along the draw frame request to the current state */
	if (state.draw_frame) {
	    state.draw_frame(ctx);
	}

	/* Possibly change the game state */
	if (next) {
	    this.change_state(next);
	}

	/* Schedule the next frame draw */
	requestAnimFrame(function(st) {
	    return function() {
		st.draw_frame();
	    }
	}(this));
    }

    this.change_state = function(next) 
    {
	if (!next) {
	    throw Error("change_state - next state is not set");
	}
	if (next === this.current) {
	    /* Already in this state */
	    return;
	}
	log_message("Switching to state: " + next);
	/* Leave the current state and enter into the next */
	var state = this.get_state();
	if (state && state.leave) state.leave();
	/* Enter the next state */
	this.current = next;
	state = this.get_state();
	if (!state) {
	    throw Error("get_state - next state not valid: " + next);
	}
	if (state.enter) state.enter();
    }
}

function Sequence(next, states)
{
    this.states = states;
    this.current = -1;
    this.next = next;

    this.enter = function()
    {
	this.current = -1;
    }

    this.update = function(dt) 
    {
	if (this.current === -1) {
	    /* Enter into the first state */
	    this.current = 0;
	    this.states[this.current].enter();
	}
	if (this.current >= this.states.length) {
	    return;
	}
	/* Update the current state */
	var state = this.states[this.current];
	var done = state.update(dt);
	if (done) {
	    this.current += 1;
	    if (this.current >= this.states.length) {
		/* Done the sequence */
		return this.next;
	    } else {
		/* Enter the next state */
		this.states[this.current].enter(state);
	    }
	}
    }

    this.draw_frame = function(ctx)
    {
	if (this.current >= 0 && this.current < this.states.length)
	{
	    this.states[this.current].draw_frame(ctx);
	}
    }
}
