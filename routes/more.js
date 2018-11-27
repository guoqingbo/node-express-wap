exports.mainRouter = function (router, common) {
    router.get('/more/:module', function (req, res, next) {
        var module = req.params.module;
        var data = ""
        switch (module) {
            case "hotVideo":
                data = req.session.hotVideo
                break;
            case "goodTravel":
                data = req.session.goodTravel
                break;
        }
        res.render('more/'+module,{data:data})
    });
    router.get('/more/:module/:baseCode', function (req, res, next) {
        var baseCode = req.params.baseCode;
        var module = req.params.module;
        var data = "";
        switch (module) {
            case "goodTravel":
                var dataArr = req.session.goodTravel
                for (var i=0;i<dataArr.length;i++){
                    if(dataArr[i].baseCode === baseCode){
                        data = dataArr[i].detail
                    }
                }
                break;
        }
        res.render('common/detail/content',{data:data})
    });
};
