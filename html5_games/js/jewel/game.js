
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
	console.log('game initialized...'); 
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

// game.setup(); // should automatically be called. 

