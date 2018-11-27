exports.mainRouter = function (router, common) {
    // 投诉建议
    router.get('/complaint/:module', function (req, res, next) {
        var module = req.params.module,
            title = "投诉建议";
        res.render('complaint/'+module, {
            module: module,
            title:title,
        });
        return;
    });

    router.post('/complaint/:module', function (req, res, next) {

        let module = req.params.module,
            method = 'post',
            urlArrm;
        switch (module) {
            case 'online':
                urlArrm = ['complaint', 'online'];
                break;
            case 'suggest':
                urlArrm = ['complaint', 'order'];
                break;
        }
        for (key in req.query) {
            req.body[key] = req.query[key];
        }
        common.commonRequest({
            url: [{
                urlArr: urlArrm,
                parameter: req.body,
                method: method
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });
};
