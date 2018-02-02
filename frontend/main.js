jGame = $("#game");
gvar = {
	targetingMode : false,
	playerName: "Sir Purry McPurr Van Purrsalot",
	atkSource: undefined,
	atkDest: undefined,
	atkSkill: undefined,
	atkQueue: [],
	cdQueue: [],
	tickInProcess: false
}

window.onload = function() {
	uidata.init();
	chardata.init();
	ui.loadui(uidata.combat);
	window.setInterval(gameUpdate, 33);
}

function gameUpdate() {
	if (uidata.loadComplete && ui.screenReady){
		if (ui.nextScreen) ui.nextScreen.drawSelf();
	}
	if (!gvar.tickInProcess && (!gvar.lastTick || $.now()-gvar.lastTick >= 2000)){
		gvar.tickInProcess = true;
		tick();
	}
	for (let i of gvar.cdQueue){
		var totalTime = i.cooldown * 2000;
		var timeLeft = i.cdLeft * 2000 - ($.now()-gvar.lastTick);
		var percent = timeLeft/totalTime*100;
		if (Math.floor(percent)==0) percent = 0;
		$(i.source.uipos+" .pic .bar").css('width',percent+'%');
	}
}

function tick(){
	gvar.tickInProcess = true;
	var newQueue = [];
	for (let i of gvar.cdQueue){
		i.cdLeft -=1;
		if (i.cdLeft > 0) newQueue.push(i);
	}
	gvar.cdQueue = newQueue;
	var newQueue = [];
	for (let i of gvar.atkQueue){
		src = i.atkSource;
		skill = i.atkSkill;
		dest = i.atkDest;
		if (skill.cdLeft <= 0){
			skill.effect();
			skill.cdLeft = skill.cooldown;
			gvar.cdQueue.push(skill);
			src.cancelCombat(i);
			dest.cancelCombat(i);
			updateAllyBorder(src);
			updateEnemyBorder(dest);
			updateHP(dest);
		} else {
			newQueue.push(i);
		}
	}
	gvar.atkQueue=newQueue;
	gvar.lastTick=$.now();
	gvar.tickInProcess = false;
}

function setupBoard() {
	// hide tooltips
	$("#allytooltip").addClass("hidden");
	$("#enemytooltip").addClass("hidden");

	// fill in the party
	var number = 1;
	for (let i of chardata.party){
		i.uipos = "#cat"+number;
		// save the index of this character
		$(i.uipos).data("index",$.inArray(i,chardata.party));
		// pic
		$(i.uipos+" .pic").css("background-image","url(\""+i.pic+"\")");
		// healthbar
		$(i.uipos+" .healthbar .bar").css("width",(i.hp/i.maxhp*100)+"%");
		$(i.uipos+" .healthbar").append("<span>"+i.hp+'/'+i.maxhp+"</span>");
		number++;
	}
	// remove spare ui elet
	for (; number<=5; number++){ $("#cat"+number).remove(); }

	// fill in the enemies
	var number = 1;
	for (let i of chardata.enemies){
		i.uipos = "#enemy"+number;
		// save the index of this character
		$(i.uipos).data("index",$.inArray(i,chardata.enemies));
		// pic
		$(i.uipos+" .pic").css("background-image","url(\""+i.pic+"\")");
		// healthbar
		$(i.uipos+" .healthbar .bar").css("width",(i.hp/i.maxhp*100)+"%");
		$(i.uipos+" .healthbar").append("<span>"+i.hp+'/'+i.maxhp+"</span>");
		number++;
	}
	// remove spare ui elet
	for (; number<=5; number++){ $("#enemy"+number).remove(); }

	attachHoverEvents();
}

