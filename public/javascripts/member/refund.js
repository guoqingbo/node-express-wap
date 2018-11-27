$(function (){
    var validator = $('#form').validate({
        rules: {
            reason: {
                required:true,
                isCode:true,
                minlength: 4,
                maxlength:200
            }
        }
    });

    // 提交参数
    $('a.btn').on('click',function (){
        postForm($(this))
    });

    function postForm(that){
        if (validator.form()){
            that.addClass('background-gray').off('click');
            var data = $('#form').serialize();
            $.post('/member/refund/' + module, data)
                .success(function (data){
                    var datas = data[0];
                    var _txt = data[0].message || '提交成功';
                    $('.tips p').text(_txt);
                    $('.mask,.tips').show();
                })
                .error(function (err){
                    that.removeClass('background-gray').on('click',postForm);
                    window.location.href = '/error';
                });
        }
    }

    $('.tips a').on('click',function (){
		window.location.href = '/member/order/' + orderNo;
	});

    /**
     * 初始化数量加减
     */
    var refundNum = $('.refundNum');
    var module = refundNum.data('module');
    refundNum.each(function () {
        var min = $(this).data('min');
        var max = $(this).data('max');
        refundNum.numSpinner({
            min: min,
            max: max,
            onChange: function (evl, num) {
                var price = +$('#refundPrice').data('price');
                var totalPrice = +num * price;
                $('#refundPrice').text(totalPrice)
                if(module === "combo"){
                    refundNum.val(num)
                }
            }
        });
    });

});
