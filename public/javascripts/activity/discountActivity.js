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
    //日期倒计时 格式2018-09-10 10:00:00
    function timeCount() {
        $(".time-count").each(function () {
            var select = $(this);
            var time = select.data("endtime");
            if(time){
                function timeCount(select) {
                    var leftTime = utils.getLeftTime(time),
                        html = "<span class='time'>"+leftTime.day+"</span>" +
                            "<span class='time'>:</span>" +
                            "<span class='time'>"+leftTime.hour+"</span>" +
                            "<span class='time'>:</span>" +
                            "<span class='time'>"+leftTime.mimute+"</span>" +
                            "<span class='time'>:</span>" +
                            "<span class='time'>"+leftTime.second+"</span>";
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
    //优惠券剩余天数
    function couponExpire() {
        $(".coupon-expire").each(function () {
            var $this = $(this)
            var endTime = $this.data("endtime");
            if(endTime){
                var leftTime = utils.getLeftTime(endTime)
                $this.text(leftTime.day+"天后过期")
            }
        })
    }
    if($(".coupon-expire").length){
        couponExpire()
    }

    if($(".drop-box").length){
        /**
         * 初始化获取列表页条件
         */
        var dropBox = $(".drop-box"),
            module = dropBox.data("module"),
            localUrl = location.pathname,
            pageSize = 5, // 每页数据条数
            filterObj = { currPage: 1, pageSize: pageSize }; // 定义一个对象用于存储筛选条件,默认筛选为翻页第一页

        /**
         * 初始化下拉加载插件；
         */
        var dropload = dropBox.dropload({
            scrollArea: window,
            loadDownFn: filterFn
        });

        /**
         * 获取当前页的数据
         * @param startPage
         */
        function filterFn(dropload, startPage) {
            $.ajax({
                type: 'POST',
                url: localUrl,
                data: filterObj,
                dataType: 'json',
                success: function (data) {
                    console.log(localUrl)
                    if (data !== 'error' && data[0].flag !== 'error') {
                        //检测登录状态
                        if (data[0].status === 400) {
                            window.location.href = '/login?redir=' + window.location.pathname + window.location.search;
                        }
                        var results = data[0].data;

                        if (startPage) {
                            dropBox.find('ul').html(results.html);
                        } else {
                            dropBox.find('ul').append(results.html);
                        }
                        if(module === "sencondsKill"){
                            timeCount()
                        }else if(module === "coupons"){
                            couponExpire()
                        }
                        filterObj.currPage += 1;
                        console.log(filterObj.currPage > results.pages)
                        if (filterObj.currPage > results.pages) {
                            dropload.lock();
                            dropload.noData();
                        }
                    } else {
                        dropload.lock();
                        dropload.noData();
                    }
                    // 每次数据加载完，必须重置
                    dropload.resetload();
                },
                error: function (error) {
                    console.log(error)
                    // 即使加载出错，也得重置
                    dropload.resetload();
                }
            });
        }
    }
});


