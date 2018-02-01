var TheGame = function(){
	// connection to server
	var peer;

	// put all the global variables in gvar
	var gvar = {};
	var hud = {};

	this.preload = function(){
		peer = new Peer({host: window.location.hostname, port: 8080, path: '/peerjs'/*,debug: 3*/});
		peer.on('open',function(id){
			gvar.id = id;
			console.log('Our id is: ' + id);
		});
		peer.on('connection',connectSuccess);
		peer.on('error',function(err){ alert(err); });
	};

	this.create = function(){
		gvar.style = { font: "20px Arial", fill: "#ffffff", align: "center" };
		peer.listAllPeers(updateRooms);
		hud.refreshtext = game.add.text(20,20,"Refresh Peer List", gvar.style);
		hud.refreshtext.inputEnabled = true;
		hud.refreshtext.events.onInputUp.add(function(){
			peer.listAllPeers(updateRooms);
		});
	};

	function updateRooms(idList){
		if (hud.roomList) for (let i of hud.roomList){i.destroy()};
		hud.roomList = [];
		count = 0;
		for (let id of idList){
			if (id != gvar.id){
				hud.roomList.push(game.add.text(40, 50+25*count, id, gvar.style))
				hud.roomList[count].inputEnabled = true;
				hud.roomList[count].events.onInputUp.add(function(){
					connectClient(id);
				});
				count++;
			}
		}
	};

	function connectClient(id){
		gvar.conn = peer.connect(id);
		gvar.conn.on('open',function(){
			connectSuccess(gvar.conn);
		});
		gvar.conn.on('error', function(err){ alert(err); });
	};

	function connectSuccess(c){
		// save the connection
		gvar.conn = c;

		// disconect from main server
		//peer.disconnect();
		console.log('hello?');

		// clear old hud
		for (let i of hud.roomList){ i.destroy(); }
		hud.roomList=[];
		hud.refreshtext.destroy();
		if (hud.sendData) hud.sendData.destroy();
		if (hud.dropConn) hud.dropConn.destroy();
		if (hud.reconn) hud.reconn.destroy();
		newMsg('connection establised');

		// new hud
		hud.sendData = game.add.text(20,570,"Send#",gvar.style);
		hud.sendData.inputEnabled = true;
		hud.sendData.events.onInputUp.add(function(){
			// send a random number to the other
			var a = Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
			a = { time:Date.now(), payload:a };
			if (gvar.conn.open) {
				gvar.conn.send(a);
				newMsg(a,'outbound');
			}
			else newMsg('connection not active');
		});

		hud.dropConn = game.add.text(100,570,"Drop",gvar.style);
		hud.dropConn.inputEnabled = true;
		hud.dropConn.events.onInputUp.add(function(){
			gvar.conn.close();
			ConnectionClosed();
		});

		hud.reconn = game.add.text(100,570,"Reconnect",gvar.style);
		hud.reconn.inputEnabled = true;
		hud.reconn.events.onInputUp.add(function(){
			connectClient(gvar.conn.peer);
		});
		hud.reconn.kill();

		// on receive data
		c.on('data', function(data){
			newMsg(data,'inbound');
		});

		// on connection closed
		c.on('close',function(){
			ConnectionClosed();
			newMsg('partner disconnected');
			console.log(gvar.conn.open);
		});
	};

	function newMsg(a,s){
		// init
		var qmax = 20;
		if (!gvar.msgq) gvar.msgq=[];
		if (!hud.msgq) hud.msgq=[];
		// add msg to queue
		a.time=new Date(a.time);
		if (s=='inbound') a = a.time.getHours()+':'+a.time.getMinutes()+':'+a.time.getSeconds() + ' received: ' + a.payload;
		else if (s=='outbound') a = a.time.getHours()+':'+a.time.getMinutes()+':'+a.time.getSeconds() + ' sent: ' + a.payload;
		console.log(a);
		gvar.msgq.unshift(a);
		gvar.msgq.slice(0,qmax);

		// update hud
		for (var i=0; i<qmax; i++){
			if (gvar.msgq[i]){
				var newText = gvar.msgq[i];
				if (!hud.msgq[i]) { hud.msgq[i] = game.add.text(20,20+25*i,newText,gvar.style); }
				else { hud.msgq[i].text = newText };
			}
			else {
				if (hud.msgq[i]) hud.msgq[i].text = '';
			}
		}
	};

	function ConnectionClosed(){
		hud.reconn.revive();
		hud.dropConn.kill();
	};

	this.render = function(){
	};
}

console.log(TheGame);
