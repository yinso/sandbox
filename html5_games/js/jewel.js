/* bzj.module('game' */

// /*
yepnope([
    {
	load : "http://code.jquery.com/jquery-1.7.1.min.js"
	, complete : function () {
	    console.log('jquery 1.7.1 loaded'); 
	}
    }
    , {
	load : "bzjs/base.js"
	, complete : function () {
	    console.log('bzjs base.js loaded');
	    yepnope([
		{ load : 'js/game.js' 
		  , complete : function () {
		      console.log('game.js loaded'); 
		  }
		}
	    ]); 
	}
    }
]); //*/
