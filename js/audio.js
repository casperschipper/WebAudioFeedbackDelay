

$(document).ready(function() {
	var context; // webAudioContext

	var mute = false; //unused

	var gui; // the dat.gui from google.

	var SineWave; // the main synth patch

	var readPoint1 = 0.0;
	var readPoint2 = 1.0; // global values
	var readPoint3 = 2.0; // global value
	var duration1 = 0.0;
	var duration2 = 1.0;
	var duration3 = 2.0;

	window.addEventListener('load', init, false); 

	console.log("test");

	function init() {
	  try {
	    // Fix up for prefixing
	    context = new webkitAudioContext() || new AudioContext(); // trying to get context
	  	
	  }
	  catch(e) {
	    alert('Web Audio API is not supported in this browser');
	  }

	  //console.log(context);
	  //context.listener.setPosition(0,0,0);
	  //context.destination.channelCount = 2;

	  // ok let's create the osc

	 gui = new dat.GUI(); // create the google gui.

	 SineWave = new playSineWave(); // create the synth.
	 //log("sinewave " + SineWave);

	 gui.add(SineWave, 'frequency',0,128).onChange( function (x) {
	 	SineWave.patch.SinOsc.frequency.setValueAtTime(cs.mtof(x),context.currentTime);
	 }); // create a fader for frequency in the gui.

	 gui.add(SineWave, 'gain',0,1.0).onChange( function(x) {
	 	SineWave.patch.Gain.gain.setValueAtTime(x*0.1,context.currentTime);
	 }); // create a fader for frequency in the gui.

	 gui.add(SineWave, 'readPoint1',0.0,10.).onChange( function(x) {
	 	readPoint1 = x;
	 });

	 gui.add(SineWave, 'readPoint2',0.0,10.).onChange( function(x) {
	 	readPoint2 = x;
	 }); 

	 gui.add(SineWave, 'readPoint3',0.0,10.).onChange( function(x) {
	 	readPoint3 = x;
	 }); 

	 gui.add(SineWave, 'duration1',0,10.0).onChange( function(x) {
	 	duration1 = x;
	 }); //

	 gui.add(SineWave, 'duration2',0,10.0).onChange( function(x) {
	 	duration2 = x;
	 }); //

	 gui.add(SineWave, 'duration3',0.,10.0).onChange( function(x) {
	 	duration3 = x;
	 }); //

	 gui.add(SineWave, 'randomize');
	
	 var canvas = document.getElementById('delayPosition');
	
	var graphContext = canvas.getContext('2d');

	function drawRectangle(myRectangle, gcontext) {
		gcontext.beginPath();
		gcontext.rect(myRectangle.x, myRectangle.y, myRectangle.width, myRectangle.height);
		gcontext.fillStyle = '#00000';
		gcontext.fill();
		gcontext.lineWidth = myRectangle.borderWidth;
		// gcontext.strokeStyle = 'red';
		// gcontext.stroke();
	}

	function render() {
		graphContext.clearRect(0, 0, canvas.width, canvas.height);
	
		var position = 0//SineWave.patch.Delay.delayTime.value;
		var myRectangle = {
			x : 0,
			y : 0,
			width : 10, 
			height : 10,
			borderWidth : 1
		};
                
        var positions = [
        	SineWave.patch.DynDelay1.delayTime(),
        	SineWave.patch.DynDelay2.delayTime(),
        	SineWave.patch.DynDelay3.delayTime(),
        	SineWave.patch.DynDelay4.delayTime(),
        	SineWave.patch.DynDelay5.delayTime(),
        	SineWave.patch.DynDelay6.delayTime(),
        	SineWave.patch.DynDelay7.delayTime(),
        	SineWave.patch.DynDelay8.delayTime(),
        	SineWave.patch.DynDelay9.delayTime(),
        	SineWave.patch.DynDelay10.delayTime(),
        ];

        for (var i = 0;i<positions.length+1;i++) {
        	myRectangle.x = (positions[i] / 3.0) * 300.0;
       		
        	drawRectangle(myRectangle, graphContext);

       		myRectangle.y += 12;


        }

        




	}

	(function animloop(){
	  window.requestAnimFrame(animloop);
	  render();
	})();


	}


	var DynamicFeedbackDelay = function(position) {
	this.input = context.createGainNode();
	
	var output = context.createGainNode(),
		delay = context.createDelayNode(10),
		fbgain = context.createGainNode(),
		softer = context.createGainNode();

	// input -> delay -> fbgain -> delay
	// fbgain -> output;

	delay.delayTime.value = 0.5;
	fbgain.gain.value = -0.76;
	softer.gain.value = 0.5;

	this.input.connect(delay); 	
	delay.connect(fbgain); 
	fbgain.connect(delay); 

	fbgain.connect(softer);
	softer.connect(output);
	
	// hack for panning:
	var merger = context.createChannelMerger(2);
	var gainL = context.createGainNode();
	var gainR = context.createGainNode();

	softer.connect(gainL);
	softer.connect(gainR);
	
	gainL.connect(merger,0,0);
	gainR.connect(merger,0,1);

	var pan = position;

	gainL.gain.value = Math.sqrt(pan);
	gainR.gain.value = Math.sqrt(1.0-pan);

	merger.connect(context.destination);

	this.connect = function(target) { // instance function to connect output to something
		output.connect(target);
	}

	this.delayTime = function() {
		return delay.delayTime.value;
	}

	function scheduler(delay) { // this is a scheduler fu
		var target = cs.choose([readPoint1,readPoint2,readPoint3]); // target is the position in the delayline;
		var duration = cs.choose([duration1,duration2,duration3]); // duration is ramp length in time;

		nextRamp(delay,target,duration*1000,scheduler);
	}

	function nextRamp(delay,target,duration,callback) {
		delay.delayTime.linearRampToValueAtTime(target, context.currentTime + (duration/1000.0));
		setTimeout(function() {
			callback(delay);
		}
		,duration);
	}

	scheduler(delay);
}

	// var Panner = function(position) {
	// 	this.input = context.createPanner();
	// 	this.input.setPosition(position,0.1,0.1);
	// 	this.input.connect(context.destination);
	// }

	var playSineWave = function () {
		this.patch = {
			SinOsc : context.createOscillator(),
			Gain : context.createGainNode(),
			DynDelay1 : new DynamicFeedbackDelay(0),
			DynDelay2 : new DynamicFeedbackDelay(0.1),
			DynDelay3 : new DynamicFeedbackDelay(0.2),
			DynDelay4 : new DynamicFeedbackDelay(0.3),
			DynDelay5 : new DynamicFeedbackDelay(0.4),
			DynDelay6 : new DynamicFeedbackDelay(0.5),
			DynDelay7 : new DynamicFeedbackDelay(0.6),
			DynDelay8 : new DynamicFeedbackDelay(0.7),
			DynDelay9 : new DynamicFeedbackDelay(0.9),
			DynDelay10 : new DynamicFeedbackDelay(1)
		};

		this.frequency = 60; // setting defaults
		this.gain = 0.05;

		this.readPoint1 = 0.001;
		this.readPoint2 = 1.001;
		this.readPoint3 = 2.001;

		this.duration1 = 0.001;
		this.duration2 = 1.0;
		this.duration3 = 2.0;

		this.patch.Gain.gain.value = this.gain;
		this.patch.SinOsc.frequency.value = cs.mtof(this.frequency);
		this.patch.SinOsc.connect(this.patch.Gain);
		this.patch.SinOsc.noteOn(0);

		this.patch.Gain.connect(this.patch.DynDelay1.input);
		this.patch.DynDelay1.connect(this.patch.DynDelay2.input);
		this.patch.DynDelay2.connect(this.patch.DynDelay3.input);
		this.patch.DynDelay3.connect(this.patch.DynDelay4.input);
		this.patch.DynDelay4.connect(this.patch.DynDelay5.input);
		this.patch.DynDelay5.connect(this.patch.DynDelay6.input);
		this.patch.DynDelay6.connect(this.patch.DynDelay7.input);
		this.patch.DynDelay7.connect(this.patch.DynDelay8.input);
		this.patch.DynDelay9.connect(this.patch.DynDelay10.input);

		this.lastSalted = [1];
		this.saltedRandom = function(a,b) {
			var choice = cs.wchoice([["small",2],["normal",0],["history",3],["standards",0],["micro",0],["variation",4]]);
			var result = 0;
			switch(choice) {
				case "small": {
					result = cs.rv(a,b) * cs.wchoice([[0.001,1],[1,4]]); //quantized
					break;
				} 
				case "normal": {
					result = cs.rv(a,b); // normal
					break;
				}
				case "history": {
					result = cs.choose(this.lastSalted);
					break;
				}
				case "variation": {
					result = cs.choose(this.lastSalted) * cs.choose([0.5,2,0.75,1.0,1.25]);
					break;
				}
				case "standards": {
					result = cs.rv(0,10) * cs.choose([0.01,0.1,0.5]);
					break;
				}
				case "micro": {
					result = cs.rv(0,0.05);
					break;
				}
			}

			this.lastSalted.push(result);
			console.log(this.lastSalted);
			if (this.lastSalted.length > 40) {
				this.lastSalted = [1];
			}

			return result % b;
		}

		this.randomize = function() {
			this.readPoint1 = readPoint1 = this.saltedRandom(0,10);
			this.readPoint2 = readPoint2 = this.saltedRandom(0,10);
			this.readPoint3 = readPoint3 = this.saltedRandom(0,10);

			this.duration1 = duration1 = this.saltedRandom(0,10);
			this.duration2 = duration2 = this.saltedRandom(0,10);
			this.duration3 = duration3 = this.saltedRandom(0,10);

			this.frequency = cs.rv(20,127);

			this.patch.SinOsc.frequency.value = cs.mtof(this.frequency);

			 for (var i in gui.__controllers) {
	    		gui.__controllers[i].updateDisplay();
	  		}
		}

	}

	function log(value) {
		console.log(value);
	}

	function prettyFloat(value) {
		return String(value).substr(0,6);
	}

	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();
});





// var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
 
// window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
//   var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
//   return __nativeST__(vCallback instanceof Function ? function () {
//     vCallback.apply(oThis, aArgs);
//   } : vCallback, nDelay);
// };
 
// window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
//   var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
//   return __nativeSI__(vCallback instanceof Function ? function () {
//     vCallback.apply(oThis, aArgs);
//   } : vCallback, nDelay);
// };