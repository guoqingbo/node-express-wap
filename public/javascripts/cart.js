$(function () {
    totalPrice();
    $(".shop-box a").on("touchstart", function () {
        $(this).toggleClass("on");
        totalPrice()
    });
    $(".check-all").on("touchstart", function () {
        if ($(".check-all").hasClass("on")) {
            $(".shop-box a").removeClass("on");
            $(this).removeClass("on");
        } else {
            $(".shop-box a").addClass("on");
            $(this).addClass("on");
        }
        totalPrice()
    });

    // 删除订单
    $(".cart-del").click(function(){
        $(".mask").show();
        $(this).siblings(".cancel-ok").show();
    });
    $(".close").click(function(){
        $(".mask").hide();
        $(this).parents(".cancel-ok").hide();
    });
    $('.confirm').click(function () {
        var pro=$(this).parents('.shop-box');
        $(".mask").hide();
        var item_li = $(this).parent().parent().parent();
        var item_id = item_li.data('id');
        var del_url = '/cart/itemdel/'+item_id;
        $.get(del_url, {}, function (result) {
            if (result[0].flag === 'success'){
                item_li.next('.page-line').remove();
                item_li.remove();
                totalPrice()
            }
        })
    });

    // 批量删除
    // $('#del-all').click(function(){
    //     var itemIds = selectId().join(',');
    //     var del_url = '/cart/itemdel/'+itemIds;
    //     if(itemIds){
    //         $.get(del_url)
    //             .success(function (data){
    //                 $('.cart-block').html('');
    //                 totalPrice()
    //             })
    //             .error(function (err){
    //                 error();
    //             })
    //     }
    // });

    //提交购物车
    $("#cart-pay-btn").click(function(){
        var itemIds = selectId().join(',');
        if(itemIds){
            $.get('/cart/pay/'+itemIds)
                .success(function (result){
                    if (result[0].flag === 'success'){
                        var orderNos = '';
                        orderNos += result[0].orderNos +',';
                        window.location.href='/pay/cart/'+orderNos;
                    }else{
                        $('.tips p').text(result[0].msg);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err){
                    console.log(err);
                });
            // window.location.href='/cart/pay/'+itemIds;
        }else{
            $('.tips p').text("请选择订单！");
            $('.mask,.tips').show();
            $('.queding').click(function () {
                $('.mask,.tips').hide();
            });
        }
    });

    //订单默认选中
    // $('.shop-box').each(function(){
    //     var total_price = 0;
    //     var itemId = $(this).data('id');
    //     var price = parseFloat($(this).find('.price_num').val());
    //     if(itemId === parseFloat(selectedId)){
    //         $(this).find('.check').addClass('on');
    //         total_price = operation.accAdd(total_price,price);
    //         $('#totalprice').text(total_price)
    //     }
    // })
});

//- 计算购物车选择总价
function totalPrice(){
    var total_price = 0;
    $('.shop-box').each(function(){
        var check = $('.check',this).hasClass('on');
        var price = parseFloat($(this).find('.price_num').val());
        if(check){
            total_price = operation.accAdd(total_price,price);
        }
    });
    $('#totalprice').text(total_price)
}
function selectId(){
    var itemIds = [];
    $('.shop-box').each(function(){
        var check = $('.check',this).hasClass('on');
        if(check){
            var itemId = $(this).data('id');
            itemIds.push(itemId);
        }
    });
    return itemIds
}