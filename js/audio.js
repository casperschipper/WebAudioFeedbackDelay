var context; // webAudioContext

var mute = false; //unused

var gui; // the dat.gui from google.

var SineWave; // the main synth patch

$(document).ready(function() {
	window.addEventListener('load', init, false); 

	function init() {
	  try {
	    // Fix up for prefixing
	    context = new webkitAudioContext(); // trying to get context
	  }
	  catch(e) {
	    alert('Web Audio API is not supported in this browser');
	  }

	  console.log(context);

	  // ok let's create the osc

	 gui = new dat.GUI(); // create the gui.

	 SineWave = new playSineWave(); // create the synth.
	 log("sinewave " + SineWave);

	 gui.add(SineWave, 'frequency',0,128).onChange( function (x) {
	 	SineWave.patch.SinOsc.frequency.setValueAtTime(CS.mtof(x),context.currentTime);
	 }); // create a fader for frequency in the gui.

	 gui.add(SineWave, 'gain',0,1).onChange( function(x) {
	 	SineWave.patch.Gain.gain.setValueAtTime(x,context.currentTime);
	 }); // create a fader for frequency in the gui.
	
	 var canvas = document.getElementById('delayPosition');
	console.log(canvas);
	
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
			x : (position / 5.0) * 800.0,
			y : 0,
			width : 10, 
			height : 10,
			borderWidth : 1
		};
        drawRectangle(myRectangle, graphContext);
        
        position = 0//SineWave.patch.Delay2.delayTime.value;

        myRectangle.x = (position / 5.0) * 800.0;
        myRectangle.y += 20;
        myRectangle.width = 10;

        drawRectangle(myRectangle, graphContext);





	}

	(function animloop(){
	  window.webkitRequestAnimationFrame(animloop);
	  render();
	})();


	}
});

var DynamicFeedbackDelay = function() {
	this.input = context.createGainNode();
	var output = context.createGainNode(),
		delay = context.createDelayNode(5),
		fbgain = context.createGainNode();

	delay.delayTime.value = 0.5;
	fbgain.gain.value = -0.75;

	this.input.connect(delay); //
	
	delay.connect(fbgain); // feedback loop
	fbgain.connect(delay); 
	delay.connect(output); 

	this.connect = function(target) { // instance function to connect output to something
		console.log(typeof(target)+"this is the typeof target !");
		console.log("target = "+ target);
		output.connect(target);
	}

	this.delayTime = function() {
		return delay.delayTime.value;
	}

	function scheduler(delay) { // this is a scheduler fu
		var target = CS.choose([0,1.,2.]); // target is the position in the delayline;
		var duration = CS.choose([0,1000,2000]); // duration is ramp length in time;

		$("#delayLength").text(prettyFloat(duration)/1000.0);
		$("#duration").text(prettyFloat(target));
		nextRamp(delay,target,duration,scheduler);
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

var Panner = function() {
	this.input = context.createGainNode();
	var panNode = context.createPanner();
	panNode.setPosition(CS.rv(-10,10),3,-0.5);
	panNode.connect(context.destination);
}

var playSineWave = function () {
	this.patch = {
		SinOsc : context.createOscillator(),
		Gain : context.createGainNode(),
		DynDelay1 : new DynamicFeedbackDelay(),
		DynDelay2 : new DynamicFeedbackDelay(),
		DynDelay3 : new DynamicFeedbackDelay(),
		DynDelay4 : new DynamicFeedbackDelay(),
		DynDelay5 : new DynamicFeedbackDelay(),
		Pan1 : new Panner(),
		Pan2 : new Panner(),
		Pan3 : new Panner(),
		Pan4 : new Panner(),
		Pan5 : new Panner()
	};

	this.frequency = 60; // setting defaults
	this.gain = 0.1;

	this.patch.Gain.gain.value = this.gain;
	this.patch.SinOsc.frequency.value = CS.mtof(this.frequency);
	this.patch.SinOsc.connect(this.patch.Gain);
	this.patch.SinOsc.noteOn(0);

	this.patch.Gain.connect(context.destination);

	this.patch.SinOsc.connect(this.patch.DynDelay1.input);
	this.patch.DynDelay1.connect(this.patch.Pan1.input);
	this.patch.DynDelay1.connect(this.patch.DynDelay2.input);
	this.patch.DynDelay2.connect(this.patch.Gain);
	this.patch.DynDelay2.connect(this.patch.DynDelay3.input);
	this.patch.DynDelay3.connect(this.patch.Gain);
	this.patch.DynDelay3.connect(this.patch.DynDelay4.input);
	this.patch.DynDelay4.connect(this.patch.Gain);
	this.patch.DynDelay4.connect(this.patch.DynDelay5.input);
	this.patch.DynDelay5.connect(this.patch.Gain);
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