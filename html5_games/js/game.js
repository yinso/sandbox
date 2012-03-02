
var game = {
    screenDisplayed : '' // default there is no screen showing in the beginning... 
    , showScreen : function (screenID) {
	// make sure the other ones are hidden... we are showing one screen at a time... 
	// see which screen is shown - if it's not the same as the currently shown screen, show it. 
	if (screenID != game.screenDisplayed) {
	    if (game.screenDisplayed != '') {
		$('#' + game.screenDisplayed).hide();
	    }
	    $('#' + screenID).show('slow'); 
	    game.screenDisplayed = screenID; 
	} // otherwise do nothing. 
    }
    , setup : function () {
	// setup splash-screen... 
	$('#continue-btn').click(function() { 
	    game.showScreen('main-menu'); 
	}); 
	// setup main-screen... 
	$('#game-screen-btn').click(function() {
	    game.showScreen('game-screen'); 
	});
	$('#high-score-btn').click(function() {
	    game.showScreen('high-scores'); 
	}); 
	$('#about-btn').click(function() {
	    game.showScreen('about'); 
	}); 
	$('#exit-screen-btn').click(function() {
	    game.showScreen('exit-screen'); 
	}); 
	// show splash-screen 
	game.showScreen('splash-screen'); 
    }
    , screens : {
    }
    , settings : {
	rows : 8 
	, cols : 8 
	, baseScore : 100 
	, numJewelTypes : 7 
    }
}; 

game.setup(); 


