$(function () {
    var $CP = {
        couponsListLayer: $('#couponListLayer'),
        goLogin: $('#goLogin'),
        mask: $('#mask'),
        couponList: $('#couponList'),
        couponInfo: $('#couponInfo'),
        choiceCoupons: $('#choiceCoupons'),
        couponHandlePrice: $('.couponHandlePrice'),
        inputCouponCode: $('input[name=couponCode]'),
        inputCouponCheckCode: $('input[name=couponCheckCode]')
    };
    //初始化的时候获取订单总价

    var listAbelCoupons = []; //缓存优惠券列表信息;

    /**
     * 关闭优惠券列表
     */
    touch.on('#layer_close', 'tap', function () {
        $CP.couponsListLayer.removeClass('show');
    });

    /**
     * 展示可选优惠券列表
     */

    touch.on($CP.choiceCoupons, 'tap', function () {
        var _price=$('#totalprice').text();
        console.log(_price);
        var _this = $(this);
        $.get('/coupon/useAble', {
            productType: module,
            productCode: $CP.choiceCoupons.data('code') || ''
        })
            .success(function (data) {
                var datas = data[0];
                console.log(datas);
                switch (datas.status) {
                    case 400:
                        $CP.goLogin.show();
                        $CP.mask.show();
                        break;
                    case 200:
                        listAbelCoupons = datas.data;
                        var html = appendCoupons(listAbelCoupons,_price)
                        $CP.couponList.html(html);
                        bindCouponsTap();
                        $CP.couponsListLayer.addClass('show');
                    default:
                        break;
                }
            })
            .error(function () {
                $('.tips p').text('哎呀！出错了');
                $('.mask,.tips').show();
            })
    })


    /**
     * 领取优惠劵
     */
    touch.on('#getCouponBtn', 'tap', function () {
        var _this = $(this);
        var couponCode = _this.data('code');
        $.get('/coupon/get', {
            couponCode: couponCode
        })
            .success(function (data) {
                console.log(data);
                var datas = data[0];
                if (datas.status === 200) {
                    window.location.href = '/coupon/get/result?couponCode=' + couponCode;
                } else if (datas.status === 400) {
                    window.location.href = '/login?redir=coupon/detail?couponCode=' + couponCode;
                } else {
                    $('.tips p').text(datas.message);
                    $('.mask,.tips').show();
                }
            })
            .error(function (err) {
                window.location.href = '/error';
            });
    })

    touch.on('#cancleLayer', 'tap', function () {
        $CP.goLogin.hide();
        $CP.mask.hide();
    })

    /**
     * 绑定可用优惠券点击事件
     */
    function bindCouponsTap() {
        var $List = $CP.couponList.find('li.cp-yes');
        $List.on('tap', function () {
            var _this = $(this);
            var len = parseInt(_this.data('index'));
            var currentCouponInfo = listAbelCoupons[len];
            var couponLimit = currentCouponInfo.fullcat
                ? '满' + currentCouponInfo.fullcat + '元可用'
                : '任意金额可用'

            $CP.couponInfo.text(couponLimit);
            $CP.couponsListLayer.removeClass('show');
            $CP.choiceCoupons.find('span').text(currentCouponInfo.couponName);

            //页面上存储优惠券信息
            $CP.couponInfo.data({
                F:currentCouponInfo.fullcat,
                T:currentCouponInfo.couponType,
                V:currentCouponInfo.couponValue
            })

            $CP.inputCouponCode.val(currentCouponInfo.couponCode); //优惠券码
            $CP.inputCouponCheckCode.val(currentCouponInfo.verifyCode); //优惠券核销码

            var handlePrice = '';

            //处理价格显示
            var num = parseInt($('input[name=amount]').val());
            var totalPrice = totalprice(num);

            //显示处理详情
            currentCouponInfo.couponType === '0'
                ? handlePrice = '- ' + currentCouponInfo.couponValue + ' ='
                : handlePrice = '* ' + (currentCouponInfo.couponValue/10) + ' ='
            totalPrice
                ? $CP.couponHandlePrice.text(handlePrice)
                : $CP.couponHandlePrice.text('');
        })
    }
});

/**
 * 优惠券类型
 * @param {*类型} status
 */
function productFlag(status) {
    switch (parseInt(status)) {
        case 0:
            return '通用';
            break;
        case 1:
            return '指定产品类别';
            break;
        case 2:
            return '指定产品';
            break;
        default:
            break;
    }
}

/**
 * 可以使用的优惠券列表
 * @param {*优惠券列表数据} list
 */
function appendCoupons(list,_price) {

    var len = list.length, isyes,copuClass, dom = '';

    //没有数据返回提示信息
    if (!len) {
        dom = '<div class="no-data n-nbm"><i class="font-icon icon-iconfont-gantanhaom"></i><p>暂无信息</p></div>';
        return dom;
    }

    list.reverse();
    var cpyeshtml = '';
    var nohtml = '';
    function getCouponsHtml() {
        var dom = '<li data-index=' + len + ' class='+ isyes+'>'
            + '<span class='+copuClass+'>';
        //优惠劵类型
        if (list[len].couponType === '0') {
            dom += '<em class="coupons_price clearfix">'
                + '<i class="rmb">￥</i>'
                + '<span class="price">' + list[len].couponValue + '</span></em>'

        }
        else if (list[len].couponType === '1') {
            dom += '<em class="coupons_price clearfix">'
                + '<span class="price">' + (list[len].couponValue) + '</span>'
                + '<i class="rmb">折</i></em>'

        }
        dom += '<em class="coupons_title clearfix">'
            + '<p class="text" >' + list[len].couponName + '</p>'
            + '<p class="coupons_condition">'
            + (list[len].fullcat ? ('满' + list[len].fullcat + '元可用') : '任意金额可用')
            + '</p>'
            + '</em>'
            + '<i class="coupons_line_dots"></i></span>'
            + '<div class="coupons_user_limit">';

        //使用时限标识
        dom += '<p>使用有效期：' + list[len].startTime.substring(0, 10) + ' 至 ' + list[len].endTime.substring(0, 10) + ' </p>';
        var _productFlag = '';
        switch (list[len].productFlag) {
            case '0':
                _productFlag = '通用';
                break;
            case '1':
                _productFlag = '指定产品类别('+list[len].productValue+')';
                break;
            // case '2':
            //     _productFlag = '指定产品('+list[len].productValue+')';
            case '2':
                _productFlag = '指定产品';
                break;
        }
        dom += '<p>使用范围：' + _productFlag + '</p></div></li>';
        return dom;
    }
    while (len--) {
        // href = '/coupon/detail?couponCode=' + list[len].couponCode;
         if(Number(list[len].fullcat)<=Number(_price)){
             isyes='cp-yes';
             copuClass='coupons_rmb'
             cpyeshtml+=getCouponsHtml();
         }else{
             isFlag='no';
             copuClass='coupons_rmbno'
             nohtml+=getCouponsHtml();
         }
    }
    return cpyeshtml + nohtml;
}
