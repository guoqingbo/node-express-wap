const async = require('async');
const userType = 'C'; //用户类型c端
const appId = 'wx37b45b55a30c1726';//测试环境
const appSecret = 'e7560178d2dcfc37e0c9d14eb8ae9a49';//测试环境
// const appId = 'wx2cfa0fab51ede6db';
// const appSecret = 'a924e079b88731bc44b2f663d5c6e717';
const WXPAYTYPE = 32; //32:微信公众号支付 34:智游宝微信公众号支付

exports.mainRouter = function (router, common) {
    // 支付确认页面
    router.get('/pay/:module/:orderId', function (req, res, next) {
        var module = req.params.module,
            orderNo = req.params.orderId;0
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'detail'],
                parameter: {
                    orderNo: orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'pay',
            title: '支付确认页',
            callBack: function (results, reObj) {
                reObj.module = module;
                reObj.orderNo = orderNo;
                reObj.is_weixn = common.is_weixn(req);
            }
        });
    });


    // 去支付
    router.get('/pay/:module', function (req, res, next) {
        var module = req.params.module,
            orderNo = req.query.orderNo,
            payOrderNo = req.query.payOrderNo,
            paySum = req.query.paySum,
           orderInfo = req.query.orderInfo;
        var redirectUrl = "http://" + req.headers.host + "/payPlat/result";
        if (common.is_weixn(req)) {
            next();
            return;
        }

        //附加参数
        let params = {
            redirectUrl: redirectUrl,
            operateId: req.session.member.id,
            orderInfo: orderInfo
        };

        // 请求支付宝配置
        common.commonRequest({
            url: [{
                urlArr: ['main', 'pay', 'main'],
                parameter: {
                    orderNo: orderNo,
                    userType: userType,
                    payType: 22, //支付宝支付
                    paySum: paySum,
                    payOrderNo: payOrderNo,
                    extendParamJson: JSON.stringify(params)
                }
            }],
            req: req,
            res: res,
            page: common.is_weixn(req) ? 'pay/wxpay' : 'pay/payAlipay',
            title: '支付宝支付'
        });
    }, function (req, res, next) {
        // 请求配置信息
        // common.commonRequest({
        //     url: [{
        //         urlArr: ['main', 'pay', 'getPayinfo'],
        //         parameter: {
        //             payType: 'wxpay',
        //         }
        //     }],
        //     req: req,
        //     res: res,
        //     callBack: function (results, reObj) {
        //
        //     }
        // });
        // 配置微信授权
        res.render('wxlogin', {
            codeUrl: common.getUrl({
                urlArr: ['main', 'wechat', 'Authorization'],
                parameter: {
                    appid: appId,
                    redirect_uri: encodeURIComponent('http://' + req.headers.host + '/horization/' + req.query.orderNo + '?paySum=' + req.query.paySum),
                    response_type: 'code',
                    scope: 'snsapi_userinfo'
                },
                outApi: true  //外网接口判断 {true:是}
            }) + '#wechat_redirect'
        });
    });

    // 授权access_token
    router.get('/horization/:orderNo', function (req, res, next) {
        req.session.orderNo = req.params.orderNo;
        common.configEnv.debug && console.log('----------------/horization/:orderNo---------------------')
        common.configEnv.debug && console.log(req.params)
        let paySum = req.query.paySum;
        async.waterfall([
            function (cb) {
                common.commonRequest({
                    url: [{
                        urlArr: ['main', 'wechat', 'accessToken'],
                        parameter: {
                            appid: appId,
                            secret: appSecret,
                            code: req.query.code,
                            grant_type: 'authorization_code'
                        },
                        outApi: true, //外网接口判断 {true:是}
                        noLocal: true
                    }],
                    req: req,
                    res: res,
                    callBack: function (results, reqs, resp, handTag) {
                        handTag.tag = 0;
                        cb(null, results);
                    }
                });
            },
            function (result, cb) {
                let params = {
                    openId: result[0].openid,
                    operateId: req.session.member.id,
                    orderInfo: "订单描述信息"
                };

                common.commonRequest({
                    url: [{
                        // urlArr: ['main', 'wechat', 'tozybwxpay'],
                        urlArr: ['main', 'pay', 'main'],
                        parameter: {
                            orderNo: req.params.orderNo,
                            userType: userType,
                            payType: WXPAYTYPE, //智游宝微信支付
                            paySum: paySum,
                            extendParamJson: JSON.stringify(params)
                        }
                    }],
                    req: req,
                    res: res,
                    callBack: function (results, reqs, resp, handTag) {
                        handTag.tag = 0;
                        cb(null, results);
                    }
                });
            }
        ], function (err, results) {
            common.configEnv.debug && console.log('-----------------------------------results[0].datas.payParams------------------------------------')
            common.configEnv.debug && console.log(results[0].data);
            if (err) {
                res.redirect('/error');
                return;
            }
            let renderPage = ''
                , itemDatas = null;
            switch (WXPAYTYPE) {
                case 32:
                    renderPage = 'wxpay';
                    itemDatas = JSON.parse(results[0].data);
                    break;
                case 34:
                    renderPage = 'pay/wxpay';
                    itemDatas = results[0].data;
                default:
                    break;
            }

            res.render(renderPage, {item: itemDatas});
        });
    });


    // 支付宝同步回调
    router.get('/payPlat/result', function (req, res, next) {
        //console.log(req.query);
        // var orderId = req.params.orderId;

        // //后台通知(验证)
        // res.render('payResult',{title:'支付结果',data: req.query});
        // for (var key in req.query){
        //     req.query[key] = [req.query[key]];
        // }
        common.configEnv.debug && console.log('支付宝同步回调', req.query);
        common.commonRequest({
            url: [{
                urlArr: ['main', 'pay', 'result'],
                parameter: {
                    outTradeNo: req.query.out_trade_no
                }
            }],
            req: req,
            res: res,
            page: 'payResult',
            title: '支付结果',
            callBack: function (results, reObj, resp, handTag) {
                reObj.backDetailUrl = req.session.backDetailUrl;
                // reObj.backDetailUrl = req.session.preUrl;
            }
        });
    });

    //微信智游宝支付回调
    router.post('/zybpay/result', function (req, res, next) {
        common.configEnv.debug && console.log('支付宝回调', req.body);
        common.commonRequest({
            url: [{
                urlArr: ['main', 'wechat', 'wxPayResult'],
                parameter: req.body
            }],
            req: req,
            res: res,
            page: 'payResult',
            title: '支付结果'
        });
    });

    // 微信支付回调
    router.get('/payPlat/Notify/:result', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'detail'],
                parameter: {
                    orderNo: req.session.orderinfo.orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'payResult',
            title: '支付结果',
            callBack: function (results, reObj, resp, handTag) {
                if (Number(req.params.result)===1) {
                    results[0].flag = 'success';
                } else {
                    results[0].flag = 'error';
                }
                reObj.orderNo = req.session.orderNo;
                reObj.backDetailUrl = req.session.backDetailUrl;
            }
        });
    });
};
