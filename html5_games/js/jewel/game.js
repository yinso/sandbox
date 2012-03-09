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
 */

var Util =  {
    log : function () {
	console.log(sprintf.apply(this, arguments)); 
    }
    , initArray : function (length, init) {
	var ary = [], i;  
	for (i = 0; i < length; ++i) {
	    ary[i] = init(i); 
	}
	return ary; 
    }
    , callback : function (callback) {
	return function () {
	    try {
		return callback.apply(this, arguments); 
	    } catch ($e) {
		Util.log('callback error: %s', $e); 
	    }
	}; 
    }
}; 

/*
 * a Jewel is moved on the board from cell to cell. 
 * it doesn't necessarily start with a cell in position, but can be "tested" to put into a cell 
 * to see how it would behave... 
 * if the "test" works it will be moved into that new cell from the current position. 
 * if not - just revert back to the original positions. 
 * during the test - the 
 * so that means there is a way to swap the two views from Jewel's perspective, because Jewel is holding 
 * information duplciated elsewhere (in cell & board specifically). 
 * 
 * so how will this work? let's think through the scenarios. 
 * 
 * 1 - before placing on board - they exists just off the board location - at this time they already have a logical location
 * 2 - placing jewel onto board - logical location = physical location 
 * 3 - testing for swap - logical location != physical location 
 * 4 - transform into the swapped position => logical == physical 
 * 5 - drop cells => logical differ from physical yet again... 
 * 
 * so the key is to develop two positions - one logical, and the other physical. 
 * the physical location also appears to be two separate things, one is physical of the presentation, and the other 
 * actually representing it? 
 * 
 */
