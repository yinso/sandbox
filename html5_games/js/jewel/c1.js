function drawSmiley(canvas) {
    var ctx = canvas.getContext("2d"); 
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(50, 50, 25, 0, Math.PI * 2, true); // make a circle arc
    ctx.arc(150, 50, 25, 0, Math.PI * 2, true); // make a circle arc
    ctx.fill(); 
    ctx.fillStyle = 'red'; 
    ctx.beginPath(); 
    ctx.moveTo(100, 75);
    ctx.lineTo(75,125);
    ctx.lineTo(125, 125);
    ctx.fill();
    ctx.strokeStyle = 'green'; 
    ctx.beginPath(); 
    ctx.scale(1, 0.5);
    ctx.arc(100, 300, 75, Math.PI, 0, true); 
    ctx.closePath(); 
    ctx.stroke(); 
}

function setupAudio(audio) {
    $(document).keydown(function (evt) {
	if (evt.keyCode == 83) { // s
	    audio.pause(); 
	} else if (evt.keyCode == 80) { // p
	    audio.play(); 
	} else {
	    console.log('unknown key'); 
	}
    });
} 

function setupEchoSocket(socketURL , message , log) {
    var socket = new WebSocket(socketURL);
    socket.onopen = function () {
	socket.send(message); 
    }; 
    socket.onmessage = function (msg) {
	addToLog(log, msg.data); 
    }; 
}

function addToLog(log, msg) {
    log.innerHTML += msg + '<br />'; 
}

function runMe(keys) {
    drawSmiley($(keys.canvas)[0]); 
    setupAudio($(keys.audio)[0]);
    var log = $(keys.socket.log)[0];
    $(keys.socket.echoNow).click(function () {
	setupEchoSocket(keys.socket.url, $(keys.socket.message)[0].value, log); 
    }); 
    $(keys.socket.clearLog).click(function () {
	log.innerHTML = ''; 
    }); 
    var store = keys.storage.store; 
    var retrieve = keys.storage.retrieve; 
    $(store.click).click(function () {
	localStorage.setItem($(store.key)[0].value, $(store.value)[0].value);
	alert('key ' + $(store.key)[0].value + ' stored - use below to see the value'); 
    }); 
    $(retrieve.click).click(function() {
	$(retrieve.value)[0].innerHTML = localStorage.getItem($(retrieve.key)[0].value);
    }); 
}


