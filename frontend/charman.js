var chardata = {
	cats: [],
	enemies: [],
	party: [],
	init: function(){
		this.cat1 = new Character("GrumpyCat","Always being annoyed by something",50,5,2,"https://pbs.twimg.com/profile_images/948294484596375552/RyGNqDEM_400x400.jpg");
		this.cat2 = new Character("DVA","Playing to win",50,5,2,"https://78.media.tumblr.com/9c83126fe9af3f0624e1cc73213eab60/tumblr_p2zv560SgU1qjpgiao1_500.jpg");
		this.cat3 = new Character("Catman","He is the night",50,10,2,"http://images5.fanpop.com/image/photos/29000000/Funny-Cats-cats-29074471-500-378.jpg");
		this.enemy1 = new Character("Sentient Yarnball","Tempting.",30,7,2,"http://payload155.cargocollective.com/1/2/72802/5408141/GreenBallofYarnFull_700.jpg")
		this.enemy2 = new Character("Advanced Yarnball","Even More Tempting.",30,7,2,"http://payload155.cargocollective.com/1/2/72802/5408141/GreenBallofYarnFull_700.jpg")

		this.cat1atk1 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat1,3,function(){
			this.dest.hp -= this.source.dmg;
		},undefined,1000);
		this.cat2atk1 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat2,3,function(){
			this.dest.hp -= this.source.dmg;
		},undefined,1000);
		this.cat3atk1 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat3,3,function(){
			this.dest.hp -= this.source.dmg;
		},undefined,1000);
		this.cat1atk2 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat1,3,function(){
			this.dest.hp -= this.source.dmg*2;
		},undefined,1000);
		this.cat2atk2 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat2,3,function(){
			this.dest.hp -= this.source.dmg*2;
		},undefined,1000);
		this.cat3atk2 = new Skill("OnePunch","onepunchhhh","enemy",4,this.cat3,3,function(){
			this.dest.hp -= this.source.dmg*2;
		},undefined,1000);

		this.cat1.addBasicAtk(this.cat1atk1);
		this.cat1.addSpecialAtk(this.cat1atk2);
		this.cat2.addBasicAtk(this.cat2atk1);
		this.cat2.addSpecialAtk(this.cat2atk2);
		this.cat3.addBasicAtk(this.cat3atk1);
		this.cat3.addSpecialAtk(this.cat3atk2);

		this.cats.push(this.cat1);
		this.cats.push(this.cat2);
		this.cats.push(this.cat3);
		this.party = this.cats;
		this.enemies.push(this.enemy1);
		this.enemies.push(this.enemy2);
	}
}

function Character(name,desc,maxhp,dmg,armor,pic){
	this.name = name;
	this.desc = desc;
	this.maxhp = maxhp;
	this.hp = maxhp;
	this.dmg = dmg;
	this.armor = armor;
	this.basicAtk = undefined;
	this.specialAtk = undefined;
	this.pic = pic;
	this.uipos = "";
	this.outgoingCombat = undefined;
	this.incomingCombat = [];
}

Character.prototype = {
	constructor: Character,
	addBasicAtk:function(basicAtk){
		this.basicAtk = basicAtk;
	},
	addSpecialAtk:function(specialAtk){
		this.specialAtk = specialAtk;
	},
	inCombat:function(){
		if (this.outgoingCombat) return true;
		if (this.incomingCombat.length > 0) return true;
	},
	cancelCombat:function(combat){
		var index = this.incomingCombat.indexOf(combat);
		if (combat == this.outgoingCombat){
			this.outgoingCombat = undefined;
		} else if (index != 1){
			this.incomingCombat.splice(index,1);
		}
	},
	startCombat:function(combat){
		this.outgoingCombat = combat;
		combat.atkDest.incomingCombat.push(combat);
	}
}

function Skill(name,desc,targetType,range,source,cooldown,effect,animation,animDelay){
	this.name = name;
	this.desc = desc;
	this.targetType = targetType;
	this.range = range;
	this.source = source;
	this.dest = undefined;
	this.cooldown = cooldown;
	this.cdLeft = 0;
	this.effect = effect;
	this.animation = animation;
	this.animDelay = animDelay;
}

Skill.prototype = {
	constructor: Skill
}
