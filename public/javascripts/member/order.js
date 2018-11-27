$(function(){
        $(".tab-search-panel").each(function(){
            var height=$(this).outerHeight(true);
            $(this).css("top",-height+"px");
        });
        var touchobj=$("#searchtab").find("a"),div,tabpanel=$(".tab-search-panel").find("a");
        touch.on(touchobj,'tap',function(){
            if($(this).hasClass("c-base")){
                div=dialogclose(div);
            }
            else{
                dialogclose(div);
                div=$(this).parent().data("div");
                $(this).addClass("c-base");
                if(dodiv()){
                    setTimeout(function(){
                        $("#"+div).stop().animate({
                            top:$("#search-h").outerHeight(true)-1
                        },300);
                    },300);
                }else{
                    $("#"+div).stop().animate({
                        top:$("#search-h").outerHeight(true)-1
                    },300);
                }
                $("#mask").fadeIn();
            }
        });
        touch.on("#mask","tap",function(){
            div=dialogclose(div);
        });
        touch.on("#mask","touchend",function(event){
            event.preventDefault();
        });
        touch.on(tabpanel,'tap',function(ev){
            var text=$(this).text();
            var height=$("#"+div).outerHeight(true);
            //$(".page-list").find("a").addClass("prevent");
            $("#searchtab").find("li[data-div="+div+"]").find("a").text(text);
            $(this).parent().siblings().find("a").removeClass("c-base");
            $(this).addClass("c-base");
            div=dialogclose(div);
            ev.preventDefault();
        });
        touch.on(tabpanel,'touchend',function(event){
            event.preventDefault();
        });
    });
    function dialogclose(div){
        var height=$("#"+div).outerHeight(true);
        $("#"+div).stop().animate({
            top:-height+"px"
        },300);
        $("#mask").hide();
        $("#searchtab").find("a").removeClass("c-base");
        div=null;
        return div;
    }
    function dodiv(){
        var flag=false;
        $(".tab-search-panel").each(function(){
            var top=$(this).position().top;
            if(top>0){
                flag=true;
                return false;
            }
        });
        return flag;
    }