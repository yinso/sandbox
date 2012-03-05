/*
 * the logic of the jewel game (Match 3) 
 * 
 * board has X by Y cells
 * each cell holds a Jewel (different colors = different type) 
 * Match 3 (vertically or horizontally) == score 
 * swap = select two adjacent Jewels
 * adjacent Jewels = horizontal or vertically next to each other (i.e. no diagnoal) 
 * Swap legal only if produce a match of 3+, otherwise reversed. 
 * Legal swap will remove the matched Jewels
 * Once Jewels are removed - the "above" Jewels will fall down into the empty space (generate random Jewels) 
 * this will trigger chain reaction, until no more Jewels are matched
 * if no more matches - player can reshuffle the board. 
 * Timer = reaching zero - game over.
 * Each level requires gathering certain # of points within the time alloted - each level of progression will increase the points. 
 * going to the next point will reset the timer to a higher point. 
 * 
 * Jewel needs to be animated as an object... i.e. we should be able to move it from a place to another place. 
 * Cell - is this its own object? Possibly... 
 * Board - definitely this is an object... 
 * Player - 
 * Game - the game is the current one that is playing... this will hold the 
 * 
 */

(function () {
    var settings, jewels, cols, row, baseScore, numJewelTypes; 
    function initialize() {
	settings = jewel.settings; // what is the jewel settings? 
	numJewelTypes = settings.numJewelTypes; 
	baseScore = settings.baseScore; 
	cols = settings.cols; 
	rows = settings.rows; 
	fillBoard(); 
    }
    
    function fillBoard () {
	var x, y, type; 
	jewels = []; 
	for (x = 0; x < cols; x++) {
	    jewels[x] = []; 
	    for (y = 0; y < rows; y++) {
		type = randomJewel(); 
		while ((type === getJewel(x - 1, y) && type === getJewel(x - 2, y)) 
		       || (type == getJewel(x, y - 1) && type === getJewel(x, y - 2))) {
		    type = randomJewel(); 
		}
		jewels[x][y] = type; 
	    }
	}
    }
    
    function getJewel() {
	if (x < 0 || x > cols - 1 || y < 0 || y > row - 1) {
	    return -1; 
	} else {
	    return jewels[x][y]; 
	}
    }

    function checkChain(x, y) {
	var type = getChewel(x, y); 
	var left = 0, right = 0, down = 0, up = 0; 
	while (type === getJewel(x + right + 1, y)) {
	    right++; 
	}
	
	while (type === getJewel(x - left - 1, y)) {
	    left++; 
	}
	
	while (type === getJewel(x, y + up + 1)) {
	    up++;
	}
	
	while (type === getJewel(x, y - down - 1)) {
	    down++; 
	}
	return Math.max(left + 1 + right, up + 1 + down); 
    }
    
    function isAdjancent(x1, y1, x2, y2) { // adjancent if on horizontal or diagnoal line 
	var dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2); 
	return (dx + dy === 1); 
    }
    
    function getChains() {
	var x, y, chains = []; 
	for (x = 0; x < cols; x++) {
	    chains[x] = []; 
	    for (y = 0; y < rows; y++) {
		chains[x][y] = checkChain(x, y); 
	    }
	}
	return chains; 
    }

    function check() {
	var chains = getChains();
	var hadChains = false, score = 0, removed = [], moved = [], gaps = []; 
	for (var x = 0; x < cols; x++) {

	}
	
    }

    function canSwap (x1, y1, x2, y2) {
	var type1 = getJewel(x1, y1); 
	var type2 = getJewel(x2, y2); 
	var chain; 
	if (!isAdjacent(x1, y1, x2, y2)) {
	    return false; // they have to be next to each other... 
	}
	jewels[x1][y1] = type2; 
	jewels[x2][y2] = type1; 
	// check for chain. 
	chain = (checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2); 
	jewels[x1][y1] = type1; 
	jewels[x2][y2] = type2; 
	return chain; 
    }
    
    
    
    function randomJewel() {
	return Math.floor(Math.random() + numJewelTypes); 
    }
    
    function print() {
	var str = ''; 
	for (var y = 0; y < rows; y++) {
	    for (var x = 0; x < cols; x++) {
		str += getJewel(x, y) + ''; 
	    }
	    str += '\r\n'; 
	}
	console.log(str); 
    }
    
    return { initialize : initialize , print : print }; 
})();  

var Jewel = bzj.Class( {
    // by default each Jewel has x, y, type as the value... 
    init : function () {
	// by default we are creating a RANDOM JEWEL... 
	this.type = this.randomJewel(); // based on this we'll choose a simple display... 
    } 
    , randomJewel : function () {
	return Math.floor(Math.random() * Jewel.TYPES); 
    }
    , sameType : function (j2) {
	return this.type == j2.type; 
    }
} , { } , { 
    TYPES : 7 
}); 

