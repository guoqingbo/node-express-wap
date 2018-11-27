$(function (){
    var validator = $('#form').validate({
        rules: {
            content: {
                required:true,
                isCode:true,
                minlength: 4,
                maxlength:200
            }
        }
    });

    // 发布评论
    $('#sub').on('click',function (){
        if (validator.form()){
            var num = $('.pfxtFen').find('.icon-star-full').length;
            var isAnonymous = $('input[name=isAnonymous]').is(':checked') ? 0 : 1;
            $.post('/member/comment',{
                orderNo:orderNo,
                modelCode:modelCode,
                businessType:module,
                content: $('textarea[name=content]').val(),
                score:num,
                isAnonymous:isAnonymous
            }).success(function (data){
                var datas = data[0];
                $('#sub').addClass('blue').unbind('click');
                $('.tips p').text(datas.message);
                $('.mask,.tips').show();
            })
            .error(function (err){
                window.location.href = '/error';
            });
        }
    });

    $(".pfxtFen i").click(function(){
        var index = $(this).index()+1;
        $(this).addClass("icon-star-full");
        $(this).prevAll().addClass("icon-star-full");
        $(this).nextAll().removeClass("icon-star-full");
    });

    $('.tips a').on('click',function (){
		window.location.href = '/member/order/' + orderNo;
	});
});