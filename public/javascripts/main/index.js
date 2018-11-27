$(function () {
    // /**
    //  * 视频轮播
    //  */
    // $(".flipster").flipster({style: 'carousel', start: 0});

    //菜单折叠
    $(".taboc").click(function () {
        if($(".js-tab-nav").hasClass("qiehuan")){
            $(this).find(".zhankai").show()
            $(this).find(".shouqi").hide()
            $(".js-tab-nav").removeClass("qiehuan");
        }else {
            $(this).find(".zhankai").hide()
            $(this).find(".shouqi").show()
            $(".js-tab-nav").addClass("qiehuan");
        }
    })
    /**
     * 选择搜索类型
     */
    touch.on($('.selected-show'),'click', function (e) {
        e.stopPropagation();
        console.log(123)
        $('.select-ul').toggle()
    })
    touch.on($('.select-ul>li'),'click', function (e) {
        e.stopPropagation();
        var selectName = $(this).text();
        console.log($(this).text())
        $(".seleted-name").text(selectName)
        $('.select-ul').toggle()
    })
    /**
     * 点击搜索门票
     */
    touch.on($('#searchBtn'),'tap', function (e) {
        e.stopPropagation();
        var searchType = $(".seleted-name").text();
        var searchName =  $(".search-btn").val();
        var redirectUrl = '/list/ticket?searchName='+searchName;
        console.log(searchType)
        switch (searchType) {
            case "门票":
                redirectUrl = '/list/ticket?searchName='+searchName;
                break;
            case "酒店":
                redirectUrl = '/list/hotel?searchName='+searchName;
                break;
            case "餐饮":
                redirectUrl = '/list/repast?searchName='+searchName;
                break;
            case "商品":
                redirectUrl = '/list/shop?searchName='+searchName;
                break;
            case "自由行":
                redirectUrl = '/list/combo?searchName='+searchName;
                break;
            case "跟团游":
                redirectUrl = '/list/route?searchName='+searchName;
                break;
            case "交通":
                redirectUrl = '/list/car?searchName='+searchName;
                break;
            // case "乡村游":
            //     redirectUrl = '/list/xcy?searchName='+searchName;
            //     break;
            default:
                throw error;
        }

        window.location.href = redirectUrl;
    })

    /**
     * banner
     */

     new Swiper('#swiperHeader', {
        loop: true,
        autoplay: 4000,
        pagination: '.swiper-pagination',
        paginationClickable: true,
    });

    /**
     *顶部公告 轮播
     */
    var addSwiper = new Swiper('#js-top-announcement', {
        direction: 'vertical',
        loop: true,
        autoplay: 4000
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
    getLiveVideoInfo($(".Cooldog_content video"))
    /**
     * 热门视频
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
});


