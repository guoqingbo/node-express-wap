$(function () {
    // 翻页
    var dropBox = $(".drop-box"),
        module = dropBox.data('module'),
        localUrl = location.pathname + window.location.search,
        beginDate = $('#beginDate a').text(),
        endDate = $('#endDate a').text(),
        pageSize = 6, // 每页数据条数
        filterObj = {};//过滤条件

        if(module === 'hotel'){
            filterObj = { currPage: 1, pageSize: pageSize, beginDate: beginDate, endDate: endDate };
        }
        else if(module === 'getInfoByType'){
            var latlng = window.location.search.split("=")[1].split(",")
            localUrl = window.location.pathname;
            console.log(localUrl)
            filterObj.Latitude = latlng[0]
            filterObj.longitude = latlng[1]
            filterObj.type = "park"
            filterObj.pageSize = pageSize;
            filterObj = {
                Latitude: latlng[0],
                longitude: latlng[1],
                type: "park",
                pageSize: pageSize,
                currPage: 1,
            }
        }
        else{
            filterObj = { currPage: 1, pageSize: pageSize }; // 定义一个对象用于存储筛选条件,默认筛选为翻页第一页
        }

    var dropload = dropBox.dropload({
        scrollArea: window,
        loadDownFn: filterFn
    });

    $(".tab-search-panel").each(function () {
        var height = $(this).outerHeight(true);
        $(this).css("top", -height + "px");
    });
    var touchobj = $("#searchtab").find("a"),
        tabpanel = $(".tab-search-panel dd"),
        tabIndex;
    touch.on(touchobj, 'tap', function () {
        if ($(this).hasClass("c-base")) {
            tabIndex = dialogclose(tabIndex);
        } else {
            dialogclose(tabIndex);
            tabIndex = $(this).parent().index();
            $(this).addClass("c-base");
            var li = $(".tab-search-panel").eq(tabIndex).find('dd');
            var div_inner_h = li.outerHeight(true) * li.length;
            var search_tab_h = $("#searchtab").outerHeight(true) || 0;
            var search_bar_h = $("#searchBar").height() || 0;
            var foot_h = $(".footer-box").outerHeight(true) || 0;
            var hotel_filter_h = $(".hotel-filter").outerHeight(true) || 0;
            var defualt_h = $(window).height() - search_tab_h - search_bar_h - foot_h;
            var div_h = div_inner_h > defualt_h ? defualt_h : "auto";
            if (dodiv()) {
                setTimeout(function () {
                    $(".tab-search-panel").eq(tabIndex).stop().animate({
                        top: search_tab_h + search_bar_h + hotel_filter_h,
                        height: div_h
                    }, 300);
                }, 300);
            } else {
                $(".tab-search-panel").eq(tabIndex).stop().animate({
                    top: search_tab_h + search_bar_h + hotel_filter_h,
                    height: div_h
                }, 300);
            }
            $("#mask").fadeIn();
        }
    });
    //蒙层
    touch.on("#mask", "tap", function () {
        tabIndex = dialogclose(tabIndex);
    });

    // 过滤
    touch.on(tabpanel, 'tap', function (ev) {
        var _dt = $(this).siblings('dt');
        var _ft = _dt.length ? _dt.data('filter') : 'sortKey';
        var _t = ev.target.nodeName === 'I' ? $(this).parents('dd') : this;
        $(_t).addClass("c-base").siblings('dd').attr("class", '');
        var this_txt = $(_t).text();

        // if (tabIndex === 0 && module !== 'order') {
        console.log($(this).parents(".filterTab"))
        if ($(this).parents(".filterTab").length) {
            //选择标签
            var labels = '';
            tabpanel.each(function () {
                if ($(this).hasClass('c-base')) {
                    var filter = $(this).data('labelid');
                    if (filter && filter !== '') {
                        labels += filter + ',';
                    }
                }
            });
            filterObj.labelId = labels.substr(0, labels.length - 1);
        } else {
            //排序
            initParam();
            var filterName = $(_t).data('filter');
            // sortKey 拼接 asc || desc
            if(filterName){
                filterObj[_ft] = descOrAsc(filterName, $(_t));
            }else{
                delete filterObj[_ft]
            }
            unLockDropload();
            filterFn(dropload, 1);
            $("#searchtab").find("li").eq(tabIndex).find("a").text(filterName === '' ? '默认排序' : this_txt);
            tabIndex = dialogclose(tabIndex);
        }
        ev.preventDefault();
    });

    // 全部区域确定操作
    touch.on(".filter-handle a", "tap", function () {
        var text = '';
        initParam();
        unLockDropload();
        filterFn(dropload, 1);
        $(".tab-search-panel").eq(tabIndex).find('dd.c-base').filter(function (index, item) {
            if ($(item).data('filter') !== '') {
                return true;
            } else {
                return false;
            }
        }).map(function (index, item) {
            text += index > 0 ? ',' + $(item).text() : $(item).text();
        });
        $("#searchtab").find("li").eq(tabIndex).find("a").text(text === '' ? '全部筛选' : text);
        tabIndex = dialogclose(tabIndex);

    });

    // 关键字搜索
    touch.on("#searchBar .search-btn", "tap", function () {
        var value = $('#searchBar input').val();

        //  重置筛选条件
        initParam();

        filterObj.searchName = value;
        unLockDropload();
        filterFn(dropload, 1);
    });

    // 交通日期筛选
    if (module === 'traffic') {
        $("#calendar").calendar({
            multipleMonth: 4,
            click: function (dates) {
                $('.startDay a').html(dates[0]);
                history.go(-1)
                trafficInit();
            }
        });

        var showTime = $(".startDay").find("a");

        var curDay = getDay(showTime.text());

        $('.startDay a').on('click', function () {
            $("#calendar").addClass('show');
            var state = {
                page: 'calendar'
            };
            history.pushState(state,  document.title + '日期选择', location.href);
        });

        var prevDay = $('#prevDay');
        prevDay.click(function () {
            var date = showTime.text();
            var pDay = getDay(date) - 1;

            if (pDay == curDay) prevDay.hide();

            showTime.text(getDateStr(date, -1));
            trafficInit();
        });
        prevDay.hide();

        $("#nextDay").click(function () {
            var date = showTime.text();
            showTime.text(getDateStr(date, 1));
            trafficInit();
            prevDay.show();
        });
    }

    // 交通区间筛选
    $('.disAdress select').on('change', function () {
        trafficInit();
    });

    function trafficInit() {
        initParam();
        filterObj.begin = $('.disAdress select:eq(0)').val();
        filterObj.end = $('.disAdress select:eq(1)').val();
        filterObj.departDate = $('.startDay a').text();
        unLockDropload();
        filterFn(dropload, 1);
    }

    /**
     * 酒店选择时间区间刷新列表
     */
    if (module === 'hotel') {
        $("#calendar").calendar({
            multipleMonth: 4,
            multipleSelect: true,
            click: function (date) {
                var beginDate = date[0],
                    numDays = date.length - 1,
                    endDate = date[numDays];
                $('#beginDate a').html(beginDate);
                $('#endDate a').html(endDate);
                // $('#hotelCalendar em').html(numDays);
                hotelInit()
                history.go(-1)
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

        filterObj.beginDate = nowText;
        filterObj.endDate = nextText;
        $('#beginDate a').html(nowText);
        $('#endDate a').html(nextText);
    }
    function hotelInit() {
        initParam();
        filterObj.beginDate = $('#beginDate a').text();
        filterObj.endDate = $('#endDate a').text();
        unLockDropload();
        filterFn(dropload, 1);
    }
    if (module === 'hotel'){
        hotelInit()
    }
    function initParam() {
        localUrl = location.pathname;
        filterObj.currPage = 1;
    }

    // 筛选构造DOM
    function filterFn(dropload, startPage) {
        console.log(123456789)
        console.log(localUrl)
        console.log(filterObj)
        $.ajax({
            type: 'POST',
            url: localUrl,
            data: filterObj,
            dataType: 'json',
            success: function (data) {
                console.log(data)
                console.log(module)
                if (data !== 'error' && data[0].flag !== 'error') {
                    var results = module === 'commentList' ? data[0].data.list : data[0].data;
                    var html = ""
                    if (module === 'order' && data[0].status == 400){
                        window.location.href = '/login?redir=/list/order';
                    }
                    if(results.html){
                        html = results.html;
                    }else{
                        html = listDom(results.rows, module)
                    }
                    if (startPage) {
                        dropBox.find('ul').html(html);
                    } else {
                        dropBox.find('ul').append(html);
                    }
                    //filterObj.currPage = +(results.curPage) + 1;
                    filterObj.currPage += 1;

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
            error: function (xhr, type) {
                // 即使加载出错，也得重置
                dropload.resetload();
            }
        });
    }

    // unLockDropload();
    // filterFn(dropload, 1);
    /**
     * 解锁dropload
     */
    function unLockDropload() {
        //dropload.resetload();
        dropload.unlock();
        //dropload.noData(false);
        dropload.isData = true;

    }
});

// 列表DOM
function listDom(list, module) {
    console.log(list)
    var dom = '',
        len = list.length,
        imgClass;
    if (module === 'strategy'){
        imgClass='raiders-img';
    }else if(module === 'shop'|| module === 'guide'){
        imgClass='goods-list-img'
    }else{
        imgClass='page-list-img'
    }
    list.reverse();
    while (len--) {
        if (module === 'order') {
            if (list[len].orderType !== 'shop') {
                dom += '<div class="myorder-item">' +
                    '<div class="myorder-header">' +
                    getIcon(list[len].orderType) +
                    '</em>|<em class="unpay">' +payStatus(list[len].orderStatus,list[len].orderType,list[len].groupedStatus) + '</em></span>' +
                    '<span class="creatTime">下单日期：' + list[len].createTime + '</span>' +
                    '<span class="price fr"><em>￥</em>' + list[len].paySum + '</span>' +
                    '</div>' +
                    '<a href="/member/order/' + list[len].orderNo + '">' +
                    '<h3 class="myorder-item-title">' + list[len].orderInfo + '</h3>'+
                    '<p>订单号：' + list[len].orderNo + '</p>'+
                    '<p>' + orderStatusTxt(list[len].orderStatus) +
                    //'( ' + list[len].startTime.substring(0, 10) + ' 使用)
                    '</p>' +
                    '<p><i class="font-icon fr icon-iconfont-jiantou"></i>' + list[len].amount + '张</p>';
            }
            else {
                dom += '<div class="myorder-item">' +
                    '<div class="myorder-header">' +
                    getIcon(list[len].orderType) +
                    '</em>|<em class="unpay">' +(payStatus(list[len].orderStatus,list[len].orderType,list[len].groupedStatus))+ '</em></span>' +
                    '<span >下单日期：' + list[len].createTime.substring(0, 10) + '</span>' +
                    '<span class="price fr"><em>￥</em>' + list[len].paySum + '</span>' +
                    '</div>' +
                    '<a href="/member/order/' + list[len].orderNo + '">' +
                    '<h3 class="myorder-item-title">' + list[len].orderInfo + '</h3>'+'<p>' + (list[len].sendType === "0" ? '快递' : '自提') + '</p>'
                    + '<p>' + (list[len].linkAddr=='undefined'?'':list[len].linkAddr) + '</p>'
                    + '<p><i class="font-icon fr icon-iconfont-jiantou"></i>' + list[len].amount + '件</p>';
            }
            dom += '</a></div><div class="page-line"></div>';
        }
        else if(module === 'refund'){
            var refundTime=list[len].refundTime?list[len].refundTime.substring(0, 10):"";
            dom += '<div class="myorder-item">' +
                '<div class="myorder-header">' +
                getIcon(list[len].orderType) +
                '</em>|<em class="unpay">' + refundStatus(list[len].refundStatus) + '</em></span>' +
                '<span >退单时间：' + refundTime + '</span>' +
                '<span class="price fr"><em>￥</em>' + list[len].paySum + '</span>' +
                '</div>' +
                '<a href="/member/refundDetail/' + list[len].orderNo+'?refundNo='+list[len].refundNo + '">' +
                '<h3 class="myorder-item-title">' + list[len].orderInfo + '</h3>';
            if (list[len].orderType !== 'shop') {
                dom += '<p><i class="font-icon fr icon-iconfont-jiantou"></i>'+'退单数量：' + list[len].refundNum + '张</p>';
            }
            dom += '</a></div><div class="page-line"></div>';
        }
        else if (module === 'traffic') {
            var isAble = list[len].isAble !== '0' ? 'href="/order/traffic/' + list[len].id + '?begin=' + $('.startDay a').text() + '"' : 'class="order_gray"';
            dom += '<li>' +
                '<div class="trafficRight">' +
                '<p>￥' + list[len].salesPrice + '</p>' +
                '<a ' + isAble + '>预定</a>' +
                '</div>' +
                '<div class="trafficLeft">' +
                '<span>' + list[len].time + '</span>' +
                '<p><i></i>' + list[len].shiftType + '</p>' +
                '</div>' +
                '<div class="trafficCenter">' +
                '<p><i></i>' + list[len].startPlace + '</p>' +
                '<p><i></i>' + list[len].endPlace + '</p>' +
                '</div>' +
                '</li>';
        }
        else if (module === 'commentList') {
            var star = '', isShowName = '';
            for (var i = 0; i < list[len].score; i++) {
                star += '<i class="font-icon icon-iconfont-aixin"></i>'
            }
            for (var j = 0; j < (5 - list[len].score); j++) {
                star += '<i class="font-icon icon-iconfont-aixin not-light"></i>'
            }
            isShowName = '匿名评论';
            if (list[len].isAnonymous == '1' || list[len].isAnonymous == 'false') {
                var _name = list[len].leaguerName, _length = _name.length;
                if (_length > 2) {
                    _name = _name[0] + '***' + _name[_length - 1]
                } else {
                    _name = _name[0] + '***'
                }
                isShowName = _name;
            }

            dom += '<li><div class="comment-list-top">'
                + '<b>' + isShowName + '</b>'
                + '<span class="fr">' + star
                + '<em>' + list[len].score + '分</em></span></div>'
                + '<p class="comment-list-info">' + list[len].content + '</p>'
                + replayContent(list[len].replyContent)
                + '<div class="comment-date">' + list[len].createTime + '</div>'
                + '</li>'
        }
        else {
            var tag = '', _price = '';
            if (list[len].labels || module === 'guide') {
                var k = module === 'guide' ? 'language' : 'labelsName',
                    lens = 0;

                if (list[len][k]) {
                    var _labels = list[len][k].indexOf(',') !== -1 ? list[len][k].split(',') : new Array(list[len][k]);
                    lens = _labels.length > 3 ? 3 : _labels.length;
                    while (lens--) {
                        tag += '<span class="pro-flag c-base border-base">' + _labels[lens] + '</span>';
                    }
                }
                // list[len][k].split(",").reverse();
            }

            //url
            var url = '';
            switch (module) {
                case 'shop':
                    url = '/detail/shop/' + list[len].modelCode + '?rateCode=' + list[len].rateCode;
                    break;
                case 'guide':
                    url = '/detail/guide/' + list[len].modelCode + '?rateCode=' + list[len].rateCode;
                    break;
                case 'combo':
                    url = '/detail/combo/' + list[len].goodsCode + '?rateCode=' + list[len].rateCode;
                    break;
                case 'strategy':
                    url = '/detail/strategy/' + list[len].baseCode;
                    break;
                case 'car':
                    url = '/detail/car/' + list[len].modelCode+'?rateCode=' + list[len].rateCode;
                    break;
                case 'getInfoByType':
                    url = '/detail/ticket/' + list[len].goodsCode;
                    break;
                default:
                    url = '/detail/' + module + '/' + list[len].goodsCode;
                    break;
            }
            if(module === 'route'||module === 'car'){
                dom += '<li>' +
                    '<a class="clearfix" href="' + url + '">' +
                    '<div class="' + imgClass + '">' +
                    '<img src="' + (list[len].mobileImg || '/images/demo/zyx-list-img1.jpg') + '" alt="' +(list[len].name || "图片")+ '"/>' +
                    '</div>';
            }else if(module === 'integral'){
                dom += '<li class="opacity">';
            }
            else{
                dom += '<li>' +
                    '<a class="clearfix" href="' + url + '">' +
                    '<div class="' + imgClass + '">' +
                    '<img src="' + (module === 'strategy' ? (list[len].face_img || '/images/demo/zyx-details-img.jpg') : (list[len].linkMobileImg || '/images/demo/zyx-list-img1.jpg')) + '" alt="' +list[len].name+ '"/>' +
                    '</div>';
            }
            switch (module) {
                case 'getInfoByType':
                case 'ticket':
                case 'skiPark':
                    list[len].priceShow ? _price = '<span class="price fr"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong>起</span>' : _price = '';
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title">' +
                        '<div class="list-title-box">' + eN(list[len].aliasName) + '</div>' +
                        tag +
                        '</h3>' +
                        '<p class="page-list-article one">' + eN(list[len].anotherName) + '</p>' + _price +
                        '<p class="page-list-explian">' +
                        '<span><span class="c-base">' + (list[len].salesNum || 0) + '</span>人已购买</span>' +
                        (module === "skiPark" ? '<span class="price textR">￥<em class="c-base">'+list[len].price+'</em>起</span>': '')+
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'hotel':
                    list[len].priceShow ? _price = '<span class="price fr"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong>起</span>' : _price = '';
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].aliasName) + '</div>'
                        + tag + '</h3>' +
                        '<p class="page-list-article one"><i class="font-icon icon-location"></i>' + eN(list[len].addr) + '</p>' +
                        '<p class="page-list-explian">' + _price + '</p>' +
                        '</div></a></li>';
                    break;
                case 'repast':
                    list[len].price ? _price = '<span class="price fr"><em>￥</em><strong>' + (+list[len].price).toFixed(2) + '</strong>起</span>' : _price = '';
                    dom += '<div class="page-list-info">'
                        + '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].aliasName) + '</div></h3>'
                        + '<p class="page-list-article two">' + eN(list[len].addr) + '</p>'
                        + '<p class="page-list-explian">'
                        + tag
                        + _price
                        + '</p>'
                        + '</div>'
                    break;
                case 'strategy':
                    dom += '<div class="raiders-info">' +
                        '<h3>' + eN(list[len].name) + '</h3>' +
                        '<p class="jianjie">'+ list[len].jianjie +'</p>'+
                        '<p>' +
                        '<span>' +
                        '<i class="font-icon icon-clock"></i>' + list[len].createTime +
                        '</span>' +
                        '<span class="fr">' +
                        '<i class="font-icon icon-views"></i>' + list[len].viewNum +
                        '</span>' +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'car':
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].aliasName) + '</div></h3>' +
                        '<p class="page-list-article">' + eN(list[len].subtitle) + '</p>' +
                        '<p class="page-list-explian">' + tag +
                        '<span class="price fr"><em>￥</em><strong>' + (list[len].price  ? (+list[len].price ).toFixed(2) : '0.00') + '</strong>/天</span>' +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'shop':
                    var _price = list[len].currentPrice ? '<span class="price"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong></span>' : '';
                    dom += '<h3 class="goods-list-title"><div class="list-title-box">' + eN(list[len].aliasName) + '</div></h3>' +
                        '<p class="goods-list-article">' + eN(list[len].subtitle) + '</p>' +
                        '<p class="goods-list-explian">' +
                        _price +
                        '<span class="fr">月销量：' + (eN(list[len].salesNum) || 0) + '</span>' +
                        '</p></a></li>';
                    break;
                case 'guide':
                    var _price = list[len].priceShow ? '<span class="price"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong></span>' : '';
                    dom += '<h3 class="goods-list-title"><div class="list-title-box">' + eN(list[len].aliasName) + '</div></h3>' +
                        '<p class="goods-list-article">' + eN(list[len].subtitle) + '</p>' +
                        '<p class="goods-list-explian">' +
                        _price +
                        '<span class="fr">月销量：' + (eN(list[len].salesNum) || 0) + '</span>' +
                        '</p></a></li>';
                    break;
                case 'combo':
                    list[len].currentPrice ? _price = '<span class="price fr"><em>￥</em><strong>' + list[len].currentPrice + '</strong>起</span><span class="original-price fr"><em>￥</em><strong>' + list[len].priceShow + '</strong></span>' : _price = '';
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="combo-list-title">' + eN(list[len].aliasName) + '</idv></h3>' + tag +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + (list[len].salesNum || 0) + '</span>人出游' +
                        _price +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'route':
                    list[len].priceShow ? _price = '<span class="price fr"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong>起</span>' : _price = '';
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="combo-list-title">' + eN(list[len].aliasName) + '</idv></h3>' + tag +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + (list[len].salesNum || 0) + '</span>人购买' +
                        _price +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'amusement':
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].name) + '</div></h3>' +
                        '<p class="page-list-explian">' +
                        '<span class="pro-flag fr">月销量：' + (list[len].totalSales || 0) + '</span>' +
                        '<span class="price"><em>￥</em><strong>' + (+list[len].referencePirce).toFixed(2) + '</strong></span>' +
                        '</p>' +
                        '<p class="page-list-article">' + eN(list[len].subTitle) + '</p>' +
                        '</div>';
                    break;
                case 'order':
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].name) + '</div></h3>' +
                        '<p class="page-list-explian">' +
                        '<span class="pro-flag fr">月销量：' + list[len].totalSales + '</span>' +
                        '<span class="price"><em>￥</em><strong>' + list[len].salesPrice + '</strong></span>' +
                        '</p>' +
                        '<p class="page-list-article">' + eN(list[len].subTitle) + '</p>' +
                        '</div>';
                    break;
                case 'integral':
                    dom +='<div class="scored-left"><p>'+list[len].content+'</p>'+'<p>'+list[len].modifyTime+'</p></div>'+
                        '<div class="scored-info">' + '<h3>'+list[len].payout+'</h3><p>' +list[len].income+'</p>' +
                        '</div>'
                    break;


            }
        }
    }
    return dom;
}

