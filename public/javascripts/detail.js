$(function () {
    $('.mask').click(function () {
        $('#mask').hide();
        $('.wxShare').hide();
    })
    // 分享
    $("#socialShare").socialShare({
    	content: '',
    	url:'',
    	titile:''
    });
    $("#shareQQ").on("click",function(){
    	$(this).socialShare("tQQ");
    });
    /**
     * 详情页banner
     */
    var detailSwiper = new Swiper('#home_swiper', {
        loop: true,
        autoplay:4000,
        pagination: '.swiper-pagination',
        autoplayDisableOnInteraction : false
    });

    var initDom = function (date) {
        var beginDate = date[0],
            numDays = date.length - 1,
            endDate = date[numDays];
        $.get('/detail/roomItems', {
                goodsCode: goodsCode,
                beginDate: beginDate,
                endDate: endDate,
                numDays: numDays
            })
            .success(function (data) {
                var datas = data[0];

                if (datas.status === 200) {
                    $('.details-list').empty().append(listDom(datas.data, beginDate, endDate));
                    $('#hotelCalendar span:eq(0)').html(beginDate);
                    $('#hotelCalendar span:eq(1)').html(endDate);
                    $('#hotelCalendar em').html(numDays);

                    $(".price-code-btn").click(function () {
                        $(this).toggleClass("down").parent().parent().nextAll().each(function () {
                            if (!$(this).hasClass("price-code")) {
                                return false;
                            }
                            $(this).toggle();
                        });
                    });

                    showDetail()

                } else {
                    window.location.href = '/error';
                }
                history.go(-1)
            })
            .error(function (err) {
                window.location.href = '/error';
            })
    };

    $("#calendar").calendar({
        multipleMonth: 4,
        multipleSelect: true,
        click: function (dates) {
            initDom(dates);
        }
    });

    $('#hotelCalendar').on('click', function () {
        $("#calendar").addClass('show');
        var state = {
            page: 'calendar'
        };
        history.pushState(state,  document.title + '日期选择', location.href);
    });

    var nowDate = new Date(),
        nextDate = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000),
        nowText = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate(),
        nextText = nextDate.getFullYear() + '-' + (nextDate.getMonth() + 1) + '-' + nextDate.getDate();
    // var beginD = beginDate ? beginDate : nowText,
    //     endD = endDate ? endDate : nextText;
    if ($('#hotelCalendar').length) {
        var state = {
            page: 'calendar'
        };
        history.pushState(state,  document.title + '日期选择', location.href);
        initDom([nowText, nextText]);
    }

    if($('.showDetail').length){
        showDetail()
    }
    //语音暂停播放
    if ($('.audio-icon').length > 0) {
        $('.audio-icon').click(function () {
            // $('#audio_play')[0].volume = 0.5;
            if ($(this).hasClass('play')) {
                $('#audio_play')[0].pause();
                $(this).removeClass('play');
            } else {
                $('#audio_play')[0].play();
                $(this).addClass('play');
            }
        });
    }
    //获取附近景点
    if ($(".js-nearby").length > 0){
        function getNearby() {
            var latlngStr = $(".go-map").data("latlng")
            console.log(latlng)
            if(!latlng){
                return
            }
            var latlng = latlngStr.split(",");
            $.ajax({
                type: 'POST',
                url: "/list/getInfoByType",
                data: {
                    Latitude: latlng[0],
                    longitude: latlng[1],
                    type: "park",
                    pageSize: 5,
                    currPage: 1,
                },
                dataType: 'json',
                success: function (data) {
                    if(data[0].data.rows && data[0].data.rows.length > 0 ){
                        var rows = data[0].data.rows
                        var dom = '';
                        var len = rows.length;
                        var img = ""
                        for(var i = 0; i<len; i++){
                            if(rows[i].linkMobileImg){
                                img = rows[i].linkMobileImg
                            }else{
                                img = "/images/demo/zyx-list-img1.jpg"
                            }
                            dom += "<li>" +
                                "<img src='"+img+"' alt='图片'/>"+
                                "<p>"+rows[i].name+"</p>"+
                                "</li>"
                        }
                        $(".js-nearby").html(dom)
                    }else{
                        $(".js-nearby").html("<li class='nothingData'>暂无数据!</li>")
                    }
                },
                error: function (data) {
                    console.log(data)
                }
            });
        }
        getNearby();
    }
});

