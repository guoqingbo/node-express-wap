$(function () {
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
    var bannerSwiper = new Swiper('#banner_swiper', {
        loop: true,
        //autoplay: 4000,
        pagination: '.swiper-pagination',
        paginationClickable: true,
    });
    /**
     * 计算精品特卖宽度
     */
    function ulWidth() {
        var liEle = $(".fine-sale-intro li");
        var liWidth = liEle.width()+10;
        console.log(liWidth)
        $(".fine-sale-intro ul").width(liWidth*liEle.length)
    }
    ulWidth();

    /**
     *顶部公告 轮播
     */
    var addSwiper = new Swiper('#shuffling_ann', {
        direction: 'vertical',
        loop: true,
        autoplay: 4000
    });
    /**
     * 广告位轮播
     * @type {*|t}
     */
    var produBox = new Swiper('#produ-box', {
        // slidesPerView: 2.2,
        // paginationClickable: true,
        // spaceBetween: 10,
        // freeMode: true,
        loop: true,
        autoplay: 3000
    });

    //选项卡
    function setRecomentMoreUrl (tabSelet) {
        var tab = tabSelet.text();
        var url = "";
        switch (tab) {
            case "门票":
                url = "/list/ticket";
                break;
            case "酒店":
                url = "/list/hotel";
                break;
            case "美食":
                url = "/list/repast";
                break;
            case "特产":
                url = "/list/shop";
                break;

        }
        $(".recoment-more").attr("href",url)
    }
    var signLi = $('.prod-recoment-tab li>span');
    var signSwiper = new Swiper('.swiper-container3', {
        autoHeight: true,
        onSlideChangeStart: function(Swiper){
            var thisnum=signSwiper.activeIndex;
            signLi.removeClass('on');
            signLi.eq(thisnum).addClass('on');
            setRecomentMoreUrl (signLi.eq(thisnum));
        }
    });
    touch.on(signLi,'click', function (e) {
        e.preventDefault();
        if(!$(this).hasClass("on")){
            $(".prod-recoment-tab .on").removeClass('on');
            $(this).addClass('on');
            signSwiper.slideTo($(this).parent().index());
        }
    });
    // $("#sign_swiper .sign-img-list").css("height","auto");

    //日期倒计时 格式2018-09-10 10:00:00
    function timeCountNow() {
        var time = $(".count-time").attr("endTime");
        console.log(time)
        function timeCount(time) {
            var timeArr = time.split(" ")[0].split("-").concat(time.split(" ")[1].split(":"));
            var now = new Date(),
                end = new Date(timeArr[0],timeArr[1],timeArr[2],timeArr[3],timeArr[4],timeArr[5]),
                left = end.getTime() - now.getTime(),
                day = checkTime(parseInt(left/1000/60/60/24,10)),
                hour = checkTime(parseInt(left/1000/60/60%24,10)),
                mimute = checkTime(parseInt(left/1000/60%60,10)),
                second = checkTime(parseInt(left/1000%60,10)),
                html = "<span>"+day+"</span><span>天</span><span>"+hour+"</span><span>:</span><span>"+mimute+"</span><span>:</span><span>"+second+"</span>";
            $(".count-time").html(html)
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
            timeCount(time)
        },1000)
    }
    timeCountNow()
});

