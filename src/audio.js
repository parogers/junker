/* audio.js */

/* Defines a collection of identical audio clips, so they can easily be 
 * played in rapid sequence, with overlapping. */
function AudioPool(audio, count)
{
    if (audio == undefined) throw "audio is undefined";

    this.audioObjs = [];
    this.next = 0;

    if (!count) count = 5;

    for (var n = 0; n < count; n++) {
	this.audioObjs.push(audio.cloneNode());
    }

    /* Plays the next audio clip in the managed pool */
    this.play = function()
    {
	this.audioObjs[this.next].play();
	this.next = (this.next + 1) % this.audioObjs.length;
    };

    this.set_volume = function(vol) {
	for (var n = 0; n < this.audioObjs.length; n++) {
	    this.audioObjs[n].volume = vol;
	}
    }
}