var Jewel = bzj.Class( {
    init : function () {
	this.type = this.randomJewel(); // based on this we'll choose a simple display... 
    } 
    , setup : function (board, cell) {
	this.board = board; 
	this.cell = cell; // cells carries its logical position. 
	// 0 => -1 
	// 1 => -2 
	this.physical = { left : cell.col , top : Board.ROWS + this.cell.row }; 
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
    setup : function (board, row, col) {
	this.board = board; 
	this.row = row; 
	this.col = col; 
    }
    , same : function (c2) {
	if (c2.jewel) {
	    return this.jewel.sameType(c2.jewel); 
	} else {
	    return false; 
	}
    }
    , isAdjacent : function (c2) {
	Util.log('(%d, %d) <> (%d, %d); distance = (%d, %d)', this.row, this.col, c2.row, c2.col
		 , Math.abs(this.row - c2.row), Math.abs(this.col - c2.col)); 
	return (Math.abs(this.row - c2.row) == 1 ? 1 : 0 ^ Math.abs(this.col - c2.col) == 1 ? 1 : 0); 
    }
    , setJewel : function (jewel) {
	this.jewel = jewel; 
	jewel.cell = this; 
    }
    , swapJewel : function (cell) {
	// cell MUST BE defined. 
	Util.log('Cell.swapJewel(%s)', cell); 
	var jewel = cell.jewel; 
	cell.jewel = this.jewel; 
	this.jewel = jewel; 
    }
    , clear : function () {
	// how do I drop the jewel? 
	this.jewel.clear(); 
	this.jewel = null; 
    }
    , draw : function() {
	Util.log('Cell.draw()'); 
	this.jewel.draw(); 
    }
    , sync : function () {
	// if the cell has no jewel it has no sync... 
	if (this.jewel) {
	    this.jewel.cell = this; 
	    this.jewel.syncPosition();
	}
    }
    , select : function () {
	Util.log('Cell.select: jewel = %s', this.jewel); 
	this.jewel.select(); 
    }
    , unselect : function () {
	this.jewel.unselect(); 
    }
    , highlight : function () {
	if (this.jewel) 
	    this.jewel.highlight(); 
    }
    , unhighlight : function () {
	if (this.jewel) 
	    this.jewel.unhighlight(); 
    }
}); 

/* the logic of chain is quite crazy. 
 * 
 * a chain is formed when there are 3 or more colors in a row, horizontally or vertically.
 * 3+ in a row can be tested in the following fashion. 
 * for each cell X -> check in 4 directions and see how many are of the same color.
 * but when it's used for determine the above dropping areas, we are now in trouble, because 
 * we must deal with the situation where the chains are likely to be in close proximity and 
 * hence forms a bigger empty area... 
 * YES - when chains are being cleared we are actually generating an *EMPTY* area... okay!!! that's the key. 
 * emptyArea must be tracked in the 
 */
var Chain = bzj.Class( {
    aboveChains : [] 
    , vertical : [] 
    , horizontal : [] 
    , setup : function (board, cell, cell2) {
	this.board = board; 
	this.cell = cell; // this is the center 
	this.cell2 = cell2; // note both forms a different color... 
	this.checkChain(); 
    }
    , isChain : function () {
	return this.horizontal.length > 0 || this.vertical.length > 0; 
    }
    , checkChain : function () {
	var horizontal = this.checkHorizontalChain(this.cell);
	this.horizontal = horizontal.length >= 2 ? horizontal : []; 
	var vertical = this.checkVerticalChain(this.cell);
	this.vertical = vertical.length >= 2 ? vertical : []; 
    }
    , checkHorizontalChain : function (cell) {
	// 0, -1 => left
	// 0, 1 => right. 
	return this.matchOneDir(cell, 0, 1).concat(this.matchOneDir(cell, 0, -1));
    }
    , checkVerticalChain : function (cell) {
	// 1, 0 => up
	// -1, 0 => down
	return this.matchOneDir(cell, -1, 0).concat(this.matchOneDir(cell, 1, 0)); // the maximum is going to be at the end... 
    }
    , match3 : function (cell) {
	return this.matchOneDir(cell, -1, 0).length >= 2 || this.matchOneDir(cell, 0, -1).length >= 2; 
    }
    , matchOneDir : function (cell, diffRow, diffCol, matchCallback) {
	matchCallback = matchCallback || Util.callback(function(c1, c2) { return c1.same(c2); }); 
	var matched = [], nextCell = this.board.incCell(cell, diffRow, diffCol);
	while (nextCell !== null && matchCallback(cell, nextCell)) {
	    matched.push(nextCell); 
	    nextCell = this.board.incCell(nextCell, diffRow, diffCol);
	}
	// if (cell) {
	//    Util.log('matchOneDir(%d, %d) => %s', cell.row, cell.col, matched); 
	// }
	return matched; 
    }
    , clear : function () {
	var callback = function (i, cell) {
	    cell.clear();
	}; 
	if (this.isChain()) {
	    bzj.each(callback, this.horizontal); 
	    bzj.each(callback, this.vertical); 
	    this.cell.clear(); 
	}
    }
    , highlight : function () {
	var callback = function (i, cell) {
	    cell.highlight(); 
	}
	if (this.isChain()) {
	    bzj.each(callback, this.horizontal); 
	    bzj.each(callback, this.vertical); 
	    this.cell.highlight(); 
	}
    }
    , highlightAbove : function () {
	var self = this;  
	var callback = function (i, cell) {
	    // go above the 
	    var cells = self.matchOneDir(cell, 1, 0, Chain.AnyCellCallback); 
	    bzj.each(function (i, cell) { cell.highlight(); }, cells); 
	    self.aboveChains.push(cells); 
	}; 
	if (this.isChain()) {
	    bzj.each(callback, this.horizontal); 
	    // also do so for the vertical chain... only need to find out the max
	    var verticalCell = this.vertical.length > 0 ? this.vertical[this.vertical.length - 1] : this.cell; 
	    callback(this.aboveChains.length , verticalCell); 
	}
    }
    , dropAboveChains : function () {
	// what we want to do is to determine how many steps we need to move down... 
	// the horizontal chains will be 1, and the vertical chain will be the height of the vertical chain. 
	// so - for each chains determine how many to drop per cell... 
	// the way to do so is to determine how many cells to translate down... 
	var vlen = this.vertical.length + 1, vcol = this.cell.col; 
	var self = this; 
	bzj.each(function (i, chain) {
		bzj.each(function (j, cell) {
		    // each of the cells needs to be moved down to the 
		    var cellDown = self.board.incCell(cell, 0 - (i == self.aboveChains.length - 1 ? vlen : 1), 0); 
		    Util.log('dropCell: (%d, %d) => (%d, %d)', cell.row, cell.col, cellDown.row, cellDown.col); 
		    cellDown.swapJewel(cell); 
		    cellDown.sync(); 
		    cellDown.unhighlight(); 
		}, chain); 
	}, self.aboveChains); 
	
    }
} , { } , {
    EmptyCellCallback : Util.callback(function (c1, c2) {
	return c2.jewel == null; 
    })
    , AnyCellCallback : Util.callback(function(c1, c2) {
	return true; 
    })
}); 

var Board = bzj.Class({
    /*
     * the board is an 8 x 8 array, where (0, 0) is on the bottom left (i.e. not top-left). 
     */
    inner : [] 
    , selected : null 
    , setup : function (canvas) {
	this.canvas = canvas; 
	this.setupBoard(); 
    }
    , setupBoard : function () {
	var self = this; 
	self.inner = Util.initArray(Board.ROWS, function (row) {
	    return Util.initArray(Board.COLS, function (col) {
		return new Cell(self, row, col); 
	    }); 
	}); 
    }
    , walkBoard : function (callback) {
	var i, j;
	for (i = 0; i < Board.ROWS; ++i) { 
	    for (j = 0; j < Board.COLS; ++j) {
		callback(this.inner[i][j]); 
	    }
	}
    }
    , fillBoard : function() {
	var self = this; 
	self.walkBoard(function(cell) {
	    if (!cell.jewel) {
		do {
		    self.setCell(cell); 
		} while (self.match3(cell)); 
	    }
	}); 
    }
    , incCell : function(cell, row, col, toThrow) {
	return this.cell(cell.row + row, cell.col + col, toThrow); 
    }
    , outsideBoard : function (index, max) {
	return 0 > index || index >= max; 
    }
    , match3 : function (cell) {
	var chain = new Chain(this, cell); 
	return chain.isChain(); 
    }
    , unselect : function (cell) {
	// unselect works for both unselecting the already selected cell, or 
	// when the swapping occurs (the selected jewel is now at a different cell)
	// in the first scenario, do not pass in cell
	// in the second scenario, the swapped cell needs to be passed in. 
	this.selected.unselect(); 
	if (cell)
	    cell.unselect(); 
	this.selected = null; 
    }
    , select : function (cell) {
	Util.log('board.select, cell = %s', cell); // why is the cell = undefined? 
	// if there is nothing in this.select, we'll add it to it.
	if (this.selected === null) {
	    this.selectCell(cell); 
	} else {
	    if (cell === this.selected) { // unselect the original cell. 
		this.unselect(); 
	    } else if (cell.isAdjacent(this.selected)) {
		this.trySwapCell(cell); 
	    } else {
		alert ('Sorry you select a jewel not next to the first selected jewel'); 
	    }
	} 
    }
    , selectCell : function (cell) {
	this.selected = cell; 
	this.selected.select(); 
    }
    , trySwapCell : function (cell) {
	cell.swapJewel(this.selected); 
	var chain1 = new Chain(this, cell), chain2 = new Chain(this, this.selected); 
	if (chain1.isChain() || chain2.isChain()) {
	    this.doSwapCell(cell, chain1, chain2); 
	} else {
	    alert('Sorry the swap does not form a chain - please select another jewel'); 
	    cell.swapJewel(this.selected); 
	}
    }
    , tryChainReaction : function () {
	// this will require having a cell to find out the chains... hmm... 
	// we'll have to create a new sets of chains based on the new thing!!! 
	// i.e. we'll need to be able to produce chains without going beyond... 
    }
    , chainReaction : function(chain1, chain2) {
	self = this; 
	setTimeout(Util.callback(function () {
	    chain1.highlight(); 
	    chain2.highlight(); // seems like the chain logics are correct... 
	    // /* 
	    setTimeout(Util.callback(function () {
		chain1.clear();
		chain2.clear(); 
		var emptyArea = self.getEmptyArea(); 
		var aboveChains = self.getAboveChains(emptyArea); 
		self.dropAboveChains(emptyArea, aboveChains); // is it time to determine if we have 
		// self.tryChainReaction(); 
		// self.fillBoard(); 
		// self.draw(); 
	    }), 300); // */
	}), 100); 
	    
    }
    , doSwapCell : function (cell, chain1, chain2) {
	cell.sync(); 
	var self = this; 
	var selected = this.selected; 
	this.selected.sync(); 
	this.unselect(cell); // there should only be a single chain object!!! 
	this.chainReaction(chain1, chain2); 
    }
    , getEmptyArea : function () {
	/* 
	 * the empty areas are currently difficult to produce. 
	 * we have two chains - we can arguably try to merge the two chains together. 
	 * given there are only 4 potential directions, the question 
	 */
	var i, j, emptyCols = []; 
	for (j = 0; j < Board.COLS; ++j) {
	    emptyCols[j] = []; 
	    for (i = 0; i < Board.ROWS; ++i) {
		if (this.inner[i][j].jewel == null) {
		    emptyCols[j].push(this.inner[i][j]); 
		}
	    }
	}
	return emptyCols; 
    }
    , cellsAbove : function (cell) {
	// increase just the row++... 
	var row = cell.row + 1, cells = []; 
	while (row < Board.ROWS) {
	    cells.push(this.inner[row++][cell.col]);
	}
	return cells; 
    }
    , getAboveChains : function (emptyArea) {
	// we want to see if
	var i, aboveChains = [], self = this; 
	
	bzj.each(function (i, chain) {
	    if (chain.length > 0) { // if this is gre
		var topCell = chain[chain.length - 1]; 
		var above = self.cellsAbove(topCell); 
		if (above.length > 0) {
		    aboveChains.push(above); 
		    bzj.each(function (i, cell) { cell.highlight(); }, above); 
		}
	    }
	}, emptyArea); 
	return aboveChains; 
    }
    , dropAboveChains : function (emptyArea, aboveChains) {
	var self = this; 
	bzj.each(function(i, chain) {
	    // each of the object's here. 
	    var col = chain[0].col; // each chain has 1+ cell. 
	    bzj.each(function (j, cell) {
		// time to move the cell down the # of emptyArea's length. 
		var downCell = self.incCell(cell, 0 - emptyArea[col].length, 0); 
		Util.log('dropAboveChains (%d, %d) => (%d, %d)', cell.row, cell.col, downCell.row, downCell.col); 
		downCell.swapJewel(cell); 
		cell.sync(); 
		downCell.sync();
		//cell.unhighlight(); 
		// downCell.unhighlight(); 
	    }, chain); 
	}, aboveChains); 
    }
    , cell : function (row, col, toThrow) {
	toThrow = toThrow || false; 
	if (toThrow) {
	    if (this.outsideBoard(row, Board.ROWS)) 
		throw 'outside row range: ' + row; 
	    if (this.outsideBoard(col, Board.COLS)) 
		throw 'outside col range: ' + col; 
	} else {
	    if (this.outsideBoard(row, Board.ROWS)) 
		return null; 
	    if (this.outsideBoard(col, Board.COLS)) 
		return null; 
	}
	return this.inner[row][col]; 
    }
    , clear : function () {
	var self = this; 
	self.walkBoard(function (cell) {
	    cell.clear(); 
	}) ; 
    }
    , draw : function () {
	Util.log('Board.draw'); 
	this.walkBoard(function(cell) {
	    cell.draw(); 
	}); 
    }
} , {} , {
    COLS : 8 
    , ROWS : 8 
}); 

/* DIV style board/cell/jewel */
var DivJewel = bzj.Class( { 
    $base : Jewel 
    , furtherSetup : function () {
	var self = this; 
	$(self.canvas).click(Util.callback(function() {
	    self.board.select(self.cell); 
	})); 
    }
    , clear : function () {
	$(this.canvas).remove(); 
	this.board = null; 
	this.canvas = null; 
    }
    , draw : function () {
	var self = this; 
	this.canvas = $('<div />' , { class : 'jewel' }).appendTo(this.board.canvas)[0]; 
	var style = this.canvas.style; 
	style.backgroundImage = 'url(img/jewels80.png)'; 
	style.backgroundSize = (Jewel.TYPES * 100) + '%'; 
	style.backgroundPosition = this.type + 'em'; 
	style.display = 'block'; 
	this.furtherSetup(); 
	this.syncPosition(); 
    }
    , select : function () {
	$(this.canvas).addClass('cell-selected'); 
    }
    , unselect : function () {
	Util.log('DivJewel.unselect(%s)', this.canvas); 
	$(this.canvas).removeClass('cell-selected'); 
    }
    , physicalTop : function () {
	// the physical position is tricky... 
	// we are tracking the physical position as related to the board... 
	// i.e. it's not the physical position that we are interested at all but the offset of it... 
	// i.e. it makes no sense to try to generate 
	// when it's off the board, it's at (8, 0) ... this is actually (-1, 0) on true device position. 
	// when it's on (0, 0) of a cell - it's actually @ (7, 0) for the top. 
	// if we can get this to translate appropriately we probably have this problem solved. 
	// that means the difference is actually Board.ROWS == 8, and then minus 9. 
	return Board.ROWS - this.physical.top - 1; 
    }
    , physicalLeft : function () {
	return this.physical.left; 
    }
    , syncPosition : function () {
	//Util.log('sync: cell (%d, %d) <> physical (%f, %f)', this.cell.row, this.cell.col
	//	 , this.physical.top, this.physical.left); 
	var steps = Math.max ( Math.abs(this.cell.col - this.physical.left) / 0.2
			       , Math.abs(this.cell.row - this.physical.top) / 0.2 ); 
	var xGaps = (this.cell.col - this.physical.left) / steps;
	var yGaps = (this.cell.row - this.physical.top) / steps; 
	// Util.log('sync: %f, %f, %f', xGaps, yGaps, steps); 
	var self = this; 
	
	var i = 0, intervalID = setInterval(function () {
	    self.physical.left = self.physical.left + xGaps; 
	    self.physical.top = self.physical.top + yGaps; 
	    self.reDraw(); 
	    i++; 
	    if (i == steps) {
		self.physical.left = self.cell.col; 
		self.physical.top = self.cell.row; 
		self.reDraw(); 
		clearInterval(intervalID); 
	    }
	}, 50); // */
    }
    , reDraw : function () {
	// Util.log('DivJewel.reDraw (%f, %f) ??? (%f, %f)', this.cell.row, this.cell.col, this.physical.top, this.physical.left); 
	// is this based on the physical position that we'll finally be brought to? 
	// actually logical is what won't change... physical will change!!.. 
	this.canvas.style.left = this.physicalLeft() + 'em'; // left is for columns. 
	this.canvas.style.top = this.physicalTop() + 'em'; // top is for rows.  
    }
    , highlight : function () {
	$(this.canvas).addClass('highlight-' + this.type); 
    }
    , unhighlight : function () {
	$(this.canvas).removeClass('highlight-' + this.type); 
    }
})

var DivBoard = bzj.Class({
    $base : Board
    , setCell : function (cell) {
	cell.setJewel(new DivJewel(this, cell)); 
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
	    // $('#' + screenID).show('slow'); 
	    $('#' + screenID).show(); 
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
	    self.board.draw(); 
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
	    Util.log('fillBoard error: %s', $e); 
	}
	$('#reshuffle-btn').click(function() {
	    self.board.clear(); 
	    self.board.fillBoard(); 
	    self.board.draw(); 
	}); 
	Util.log('game initialized... jewel size = %d' , this.settings.jewelSize); 
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

$(window).load(function () {
    var game = new Game(); 
}); 
