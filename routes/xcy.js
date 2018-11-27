exports.mainRouter = function (router, common) {
    // 乡村游
    router.get('/xcy', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:'xcy'
                }
            }],
            req: req,
            res: res,
            page: 'xcy/xcy',
            title: "乡村游",
            callBack: function (results, reObj) {
                req.session.xcyMore = results[0].data;
            }
        });
    });
    // 查看更多
    router.get('/xcy/:module', function (req, res, next) {
        var module = req.params.module;
        res.render("xcy/lookMore",{title:"列表页",module:module,data:req.session.xcyMore})
    });
};
