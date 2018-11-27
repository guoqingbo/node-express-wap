exports.mainRouter = function (router, common) {
    //领取优惠券
    router.get('/coupon/get', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ["coupons", "getCoupons", "main"],
                parameter: {
                    couponCode: req.query.couponCode
                },
                method: "POST"
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });
    //优惠券详情
    router.get('/coupon/detail', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ["coupons", "detail", "main"],
                parameter: {
                    couponCode: req.query.couponCode
                },
                method: "GET"
            }],
            req: req,
            res: res,
            title: '领取优惠劵',
            page: 'coupons/couponDetail'
        });
    });
    //领取成功
    router.get('/coupon/get/result',function (req,res,next) {
        common.commonRequest({
            url: [{
                urlArr: ["coupons", "detail", "main"],
                parameter: {
                    couponCode: req.query.couponCode
                },
                method: "GET"
            }],
            req: req,
            res: res,
            title: '领取成功',
            page: 'coupons/couponSuccess'
        });
    });

    router.get('/coupon/useAble', function (req, res, next){
        // req.query.leaguerId = req.session.member.leaguerId || '';
        var parameter = {
            productType: common.utils.getBusiTypeName(req.query.productType),
            productCode: req.query.productCode
        }
        common.commonRequest({
            url: [{
                urlArr: ["coupons", "list", "usableCoupons"],
                parameter: parameter,
                method: "POST"
            }],
            req: req,
            res: res,
            isAjax:true
        });
    });
    //优惠劵列表页
    router.get('/coupons/:from', function (req, res, next) {
        let from = req.params.from;
        let params = {
            from: from,
            title: '优惠劵列表'
        };

        if (from === 'member') params.title = '我的优惠劵';

        if (from === 'order') { //如果是从订单跳转过来的
            params.title = '可使用优惠券';
            params.productCode = req.query.productCode || '';
            params.productType = req.query.productType || '';
        }

        res.render('coupons/coupons', params);
    });
    //获取优惠劵列表
    router.post('/coupons/:from', function (req, res, next) {
        let urlArr = [], method = 'GET';
        switch (req.params.from) {
            case 'list':
                urlArr = ["coupons", "list", "main"];
                break;
            case 'member':
                urlArr = ["coupons", "list", "member"];
                method = 'POST';
                break;
            default:
                break;
        }
        common.commonRequest({
            url: [{
                urlArr: urlArr,
                parameter: req.body,
                method: method
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });
};