function listDom(list, begin, end) {
    var dom = '',
        len = list.length;

    list.reverse();
    while (len--) {
        var _url = list[len].enabled ? 'href="/order/hotel/' + list[len].rateCode + '?beginDate=' + begin + '&endDate=' + end + '"' : 'class="gray_btn"';
        var ratecode = list[len].ratecodes, ratelength = ratecode.length;
        var handle = '<a ' + _url + '>预订</a>';
        if (ratelength > 0) {
            handle = '<a href="javascript:;" class="price-code-btn down"><i class="font-icon icon-iconfont-jiantou"></i></a>';
        }
        var imgurl = list[len].linkMobileImg || "#";
        dom += '<li>' +
            '<div class="pro-info">' +
            '<div class="pro-img">' +
            '<img src="' + imgurl + '" alt=""/>' +
            '</div>' +
            '<div class="hotel-info">' +
            '<h4 class="pro-info-title orient2">' + list[len].modelName + '</h4>' +
            '<p class="pro-info-explian"><span>' + bedType(list[len].bedType) + '</span><span>' + list[len].buildingArea + 'm²</span><span><i class="font-icon"></i><i class="font-icon"></i></span></p>' +
            '<p class="pro-info-explian"><a class="showDetail" href="javascript:;"'+ 'data-modelCode=' +list[len].modelCode +  ' data-module= "hotel" '+' class="c-base">房型介绍></a></p>' +
            '</div>' +
            '</div>' +
            '<div class="pro-price c-base">' +
            '<span class="price"><em>￥</em><strong>' + (+list[len].currPrice).toFixed(2) + '</strong></span>' +
            '<span class="original-price"><em>￥' + (+list[len].priceShow || 0).toFixed(2) + '</em></span>' +
            '</div>' +
            '<div class="pro-price">' + handle +
            '</div>' +
            '<div class="ticket-layer">'+
            '<a href="javascript:;" class="close-ticket font-icon icon-iconfont-32pxchaxian"></a>'+
            '<h3 class="notice-tit">' + list[len].modelName + '</h3>'+'<div class="ht-pic"></div>'+
            '<div class="article-info bgf">'+
            '<div class="article-main">' +
            '<ul class="order-list myorder-list">'+
            '<li><label for="" class="lab-title">床型</label><div class="order-item">' + bedType(list[len].bedType) + '</div></li>'+
            '<li> <label for="" class="lab-title">建筑面积</label> <div class="order-item"> <span>' + list[len].buildingArea + '㎡</span> </div> </li>'+
            '<li> <label for="" class="lab-title">房型描述</label><div class="order-item">'+list[len].modelDetail+'</div> </li>'+
            '</ul>'+
            '</div></div>'+
            '<div class="room-handle">'+
            '<p>价格<span class="price"><em>￥</em><strong>' + (+list[len].currPrice).toFixed(2) + '</strong></span> </p>'+
            '</div></div>'+
            '</li>';
        if (ratelength > 0) {
            $.each(ratecode, function (i) {
                dom += '<li class="price-code" style="display: none">' +
                    '<h4>' + ratecode[i].aliasName + '</h4>' +
                    '<div class="pro-price c-base">' +
                    '<span class="price"><em>￥</em><strong>' + ratecode[i].currentPrice + '</strong></span>' +
                    '<span class="original-price"><em>￥' + ratecode[i].priceShow + '</em></span>' +
                    '</div>' +
                    '<div class="pro-price">' +
                    '<a href="/order/hotel/' + ratecode[i].rateCode + '?beginDate=' + begin + '&endDate=' + end + '">预订</a>' +
                    '</div>';
            });
        }
    }
    return dom;
}


function bedType(num) {
    var str = "";
    switch (num) {
        case '0':
            str = "大床";
            break;
        case '1':
            str = "双床";
            break;
        case '2':
            str = "三床";
            break;
    }
    return str;
}

/**
 * 查看详情
 */
function showDetail(){
    var _showDetail = $('.showDetail'),_mask = $('#mask'),_ticketLayer = $('.ticket-layer');
    var dom;
    _showDetail.unbind('click').click(function (e) {
        var _this = $(this),
            modelCode=$(this).data('modelcode');
            module= $(this).data('module')? $(this).data('module'):'';
        if(module=='hotel'){
            $.get('/detail/picture', {
                modelCode: modelCode,
                wayType:2
            }).success(function (data) {
                // dom='<div class="flexslider home_slider2">' +
                //     '<ul class="slides">'
                // for(var i=0;i<data[0].data.length;i++){
                //     dom+='<li><div class="slide"><img src="'+data[0].data[i].wapUrl+'" </div></li>'
                // }
                // dom+='</ul></div>'

                dom='<div class="swiper-container swiper-container-hotel">'+
                        '<div class="swiper-wrapper">'
                        for(var i=0;i<data[0].data.length;i++){
                            dom+='<div class="swiper-slide"><img src="'+data[0].data[i].wapUrl+'" ></div>'
                        }
                dom+= '</div></div>'
                // _this.parents('li').find('.ticket-layer').find('.ht-pic').append(dom);
                _this.parents('li').find('.ticket-layer').find('.ht-pic').html(dom);
                _this.parents('li').find('.ticket-layer').show(function () {
                    // _this.parents('li').find('.home_slider2').flexslider({
                    //     animation : 'slide',
                    //     controlNav : false,
                    //     directionNav : false,
                    //     animationLoop : true,
                    //     useCSS : false,
                    //     slideshow:true,
                    //     slideshowSpeed: 3000
                    // });
                    new Swiper('.swiper-container-hotel',{
                        loop: true,
                        autoplay:4000,
                        // pagination: '.swiper-pagination',
                        autoplayDisableOnInteraction : false
                    })
                });
                _mask.show();

            })
        }else{
            _this.parents('li').find('.ticket-layer').show();
            _mask.show();
        }
        e.stopPropagation();
    });

    _mask.unbind('click').click(function () {
        _ticketLayer.hide();
        $(this).hide();
    });

    $('.close-ticket').click(function () {
        _ticketLayer.hide();
        _mask.hide();
    })

}

