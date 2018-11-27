(function($) {
	 $.fn.extend({
	numSpinner: function(options) {
            var defaults = {
                increment: 1,
                min: null,
                max: null,
                onChange: function(evl,value) {}
            }
            var opts = $.extend(defaults, options);
            return this.each(function() {
                var $this = $(this);
                var contentBox = $("<div>", {
                    "class": "numSpinnerBox"
                });
                var arrowup = $("<a>", {
                    "class": "sub",
                    "href": "javascript:void(0);"
                }).html("<i></i>");
                var arrowdown = $("<a>", {
                    "class": "add",
                    "href": "javascript:void(0);"
                }).html("<i></i>");
                if(!$this.parent().hasClass("numSpinnerBox")){
                        $this.after(contentBox);
                        contentBox.append($this);
                        $this.before(arrowup).after(arrowdown);
                    };

                $this.val($this.val() || 0);
                arrowup.click(function() {
                    var num=0,optnum=$this.val()-opts.increment;
                        if(opts.min!=null){
                            num=optnum<opts.min?opts.min:optnum;
                        }else{
                            num=optnum;
                        }
                        $this.val(num);
                        $(".numSpinnerBox").find("a").removeClass("c-f60");
                        $(this).addClass("c-f60");
                        opts.onChange($this,$this.val());
                });
                arrowdown.click(function() {
                   var num=0,optnum=parseInt($this.val())+opts.increment;
                        if(opts.max!=null){
                            num=optnum>opts.max?opts.max:optnum;
                        }
                        else{
                            num=optnum;
                        }
                        $this.val(num);
                        $(".numSpinnerBox").find("a").removeClass("c-f60");
                        $(this).addClass("c-f60");
                        opts.onChange($this,$this.val());
                });
                $this.bind('keyup',function(){
                    var val=$(this).val().replace(/[^\d]/g,'')||1;
                    if(opts.min!=null){
                        val=parseFloat(val)<parseFloat(opts.min)?opts.min:val;
                    }
                    if(opts.max!=null){
                        val=parseFloat(val)>parseFloat(opts.max)?opts.max:val;
                    }
                    $(this).val(val);
                }).blur(function(){
                    opts.onChange($this,$this.val());
                });
            });
        }
	 });
})(jQuery)
