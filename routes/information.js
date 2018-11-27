exports.mainRouter = function (router, common) {
    //资讯列表
    router.get('/information/informationList',function (req,res,next){
        common.commonRequest({
            url: [{
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:'info'
                }
            }],
            page:"information/informationList",
            req: req,
            res: res,
            callBack: function (results, reObj) {
                var informationDetail = {}
                if(results[0].data.information.length){
                    results[0].data.information.forEach(function (item) {
                        informationDetail[item.baseCode] = item
                    })
                    req.session.informationDetail = informationDetail;
                }
            }
        });
    });
    //资讯详情
    router.get('/information/informationDetail/:baseCode',function (req,res,next){
        var baseCode = req.params.baseCode
        var data = req.session.informationDetail[baseCode];
        res.render("information/informationDetail",{data:data})
    });
}
