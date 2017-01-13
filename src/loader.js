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

/* loader.js */

function load_level(path, onComplete)
{
    /* Setup a callback to parse the JSON level file once it's loaded */
    return $.getJSON(path, function(data) {
	onComplete(parse_level(data));
    });
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
    level.groundTerr.dirty = true;
    level.midgroundTerr.dirty = true;

    for (var n = 0; n < enemies.length; n++) 
    {
	var type = enemies[n][0];
	var x = enemies[n][1];
	var y = enemies[n][2];

	if (type == "start") {
	    level.player_start = [x*2*TILEW, y*2*TILEH];
	    continue;
	}

	log_message("Spawning " + type);

	classes = {
	    "turret" : Turret,
	    "trainturret" : TrainTurret,
	    "jet" : Jet,
	    "pod" : Pod,
	    "speed" : SpeedPowerup,
	    "multishot" : MultishotPowerup,
	    "bunker" : Bunker,
	    "podemitter" : PodEmitter,
	};

	var e = new classes[type];
	e.x = 2*TILEW*x;
	e.y = 2*TILEH*y;
	if (type != "jet") {
	    e.x += TILEW;
	    e.y += TILEH;
	}
	e.spawn(level);
    }
    level.spawn_player();

    return level;
}

function load_sound(name, path, onload, onerror)
{
    var snd = new Audio();

    snd.oncanplaythrough = function() {
	/* Remove the event handler so it's not called later. This
	 * can happen in Firefox when an audio clip is looped */
	this.oncanplaythrough = undefined;
	onload(name, snd);
    }
    snd.onerror = function(e) {
	/* Remove the event handler so it's not called later */
	this.onerror = undefined;
	onerror(name, e);
    }
    snd.src = path;
}

function load_image(name, path, onload, onerror)
{
    var img = new Image();
    img.onload = function() { onload(name, img); }
    img.onerror = function(e) { onerror(name, e); }
    img.src = path;
}

function load_resources(basePath, srcList, oncomplete, onerror, onload)
{
    var resources = {};
    var remaining = {};

    for (var name in srcList) {
	remaining[name] = srcList[name];
    }

    function resource_loaded(name, res)
    {
	/* Add to the list of loaded resources, remove from the list of
	 * ones remaining to be loaded */
	var i = name.indexOf(".");
	if (i != -1) {
	    var prefix = name.substr(0, i);
	    if (resources[prefix] === undefined) {
		resources[prefix] = {};
	    }
	    resources[prefix][name.substr(i+1)] = res;
	} else {
	    resources[name] = res;
	}
	delete remaining[name];
	if (onload) onload(name);
	if (Object.keys(remaining).length === 0 && oncomplete) {
	    oncomplete(resources);
	}
    }

    function resource_failed(name, e)
    {
	if (onerror) onerror(srcList[name]);
	delete remaining[name];
    }

    var names = Object.keys(srcList);
    names.sort();
    for (var n = 0; n < names.length; n++)
    {
	var name = names[n];
	var src = srcList[name];
	if (endswith(src.toLowerCase(), "wav") ||
	    endswith(src.toLowerCase(), "ogg")) {
	    load_sound(
		name,
		basePath + src, 
		resource_loaded, resource_failed);

	} 
	else if (endswith(src.toLowerCase(), "png") || 
		 endswith(src.toLowerCase(), "gif") || 
		 endswith(src.toLowerCase(), "jpg")) 
	{
	    load_image(
		name,
		basePath + src, 
		resource_loaded, resource_failed);
	}
    }
    return resources;
}
