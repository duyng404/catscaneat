// handles the drawing and clearing of UIs
var ui = {
	screenReady: true,
	nextScreen: undefined,

	loadui:function (theui){
		ui.nextScreen = theui;
		$("#game").children().fadeOut(400, ui.cleanup);
	},

	cleanup: function() {
		jGame.empty();
		ui.screenReady = true;
	}
}

// stores all the screens and all its info
// also handles the creation of all the screens
var uidata = {
	init:function(){
		// welcome screen
		uidata.startScreen = new Screen(
			// name
			"start screen",
			// add ele's
			function() {
				$("#game").append('<h1>Welcome to the Game</h1>');
				$("#game").append('<p>'+this.name+'</p>');
				$("#game").append('<button id="startgame">Start Game</button>');
			},
			// attach events
			function() {
				$("#startgame").mousedown(function(){
					ui.loadui(uidata.nameInput);
				});
			}
		);

		// input cat's name
		uidata.nameInput = new Screen(
			// name
			"name input",
			// drawElements
			function() {
				$("#game").append('<h1>What is your cat\'s name?</h1>');
				$("#game").append('<input id="catname" type="text" placeholder="Enter name here" />');
				$("#game").append('<button id="accept">Accept</button>');
				$("#catname").val(gvar.playerName);
			},
			// attachEvents
			function() {
				$("#accept").mousedown(function(){
					gvar.playerName = $("#catname").val();
					ui.loadui(uidata.confirmName);
				});
			}
		);

		// display the previously entered cat's name
		uidata.confirmName = new Screen(
			//name
			"confirm name",
			// drawElements
			function() {
				$("#game").append('<h1>Your cat\'s name is '+gvar.playerName);
				$("#game").append('<button id="accept">Yes</button>');
			},
			// attachEvents
			function() {
				$("#accept").mousedown(function(){
					ui.loadui(uidata.startScreen);
				});
			}
		);
	}
};

// this model is used to build new screens
function Screen(name="hello world",addElements=[],attachEvents=function(){}){
	this.name = name;
	this.addElements = addElements;
	this.attachEvents = attachEvents;
};

Screen.prototype = {
	constructor: Screen,
	preDraw: function(){
		ui.screenReady = false;
	},
	animateIn: function(){
		$("#game").children().hide();
		$("#game").children().fadeIn();
	},
	drawSelf: function(){
		this.preDraw();
		this.addElements();
		this.attachEvents();
		this.animateIn();
	}
};
