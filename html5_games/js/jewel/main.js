yepnope([
    {
	load : "http://code.jquery.com/jquery-1.7.1.js"
	, complete : function () {
	    console.log('jquery 1.7.1 loaded'); 
	}
    }
    , {
	load : ["js/bzj/base.js", "js/bzj/timer.js"]
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
