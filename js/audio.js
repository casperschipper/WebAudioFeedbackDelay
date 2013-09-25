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

	  log(context);

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
	log(canvas);
	
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

		
		var position = SineWave.patch.Delay.delayTime.value;
		var myRectangle = {
			x : (position / 5.0) * 800.0,
			y : 0,
			width : 10, 
			height : 10,
			borderWidth : 1
		};
        drawRectangle(myRectangle, graphContext);
        
        position = SineWave.patch.Delay2.delayTime.value;

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

var playSineWave = function () {
	this.patch = {
		SinOsc : context.createOscillator(),
		Delay : context.createDelayNode(10),
		Delay2 : context.createDelayNode(10),
		Gain : context.createGainNode(),
		FBGain : context.createGainNode(),
		FBGain2 : context.createGainNode()
	};

	this.frequency = 35; // setting defaults
	this.gain = 0.1;

	this.patch.FBGain.gain.value = -0.89; // feedback gain.
	this.patch.FBGain2.gain.value = -0.89;

	this.patch.Gain.gain.value = this.gain;
	this.patch.SinOsc.frequency.value = CS.mtof(35);
	this.patch.SinOsc.connect(this.patch.Gain);
	
	this.patch.Gain.connect(this.patch.Delay);
	this.patch.Delay.connect(this.patch.FBGain);
	this.patch.FBGain.connect(this.patch.Delay);
	this.patch.FBGain.connect(context.destination);

	this.patch.FBGain.connect(this.patch.Delay2);
	this.patch.Delay2.connect(this.patch.FBGain2);
	this.patch.FBGain2.connect(this.patch.Delay2);
	this.patch.FBGain2.connect(context.destination);
	this.patch.SinOsc.noteOn(0);

	function schedular(delay) {
		var target = CS.choose([0,0.1,0.2,1.0,CS.rv(0,1)]); // target is the position in the delayline;
		var duration = CS.choose([0,100,200,1000,3000]); // duration is ramp length in time;

		$("#delayLength").text(prettyFloat(duration)/1000.0);
		$("#duration").text(prettyFloat(target));
		nextRamp(delay,target,duration,schedular);
	}

	function nextRamp(delay,target,duration,callback) {
		delay.delayTime.linearRampToValueAtTime(target, context.currentTime + (duration/1000.0));
		setTimeout(function() {
			callback(delay);
		}
		,duration);
	}

	schedular(this.patch.Delay);
	schedular(this.patch.Delay2);
}

var dynamicFeedbackDelay = function() {
	this.input = context.createGainNode();
	var output = context.createGainNode(),
		delay = context.createDelayNode(5),
		fbgain = context.createGainNode();

	delay.delayTime.value = 0.5;
	fbgain.gain.value = 0.89;

	this.input.connect(delay); //
	
	delay.connect(fbgain); // feedback loop
	fbgain.connect(delay); 

	delay.connect(output); // connect the delay to the output

	this.connect = function(target) { // instance function to connect output to something
		output.connect(target);
	}

	function scheduler(delay) { // this is a scheduler fu
		var target = CS.choose([0,0.1,0.2,1.0,CS.rv(0,1)]); // target is the position in the delayline;
		var duration = CS.choose([0,100,200,1000,3000]); // duration is ramp length in time;

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

	schedular(delay);
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