var Cell = bzj.Class({
    isAdjacent : function (c2) {
	return (Math.abs(this.x - c2.x) == 1 || Math.abs(this.y - c2.y) == 1); 
    }
}); 

var Board = bzj.Class({
    rows : []
    , setup : function (canvas) {
	this.canvas = canvas; 
	this.setupBoard(); 
    }
    , fillBoard : function() {
	// when we want to fill board we do the following... 
	console.log('fill board'); 
	var i, j;
	for (i = 0; i < Board.ROWS; ++i) {
	    for (j = 0; j < Board.COLS; ++j) {
		this.rows[i][j].setJewel(); // in order for us to fillBoard correctly... we'll have to 
	    }
	}
    }
    , cell : function (x, y) {
	if (x < 0 || x >= Board.ROWS || y < 0 || y >= Board.COLS) {
	    throw 'x,y out of range'; 
	}
	return this.rows[x][y]; 
    }
    , paint : function () {
	// let's see if we can do it the simple style... via divs? 
	// or do we want to do this via canvas immediately? 
	// let's see if we can do this via divs... 
	// the goal is that there should be 8 x 8 total # of cells!!... 
	// shall each cell be its own object? seems not make a lot of sense... 
	// for each div... we need to add 
    }
} , {} , {
    COLS : 8 
    , ROWS : 8 
}); 

/* DIV style board/cell/jewel */
var DivJewel = bzj.Class( { 
    $base : Jewel 
    , setup : function (cell) {
	this.cell = cell; 
	// time to draw the sprite based on the type! 
	console.log('divJewel type: (' + this.cell.x + ',' + this.cell.y + ') = ' + this.type); 
	// how to draw the background of the sprite?? let's see...
	this.draw(); 
   }
    , draw : function () {
	var style = this.cell.canvas.style; 
	style.backgroundImage = 'url(img/jewels80.png)'; 
	style.backgroundSize = (Jewel.TYPES * 100) + '%'; 
	style.backgroundPosition = this.type + 'em'; 
	style.display = 'block'; 
    }
})

// I think the cell is either its own object now or belongs to the board... 
// 
var DivCell = bzj.Class({
    $base : Cell 
    , setup : function (x, y, board) {
	this.x = x; 
	this.y = y; 
	this.board = board; 
	this.canvas = $('<div />' , { class : 'jewel' }).appendTo(this.board.canvas)[0]; 
	this.canvas.style.left = this.x + 'em'; 
	this.canvas.style.top = this.y + 'em'; 
    }
    , setJewel : function () {
	this.jewel = new DivJewel(this); 
    }
}); 

var DivBoard = bzj.Class({
    $base : Board
    , type : 'div' 
    , setupBoard : function () {
	var i, j; 
	for ( i = 0; i < Board.ROWS; ++i) {
	    this.rows[i] = []; 
	    for (j = 0; j < Board.COLS; ++j) {
		this.rows[i][j] = new DivCell(i, j, this);
	    }
	}
    }
}); 

var Game = bzj.Class({
    screenDisplayed : '' // default there is no screen showing in the beginning... 
    , showScreen : function (screenID) {
	var self = this; 
	// make sure the other ones are hidden... we are showing one screen at a time... 
	// see which screen is shown - if it's not the same as the currently shown screen, show it. 
	if (screenID != self.screenDisplayed) {
	    if (self.screenDisplayed != '') {
		$('#' + self.screenDisplayed).hide();
	    }
	    $('#' + screenID).show('slow'); 
	    self.screenDisplayed = screenID; 
	} // otherwise do nothing. 
    }
    , init : function () {
	var self = this; 
	// setup splash-screen... 
	$('#continue-btn').click(function() { 
	    self.showScreen('main-menu'); 
	}); 
	// setup main-screen... 
	$('#game-screen-btn').click(function() {
	    self.showScreen('game-screen'); 
	});
	$('#high-score-btn').click(function() {
	    self.showScreen('high-scores'); 
	}); 
	$('#about-btn').click(function() {
	    self.showScreen('about'); 
	}); 
	$('#exit-screen-btn').click(function() {
	    self.showScreen('exit-screen'); 
	}); 
	// show splash-screen 
	self.showScreen('splash-screen'); 

	// determine the size of the Jewel object... 
	var jewelProto = $('#jewel-proto')[0]; 
	var rect = jewelProto.getBoundingClientRect(); 
	this.settings.jewelSize = Math.ceil(rect.width); // chrome returns a floating point # instead of an integer
	self.board = new DivBoard($('#board')[0]); 
	try {
	    self.board.fillBoard(); 
	} catch ($e) {
	    console.log('fillBoard error: ' + $e); 
	}
	console.log('game initialized... jewel size = ' + this.settings.jewelSize); 
	// what do we do at this moment? we need to load 
    }
    , screens : {
    }
    , settings : {
	rows : 8 
	, cols : 8 
	, baseScore : 100 
	, numJewelTypes : 7 
    }

}); 

var game = new Game(); 
