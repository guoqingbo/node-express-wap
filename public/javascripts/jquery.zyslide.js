(function($){var slide=function(ele,options){var $ele=$(ele);var setting={delay:1000,speed:2000}
    $.extend(true,setting,options);var states=[{ZIndex:1,width:120,height:150,top:69,left:66,ZOpacity:0.2},{ZIndex:2,width:130,height:170,top:59,left:0,ZOpacity:0.5},{ZIndex:3,width:170,height:218,top:35,left:110,ZOpacity:0.7},{ZIndex:4,width:224,height:288,top:0,left:265,ZOpacity:1},{ZIndex:3,width:170,height:218,top:35,left:474,ZOpacity:0.7},{ZIndex:2,width:130,height:170,top:59,left:624,ZOpacity:0.5},{ZIndex:1,width:120,height:150,top:69,left:568,ZOpacity:0.2},]
    var lis=$ele.find('li');function move(){lis.each(function(index,ele){var state=states[index];$(ele).css('z-index',state.ZIndex).finish().animate(state,setting.delay).find('img').css('opacity',state.ZOpacity);});}
    move();function next(){states.unshift(states.pop());move();}
    function prev(){states.push(states.shift());move();}
    $ele.find('.zy-next').click(function(){next();})
    $ele.find('.zy-prev').click(function(){prev();})
    var interval=null;function autoPlay(){interval=setInterval(function(){next()},setting.speed);}
    autoPlay();$ele.find('section').hover(function(){clearInterval(interval);},function(){autoPlay();})}
    $.fn.zySlide=function(options){$(this).each(function(i,ele){slide(ele,options);})
        return this;}})(jQuery)