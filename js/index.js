var headShotClicked = 0;
var contactCirclesExpanded = 0;
var leftValues = new Array();
var topValues = new Array();

//expands from the middle
function expand(radius, newWidth, newHeight, offset, itemClass, changeZ, speed) {
	console.log("expanding");
    var radius = radius;
    var fields = $(itemClass);
    var width = newWidth;
    var height = newHeight;
    var angle = 0, step = (2*Math.PI) / fields.length;
    fields.each(function() {
    	var degrees = angle * 180/3.14;
    	console.log(degrees);
        var x = Math.round(width/2 + radius * Math.cos(angle) - $(this).width()/2) - offset;
        var y = Math.round(height/2 + radius * Math.sin(angle) - $(this).height()/2) - offset;

		if(degrees > 90 && degrees < 270){
        	var temp = x - radius;
        	$(this).velocity({ left: '+='+temp+'px', top: '+='+y+'px'}, {duration: speed, easing:"easeInQuad", 
        		complete: function() {
        			if(changeZ)
        				$(this).css('z-index', '100');
      			}
    		});
        }
        else{
        	var temp = x + radius;
        	$(this).velocity({left: '+='+temp+'px', top: '+='+y+'px'}, {duration: speed, easing:"easeInQuad",
        		complete: function() {
        			if(changeZ)
        				$(this).css('z-index', '100');
      			}
    		});
        }
        leftValues.push(x+'px');
        topValues.push(y+'px');
        angle += step;
    });

    //$(".surrounding").css('z-index', '100');
    console.log(leftValues);
    console.log(topValues);
}

//reverts back to the middle
function revert(radius, newWidth, newHeight, offset, itemClass, changeZ, speed) {
	console.log("expanding");
	if(changeZ)
		$(itemClass).css('z-index', '-100');
    var radius = radius;
    var fields = $(itemClass);
    var width = newWidth;
    var height = newHeight;
    var angle = 0, step = (2*Math.PI) / fields.length;
    var increment = 0;
    fields.each(function() {
    	var degrees = angle * 180/3.14;
    	console.log(degrees);
        var x = Math.round(width/2 + radius * Math.cos(angle) - $(this).width()/2) - offset;
        var y = Math.round(height/2 + radius * Math.sin(angle) - $(this).height()/2) - offset;

		if(degrees > 90 && degrees < 270){
        	var temp = x - radius;
        	$(this).velocity({left: '-='+temp+'px', top: '-='+y+'px'}, {duration: speed, easing:"easeInQuad"});
        }
        else{
        	var temp = x + radius;
        	$(this).velocity({left: '-='+temp+'px', top: '-='+y+'px'}, {duration: speed, easing:"easeInQuad"});
        }
        angle += step;
    });
}

//function that displays the loading animation
function displayLoader(){
	$(".loader").fadeOut(2000);
}//end of displayLoader

$(window).on('load', function(){
    $(".loader").fadeOut(1500, function() {
	   expand(200, 200, 200, 70, '.contactCircle', 1, 150);
	   contactCirclesExpanded = 1;	
	});

    $('#headshot').on('mouseenter',function(event) {
		$('#name').animate({opacity: 0}, 100);
		$('#intro').animate({opacity: 0}, 100);
		if(contactCirclesExpanded){
			contactCirclesExpanded = 0;
			revert(200, 200, 200, 70, '.contactCircle', 1, 150);
		}
		event.stopPropagation();
	});

	$('#headshot').on('mouseleave',function(event) {
		if(!headShotClicked && !contactCirclesExpanded){
			contactCirclesExpanded = 1;
			$('#name').animate({opacity: 1}, 100);
			$('#intro').animate({opacity: 1}, 100);
			expand(200, 200, 200, 70, '.contactCircle', 1, 150);
		}
		event.stopPropogation();
	});

	$('.surrounding').on('hover',function(event) {
		$(this).css('box-shadow', '0 0 0 0.5vw hsl(0, 0%, 30%),0 0 0 1vw hsl(0, 0%, 70%),0 0 0 2vw hsl(0, 0%, 90%) !important');
	});

	$('#headshot').on('click',function(event) {
		if(headShotClicked){
			//animates back to center
			headShotClicked = 0;
			revert(225, 200, 200, 45, '.surrounding', 1, 300);
		}
		else{
			//animates away from center
			headShotClicked = 1;
			expand(225, 200, 200, 45, '.surrounding', 1, 300);
		}
	});
});