exports.mainRouter = function (router,common){
    // 购物车列表 
    
    router.get('/cart',function (req,res,next){
        if(req.session.loginId){
            common.commonRequest({
                url: [{
                    urlArr: ['cart','list','pagelist'],
                    parameter: {loginId: req.session.loginId }
                }],
                req: req,
                res: res,
                page: 'cart',
                title: '购物车'
            });
        }else{
            res.render('cart',{
                title: '购物车',
                data: [{datas:[]}]
            });
        }
    });

    // 删除购物车
    router.get('/cart/itemdel/:ids',function (req,res,next){
        common.commonRequest({
            url: [{
                urlArr: ['cart','list','delete'],
                parameter: {
                    ids: req.params.ids,
                    loginId: req.session.loginId
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 购物车支付
    router.get('/cart/pay/:ids',function (req,res,next){
        common.commonRequest({
            url: [{
                urlArr: ['cart','list','order'],
                parameter: {
                    ids: req.params.ids,
                    loginId: req.session.loginId
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //购物车去支付
    // router.get('/cart/toPay/:orderId',function(req,res,next){
    //     var orderNo = req.params.orderId,
    //         module = 'cart';
    //     common.commonRequest({
    //         url: [{
    //             urlArr: ['cart','pay','main'],
    //             parameter: {
    //                 orderNo: orderNo
    //             }
    //         }],
    //         req: req,
    //         res: res,
    //         page: 'payCart',
    //         title: 'pay',
    //         callBack: function (results,reObj){
    //             reObj.module = module;
    //             reObj.is_weixn = common.is_weixn(req);
    //         }
    //     });
    // })
};