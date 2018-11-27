exports.mainRouter = function (router, common) {
    // 导览
    router.get('/navigation', function (req, res, next) {
        res.render('navigation/navigation', {
        })
    });
    router.post('/navigation', function (req, res, next) {
        // var typeObj = {
        //     park:"景区",
        //     hotel:"酒店",
        //     toilet:"厕所",
        //     parkingLot:"停车场"
        // }
        common.commonRequest({
            url: [{
                urlArr: ["navigation", "list", "main"],
                parameter: {
                    type:req.body.type,
                    latitude:req.body.latitude,
                    longitude:req.body.longitude,
                },
                method:"GET"
            }],
            isAjax: true,
            req: req,
            res: res,
            callBack: function (results, reObj) {

            }
        });
    });
};
