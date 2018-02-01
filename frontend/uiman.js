// handles the drawing and clearing of UIs
var ui = {
	screenReady: true,
	nextScreen: undefined,

	loadui:function (theui){
		ui.nextScreen = theui;
		$("#game").children().not(".ignoreanim").fadeOut(400, ui.cleanup);
	},

	cleanup: function() {
		jGame.empty();
		ui.screenReady = true;
	}
}

// stores all the screens and all its info
// also handles the creation of all the screens
var uidata = {
	screenDir: '/screens/',
	loadComplete: false,
	loadedhtml: 0,
	htmlLoadFinish: function(){
		uidata.loadedhtml++;
		if (uidata.loadedhtml==1){uidata.loadComplete = true;}
	},
	screenList: [
		'startScreen',
		'nameInput',
		'confirmName',
		'combat'
	],
	init: function(){
		for (let i of this.screenList){
			this[i] = new Screen(i);
		};
	}
};

// this model is used to build new screens
function Screen(name){
	this.name = name;
	this.htmlname = uidata.screenDir+this.name+'.html';
	this.jsname = uidata.screenDir+this.name+'.js';
	this.data = {};
	this.loadHtml(this.data);
	//this.loadJs(this.data);
};

Screen.prototype = {
	constructor: Screen,
	loadHtml: function(storage) {
		$.get(this.htmlname, function(data){
			storage.html = data;
			uidata.htmlLoadFinish();
		});
	},
	loadJs: function(storage) {
		$.getScript(this.jsname, function(data){
			eval("storage.js = " + tmp.toString());
			uidata.jsLoadFinish();
		});
	},
	preDraw: function(){
		ui.screenReady = false;
	},
	addElements: function(){
		$("#game").append($.parseHTML(this.data.html,keepScripts=true));
	},
	runScript: function(){
		this.data.js();
	},
	animateIn: function(){
		$("#game").children().not(".ignoreanim").hide();
		$("#game").children().not(".ignoreanim").fadeIn();
	},
	drawSelf: function(){
		this.preDraw();
		this.addElements();
		//this.runScript();
		this.animateIn();
	}
};
