exports.mainRouter = function (router, common) {
    //城市定位搜索
    router.get('/cityIntro/cityNavigation',function (req,res,next){
        res.render("cityIntro/cityNavigation",{})
    });
    //城市详情
    router.get('/cityIntro/detail/:modelCode',function (req,res,next){
        var modelCode = req.params.modelCode;
        common.commonRequest({
            url: [{
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:modelCode
                }
            }],
            req: req,
            res: res,
            page: "cityIntro/cityIntroDetail",
            title: '目的地详情',
            callBack: function(result, reObj){
            }
        });
    });
}