function attachHoverEvents(){
	// allies
	for (let i of chardata.party){
		$(i.uipos+" .pic").off().on({
			// mouseover/out
			'mouseover':function(){
				if (!gvar.targetingMode){
					// retrieve index and info
					var index = $(this).parent().data("index");
					var i = chardata.party[index];
					// border
					updateAllyBorder(i);
					// update tooltip
					updateAllyTooltip(i);
				}
			},
			'mouseout':function(){
				// retrieve index and info
				var index = $(this).parent().data("index");
				var i = chardata.party[index];
				updateAllyBorder(i);
				if (!gvar.targetingMode){
					updateAllyTooltip();
				}
			},
		});
		$(i.uipos+" .pic").off('mousedown').on('mousedown',function(){
			// retrieve index and info
			var index = $(this).parent().data("index");
			var i = chardata.party[index];
			if (!(i.inCombat() && gvar.tickInProcess)){
				// targeting mode
				gvar.atkSkill = i.basicAtk;
				gvar.atkSource = i.basicAtk.source;
				console.log(gvar.atkSource);
				gvar.targetingMode = true;
				updateAllyBorder(i);
				if (i.inCombat()){
					gvar.atkQueue.splice(gvar.atkQueue.indexOf(i.outgoingCombat),1);
					var dest = i.outgoingCombat.atkDest;
					dest.cancelCombat(i.outgoingCombat);
					i.cancelCombat(i.outgoingCombat);
					updateEnemyBorder(dest);
				}
			}
		});
	}

	// enemies
	for (let i of chardata.enemies){
		$(i.uipos).off().on({
			'mouseover':function(){
				// retrieve index and info
				var index = $(this).data("index");
				var i = chardata.enemies[index];
				// update tooltip
				updateEnemyTooltip(i);
				if (gvar.targetingMode)
					$(this).css("border","4px solid red");
			},
			'mouseout':function(){
				// retrieve index and info
				var index = $(this).data("index");
				var i = chardata.enemies[index];
				updateEnemyTooltip();
				updateEnemyBorder(i);
			},
		});
		$(i.uipos).off('mousedown').on('mousedown',function(){
			if (gvar.targetingMode){
				// retrieve index and info
				var index = $(this).data("index");
				var i = chardata.enemies[index];
				gvar.atkDest = i;
				gvar.atkSkill.dest = i;
				gvar.atkSource.startCombat({
					atkSource: gvar.atkSource,
					atkSkill: gvar.atkSkill,
					atkDest: gvar.atkDest
				});
				gvar.atkQueue.push(gvar.atkSource.outgoingCombat);
				console.log(gvar.atkSource.name,"used",gvar.atkSkill.name,"on",gvar.atkDest.name);
				//$("#allies").find(".cat").css("border","4px solid white");
				//$(this).css("border","4px solid white");
				updateAllyTooltip();
				updateAllyBorder(gvar.atkSource);
				updateEnemyBorder(gvar.atkDest);
				//$("#enemies").find("*").off();
				gvar.targetingMode = false;
			}

		});
	}
}

function updateAllyBorder(i){
	if ($(i.uipos+" .pic").is(":hover") || i.inCombat() || (gvar.targetingMode && gvar.atkSource == i)){
		$(i.uipos).css("border","4px solid yellow");
	} else {
		$(i.uipos).css("border","4px solid white");
	}
}

function updateEnemyBorder(i){
	if (i.inCombat() || $(i.uipos).is(":hover")){
		$(i.uipos).css("border","4px solid red");
	} else {
		$(i.uipos).css("border","4px solid white");
	}
}

function updateAllyTooltip(i){
	if (i){
		$("#allytooltip").append("<p>"+i.name+"<br />"+i.desc+"<br />HP:"+i.hp+"/"+i.maxhp+"<br />");
		$("#allytooltip").append("<p>"+i.basicAtk.name+"<br />"+i.basicAtk.desc+"</p>");
		$("#allytooltip").removeClass("hidden");
	} else {
		$("#allytooltip").empty();
		$("#allytooltip").addClass("hidden");
	}
}

function updateEnemyTooltip(i){
	if (i){
		$("#enemytooltip").append("<p>"+i.name+"<br />"+i.desc+"<br />HP:"+i.hp+"/"+i.maxhp+"</p>");
		$("#enemytooltip").removeClass("hidden");
	} else {
		$("#enemytooltip").empty();
		$("#enemytooltip").addClass("hidden");
	}
}

function updateHP(i){
	$(i.uipos+" .healthbar .bar").css("width",(i.hp/i.maxhp*100)+"%");
	$(i.uipos+" .healthbar span").remove();
	$(i.uipos+" .healthbar").append("<span>"+i.hp+'/'+i.maxhp+"</span>");
}

function enableTargetingMode(s,n){
	if (s=='enemy'){
		gvar.targetingMode = true;
	}
}
