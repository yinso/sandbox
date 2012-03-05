/* bzj.module('game' */

// /* in firefox yepnope is not yet defined here... 
yepnope([
    {
	load : "http://code.jquery.com/jquery-1.7.1.min.js"
	, complete : function () {
	    console.log('jquery 1.7.1 loaded'); 
	}
    }
    , {
	load : "js/bzj/base.js"
	, complete : function () {
	    console.log('bzjs base.js loaded');
	    yepnope([
		{ load : 'js/jewel/game.js' 
		  , complete : function () {
		      console.log('game.js loaded'); 
		  }
		}
	    ]); 
	}
    }
]); //*/
