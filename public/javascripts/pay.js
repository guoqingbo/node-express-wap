$(function(){
    var paymold=$("#pay-mold").find("a");
    touch.on(".toogleli","tap",function(){
        $(this).parents('.order-list').prev('.orderDetails').slideToggle();
        $(this).find("a").toggleClass("arrow-down");
        $(this).parent().toggleClass("arrow-down");
    });

    // 阻止多次点击去支付
    $('#toPayBtn').click(function (e) {
        e.preventDefault();
        var payUrl = $(this).attr('href');
        var flag = $(this).data('flag');
        if(!flag){
            $(this).data('flag', true);
            window.location = payUrl;
        }
    });

    // touch.on(paymold,'tap',function(event){
    //     paymold.find(".icon-iconfont-gougou").removeClass("c-base");
    //     $(this).find(".icon-iconfont-gougou").addClass("c-base");
    //     $(this).addClass("c-base");
    // });
});