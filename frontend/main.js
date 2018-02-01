jGame = $("#game");
gvar = {
	choosetarget : false,
	playerName: "Sir Purry McPurr Van Purrsalot"
}

window.onload = function() {
	uidata.init();
	ui.loadui(uidata.startScreen);
	window.setInterval(gameUpdate, 33);
}

function gameUpdate() {
	if (uidata.loadComplete && ui.screenReady){
		if (ui.nextScreen) ui.nextScreen.drawSelf();
	}
}
