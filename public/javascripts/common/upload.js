//此文件未用到
;(function ($){
    // 默认参数
    var defaults = {
        uploadUrl:'/upload/filesList'
    };
    // 公共方法
    var methods = {
        init: function (options){
            var settings = $.extend({},defaults,options); // 扩展默认参数
            // 始终返回调用者提供链式调用
            return this.each(function (){
                var $this = $(this);
                //多张图片预览及上传
                $this.on("change",function () {
                    var preview = $this.sibling(".preview");
                    var files = $this.prop("files");
                    //图片预览
                    if (files) {
                        [].forEach.call(files,  methods.readAndPreview);
                    }
                    //图片上传
                    methods.sendFiles(files);
                });
            })
        },
        readAndPreview: function (file) {
            // 支持的图片类型（可自定义）
            if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
                var reader = new FileReader();
                reader.addEventListener("load", function () {
                    var image = new Image();
                    image.src = this.result;
                    preview.append(image);
                }, false);
                reader.readAsDataURL(file);
            }else{
                alert("请选择正确的图片格式")
            }

        },
        sendFiles:function sendFiles(files) {
            if (files.length == 0) {
                //没有选择文件直接返回
                return;
            }
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            $.ajax({
                url: settings.uploadUrl,
                type: 'post',
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                dataType:"JSON",
                success: function (res) {
                    console.log(res)
                },
                error: function (e) {
                    console.log('upload faild');
                }
            });
        }
    }

    $.fn.upload = function (options){
       if (typeof options === 'object' || !options){
            // 如果参数是对象，就调用init
            return methods.init.apply(this,arguments);
        }else if (methods[options]){
           return methods[options].apply(this,Array.prototype.slice.call(arguments,1))
       }else{
            // 其他情况，抛出错误
            $.error('Method '+options+' does not exist on jQuery.upload');
        }
    };

})(window.jQuery);
