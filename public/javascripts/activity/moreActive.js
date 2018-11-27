$(function () {
    /**
     * banner
     */
    var bannerSwiper = new Swiper('#banner_swiper', {
        loop: true,
        //autoplay: 4000,
        pagination: '.swiper-pagination',
        paginationClickable: true,
    });
    //日期倒计时 格式2018-09-10 10:00:00
    function timeCountNow(select) {
        var time = select.attr("endTime");
        console.log(time)
        function timeCount(select) {
            var timeArr = time.split(" ")[0].split("-").concat(time.split(" ")[1].split(":"));
            var now = new Date(),
                end = new Date(timeArr[0],timeArr[1],timeArr[2],timeArr[3],timeArr[4],timeArr[5]),
                left = end.getTime() - now.getTime(),
                day = checkTime(parseInt(left/1000/60/60/24,10)),
                hour = checkTime(parseInt(left/1000/60/60%24,10)),
                mimute = checkTime(parseInt(left/1000/60%60,10)),
                second = checkTime(parseInt(left/1000%60,10)),

                html = "<span>"+day+"</span>:<span>"+hour+"</span>:<span>"+mimute+"</span>:<span>"+second+"</span>";
            select.html(html)
            if(left<=0){
                clearInterval(interval)
            }
        }
        function checkTime(i){
            if(i < 10){
                i = "0"+i
            }
            return i;
        }
        var interval = setInterval(function(){
            timeCount(select)
        },1000)
    }
    var countTime = $(".time-count");
    for (var i=0;i< countTime.length;i++){
        console.log($(countTime[i]))
        timeCountNow($(countTime[i]))
    }
});


