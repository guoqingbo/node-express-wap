$(function () {
    var utils = {
        getLeftTime:function (time) {
            //获取剩余的天，时，分，秒 time 格式 2018-10-11 10:00:00
            var leftTime = {
                    left:0,
                    day:0,
                    hour:0,
                    mimute:0,
                    second:0,
                },
                timeArr = time.split(" ")[0].split("-").concat(time.split(" ")[1].split(":")),
                now = new Date(),
                end = new Date(timeArr[0],timeArr[1]-1,timeArr[2],timeArr[3],timeArr[4],timeArr[5]);

            leftTime.left = end.getTime() - now.getTime();
            if(leftTime.left <= 0 ){
                return leftTime
            }
            leftTime.day = utils.checkTime(parseInt(leftTime.left/1000/60/60/24,10));
            leftTime.hour = utils.checkTime(parseInt(leftTime.left/1000/60/60%24,10));
            leftTime.mimute = utils.checkTime(parseInt(leftTime.left/1000/60%60,10));
            leftTime.second = utils.checkTime(parseInt(leftTime.left/1000%60,10));
            return leftTime
        },
        checkTime:function(i){
            if(i < 10){
                i = "0"+i
            }
            return i;
        }
    }
    //选项卡
    $(".activity-tab-item").click(function () {
        var translateX = $(this).index()*100;
        $(this).siblings().removeClass("active");
        $(this).addClass("active")
        $(".tactivity-tab-panel").css({
            transform:"translateX("+(-translateX)+"%)"
        })
    })
    //日期倒计时 格式2018-09-10 10:00:00
    function timeCount() {
        $(".time-count").each(function () {
            var select = $(this);
            var time = select.data("endtime");
            if(time){
                function timeCount(select) {
                    var leftTime = utils.getLeftTime(time),
                        html = "<span class='time'>"+leftTime.day+"</span>" +
                            "<span class='time'>天</span>" +
                            "<span class='time'>"+leftTime.hour+"</span>" +
                            "<span class='time'>时</span>" +
                            "<span class='time'>"+leftTime.mimute+"</span>" +
                            "<span class='time'>分</span>" +
                            "<span class='time'>"+leftTime.second+"</span>"+
                            "<span class='time'>秒</span>";
                    select.html(html)
                    if(leftTime.left<=0){
                        clearInterval(interval)
                    }
                }
                var interval = setInterval(function(){
                    timeCount(select)
                },1000)
            }
        })
    }
    if($(".time-count").length){
        timeCount()
    }
})
