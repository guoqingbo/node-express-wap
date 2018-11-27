$(function () {
    /**
     * 获取天气
     */
    function getWeather(cityName){
        var cityPinyin = ConvertPinyin(cityName).toLowerCase();
        $.ajax({
            type: 'POST',
            url: "/weather",
            data: {py:cityPinyin},
            dataType: 'json',
            success: function (data) {
                var divCurrentWeather = $(data.html).find(".divCurrentWeather");
                $(".weather").html(divCurrentWeather);
            },
            error: function (data) {
                console.log(data)
            }
        });
    }
    getWeather("安图")
    /**
     *切换城市
     */
    $(".change-city").CityPicker({
        onSelectCity:function (city) {
            var cityName = city[1].replace("市","");
            $(".change-city").html("城市切换")
            $(".city-name").text(cityName);
            getWeather(cityName)

            //解决图片加载不出的bug
            if(false){
                var cityPinyin = ConvertPinyin(cityName).toLowerCase();
                var src = "//i.tianqi.com/index.php?c=code&id=1&color=%23FFFFFF&icon=1&py="+cityPinyin+"&wind=1&num=1&site=12";
                var weatherEle = $("#weather iframe");
                weatherEle.prop("src",src);
            }
            // weatherEle.load(function () {
            //     var img = weatherEle.contents().find(".pngtqico");
            //     console.log(img)
            // })
        }
    });
    /**
     * 视频播放暂停
     */

    $(".video-box").click(function () {
        if ($(this).hasClass("play")) {
            $(this).find("video").trigger("pause");
            $(this).removeClass('play');
        } else {
            //暂停其它视频
            $("video").trigger("pause");
            $("video").parents(".video-box").removeClass('play');

            $(this).find("video").trigger("play");
            $(this).addClass('play');
        }
    })

    //直播推荐，获取直播时间
    function getLiveVideoInfo(ele) {
        ele.each(function () {
            console.log( $(this))
            $(this).on('loadedmetadata', function() {
                var duration = $(this)[0].duration.toFixed(2)
                console.log(duration)
                $(this).parents("li").find(".duration").text(duration)
            })
        })

    }
    getLiveVideoInfo($(".live-recommend video"))
    /**
     * 直播推荐
     */
    function swiper() {
        var index = 1;
        var arr = $('.Cooldog_content li')
        var disLeft = 87.5;
        var disright = 69
        var timeOut = null
        var slideStart = false
        //移动
        function move() {
            var disIndex = -index*100;
            arr.each(function (i) {
                if(i === index ){
                    arr.eq(i).addClass("active")
                    arr.eq(i).css({ transform: "translate3d("+disIndex+"%, 0, 0) scale(1)"})
                }else if(i <= (index-1)){
                    arr.eq(i).css({ transform: "translate3d("+(disIndex+disLeft)+"%, 0, 0) scale(0.81)"})
                }else if(i >= (index+1)){
                    arr.eq(i).css({ transform: "translate3d("+(disIndex-disright)+"%, 0, 0) scale(0.81)"})
                }
            })
        }
        //循环
        function loop(dir) {
            //去除过度效果
            arr.css({
                transition: "none"
            })
            if(dir && dir == "right"){
                if (index < 1) {
                    index = arr.length-1
                    // index = 1;
                    // return
                    move()
                }
            }else{
                if (index > arr.length-2) {
                    index = 0
                    // index = arr.length-2;
                    // return
                    move()
                }
            }


        }
        //滑动
        function slide(dir) {
            if(slideStart){
                return
            }
            slideStart = true
            if(dir && dir == "right"){
                index--;
                if (index < 1) {
                    loop(dir)
                    index = arr.length-2
                    // index = 1;
                    // return
                }
            }else{
                index++;
                if (index > arr.length-2) {
                    loop(dir)
                    index = 1
                    // index = arr.length-2;
                    // return
                }
            }
            arr.removeClass("active")
            clearTimeout(timeOut)
            timeOut = setTimeout(function () {
                //添加过度效果
                arr.css({
                    transition: "all 0.3s ease"
                })
                move();
                setTimeout(function () {
                    slideStart = false
                },300)
                // //去除过度效果
                // arr.css({
                //     transition: "none"
                // })
            },0)
        }
        touch.on(arr, "swipeleft", function (e) {
            slide("left");
        });
        touch.on(arr, "swiperight", function (e) {
            slide("right");
        });
    }
    swiper()
    /**
     * 轮播图
     */
    // var swiper = new Swiper('.swiper-container',{
    //     autoplay: false,
    //     speed: 1000,
    //     autoplayDisableOnInteraction: false,
    //     loop: true,
    //     centeredSlides: true,
    //     slidesPerView: 2,
    //     pagination: '.swiper-pagination',
    //     paginationClickable: true,
    //     prevButton: '.swiper-button-prev',
    //     nextButton: '.swiper-button-next',
    //     onInit: function(swiper) {
    //         swiper.slides[2].className = "swiper-slide swiper-slide-active";
    //     },
    //     breakpoints: {
    //         668: {
    //             slidesPerView: 1,
    //         }
    //     }
    // });

});