// 空值处理
function eN(t) {
    return t ? t : '';
}

function dialogclose(tabIndex) {
    var height = $(".tab-search-panel").eq(tabIndex).outerHeight(true);
    $(".tab-search-panel").eq(tabIndex).stop().animate({
        top: -height + "px"
    }, 300);
    $("#mask").hide();
    $("#searchtab").find("a").removeClass("c-base");
    tabIndex = null;
    return tabIndex;
}

function dodiv() {
    var flag = false;
    $(".tab-search-panel").each(function () {
        var top = $(this).position().top;
        if (top > 0) {
            flag = true;
            return false;
        }
    });
    return flag;
}

function getDateStr(data, AddDayCount) {
    var dd = new Date(data);
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) > 9 ? (dd.getMonth() + 1) : "0" + (dd.getMonth() + 1); //获取当前月份的日期
    var d = dd.getDate() > 9 ? dd.getDate() : "0" + dd.getDate();
    return y + "-" + m + "-" + d;
}

function getDay(_date) {
    var dateArray = _date.split('-');
    var _day = parseInt(dateArray[2]);
    return _day;
}

function orderStatusTxt(orderStatusCode){
    var orderStatusTxt = '';
    switch (orderStatusCode) {
        case 1:
        case '1':
            orderStatusTxt = '未使用';
            break;
        case 2:
        case '2':
            orderStatusTxt = '已使用';
            break;
        case 6:
        case '6':
            orderStatusTxt = '订单完结';
            break;
        default:

    }
    return orderStatusTxt
}

function descOrAsc(name, dom){
    var filterArr = name.split('_');
    var filterName = filterArr[0];
    var domArrClassName = '';
    if(!dom.data('filterType')){
        name = filterArr[0];
        switch (name) {
            case 'avgScore':
                filterName += '_desc';
                domArrClassName = 'down';
                break;
            case 'price':
                filterName += '_asc';
                domArrClassName = 'up';
                break;
            case 'salesNum':
                filterName += '_desc';
                domArrClassName = 'down';
                break;
        }
    }else{
        filterName += dom.data('filterType') === 'desc' ? '_asc' : '_desc';
        domArrClassName = dom.data('filterType') === 'desc' ? 'up' : 'down';
    }
    dom.data('filterType', filterName.split('_')[1]).attr('class', 'c-base ' + domArrClassName);
    return filterName;
}

function replayContent (ctx){
    var html = '';
    if(ctx){
        html += '<p class="replayContent">' + ctx + '</p>'
    }
    return html
}
