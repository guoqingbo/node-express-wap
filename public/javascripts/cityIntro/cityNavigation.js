$(function () {
    var utils={
        addRecord :function (val) {
            console.log(val)
            var recentSearch = utils.getRecord();
            console.log(recentSearch)
            recentSearch.push(val);
            if (recentSearch.length>10){
                recentSearch.shift()
            }
            localStorage.setItem("recentSearch", JSON.stringify(recentSearch));
        },
        getRecord:function () {
            var data = JSON.parse(localStorage.getItem("recentSearch")) || [];
            return data
        },
        initSearchLatelyHtml:function () {
            var recentSearch = utils.getRecord().reverse();
            var html = "";
            for(var i=0;i<recentSearch.length;i++){
                html+='<li class="search-lable-item">'+recentSearch[i]+'</li>'
            }
           return html
        }
    }
    //搜索按钮点击
    $(".js-search").click(function (e) {
        e.stopPropagation()
        var keyWord = $(".search-input").val();
        utils.addRecord(keyWord)
        // window.location.href = "/cityIntro/cityIntroDetail"
    })
    //标签点击
    $(".search-lable-box").on("click", ".search-lable-item",function (e) {
        var keyWord = $(this).text();
        // window.location.href = "/cityIntro/cityIntroDetail"
    })
    //最近搜索
    var html = utils.initSearchLatelyHtml()
    $(".search-lately .search-lable-list").html(html)
})
