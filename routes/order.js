var async = require('async'),
    needle = require('needle'),
    moment = require('moment');
exports.mainRouter = function (router, common) {
    // 订单页面
    var page = "order/order"
    router.get('/order/:module/:id', function (req, res, next) {
        //检查是否登陆
        if (!req.session.member || req.session.member.id == '') {
            var redir = req.originalUrl;
            res.redirect('/login?redir=' + redir);
            return;
        }

        var module = req.params.module,
            method = "get",
            handObj = {rateCode: req.params.id};

        switch (module) {
            case "traffic":
                handObj.begin = req.query.begin;
                break;
            case "hotel":
                handObj.beginDate = req.query.beginDate;
                handObj.endDate = req.query.endDate;
                if (req.session.beginDate || req.session.endDate) {
                    req.session.beginDate = req.query.beginDate;
                    req.session.endDate = moment(req.query.beginDate).add(1, 'days').format('YYYY-MM-DD');
                }
                break;
            case "combo":
                handObj.goodsCode = req.params.id;
                handObj.rateCode = req.query.rateCode;
                handObj.parkId = req.query.parkId || '';
                break;
            case "shop":
            case "car":
            case "guide":
                handObj.goodsCode = req.params.id;
                handObj.rateCode = req.query.rateCode;
                break;
            case "ticket":
            case "skiPark":
                handObj.parkId = req.query.parkId || '';
                break;
            case "sencondsKill":
                handObj.activityCode = req.params.id;
                break;
            case "groupBuy":
                // 发团拼团标志 1拼团 2发团
                var groupedId = req.query.groupedId || "";
                var groupFlag = req.query.groupFlag;

                handObj.activityId = req.params.id;
                method = "post";
                break;
        }
        handObj.corpCode = "cgb2cfxs";
        var _o = {
            'content-type': 'text/html;charset=utf-8',
            headers: {'access-token': req.session.token || ""},
            timeout: 100000
        };
        async.waterfall(
            [
                function (cb) {
                    var _u = common.gul([module, 'order', 'main']);
                    needle.request(method, _u, handObj, _o, function (err, resp, body) {
                        common.configEnv.debug && console.log(_u);
                        common.configEnv.debug && console.log(handObj);
                        common.configEnv.debug && console.log(_o);
                        if (!err && resp.statusCode === 200) {
                            var res1 = typeof body === 'string' ? JSON.parse(body) : body;
                            if (res1.status != 200) {
                                handleError(res1, req, res);
                            } else {
                                cb(null, res1);
                                common.configEnv.debug && console.log('==============================res1=====================================');
                                common.configEnv.debug && console.log(res1.data);

                                //修改订单页面的预订须知
                                if (typeof res1.data.orderNotice !== 'undefined')
                                    req.session.orderNotice = res1.data.orderNotice;
                                if (module === "repast") {
                                    req.session.content = res1.data.content;
                                }
                            }
                        } else {
                            handleError(resp, req, res);
                        }
                    });
                },
                function (result, cb) {
                    var _u = common.gul(['main', 'ratecode', 'stockprices']),
                        _u1 = common.gul(['main', 'ratecode', 'ruleBuy']),
                        funArry = [],
                        nowDate = moment().format('YYYY-MM-DD'),
                        endDate = moment().add(3, 'months').format('YYYY-MM-DD'),
                        params = {rateCode: result.data.rateCode, corpCode: "cgb2cfxs", beginDate: nowDate, endDate: endDate};
                    switch (module) {
                        case "shop":
                            _u = common.gul(['shop', 'order', 'getStock']);
                            params = {modelCode: result.data.modelCode, corpCode: "cgb2cfxs"};
                            break;
                        case "sencondsKill":
                            _u = common.gul(['sencondsKill', 'order', 'getStock']);
                            params = {activityCode: result.data.activityCode};
                            result.data.ruleBuyCode = result.data.modelCodeBR;
                            result.data.currentPrice =  result.data.secondsKillPrice
                            break;
                        case "groupBuy":
                            params = {rateCode: result.data.goodNo, corpCode: "cgb2cfxs", beginDate: nowDate, endDate: endDate};
                            //购买规则
                            // result.data.ruleBuyCode = result.data.id;
                            result.data.currentPrice =  result.data.collagePrice
                            break;
                        default:

                    }
                    funArry.push(function (callBack) {
                        needle.request("get", _u, params, _o, function (err, resp, body) {
                            common.configEnv.debug && console.log(_u);
                            common.configEnv.debug && console.log(params);
                            if (!err && resp.statusCode === 200) {
                                var res2 = typeof body === 'string' ? JSON.parse(body) : body;
                                common.configEnv.debug && console.log('++++++++++++++++++++++++++++++++++日历库存+++++++++++++++++++++++++++++++++++++');
                                common.configEnv.debug && console.log(res2);

                                if (res2.status != 200) {
                                    res.redirect('/error');
                                } else {
                                    callBack(null, res2);
                                }
                            } else {
                                res.redirect('/error');
                            }
                        });
                    });
                    if (result.data.ruleBuyCode) {
                        funArry.push(function (callBack) {
                            var params = {
                                ruleBuyCode: result.data.ruleBuyCode,
                                corpCode: "cgb2cfxs"
                            }
                            common.configEnv.debug && console.log(_u1);
                            common.configEnv.debug && console.log(params)
                            needle.request("get", _u1, params, _o, function (err, resp, body) {
                                if (!err && resp.statusCode === 200) {
                                    var res2 = typeof body === 'string' ? JSON.parse(body) : body;
                                    common.configEnv.debug && console.log('++++++++++++++++++++++++++++++++++购买规则+++++++++++++++++++++++++++++++++++++');
                                    common.configEnv.debug && console.log(res2);
                                    if (res2.status != 200) {
                                        res.redirect('/error');
                                    } else {
                                        callBack(null, res2);
                                    }
                                } else {
                                    res.redirect('/error');
                                }
                            });
                        });
                    }
                    //是否获取自取点
                    var isGetlistPoint = false;
                    switch (module) {
                        case "shop":
                            isGetlistPoint = true;
                        case "sencondsKill":
                        case "groupBuy":
                            if (common.utils.getModule(result.data.businessType) === "shop") {
                                isGetlistPoint = true;
                            }
                            break;
                        default:
                    }
                    if (isGetlistPoint) {
                        var _u2 = common.gul(['shop', 'order', 'listPoint']);
                        funArry.push(function (callBack) {
                            needle.request("get", _u2, {
                                modelCode: result.data.modelCode,
                                corpCode: "cgb2cfxs"
                            }, _o, function (err, resp, body) {
                                if (!err && resp.statusCode === 200) {
                                    var res2 = typeof body === 'string' ? JSON.parse(body) : body;
                                    common.configEnv.debug && console.log('++++++++++++++++++++++++++++++++++获取自提点+++++++++++++++++++++++++++++++++++++');
                                    common.configEnv.debug && console.log(res2);
                                    if (res2.status !== 200 && res2.status !== 402) {
                                        res.redirect('/error');
                                    } else {
                                        callBack(null, res2);
                                    }
                                } else {
                                    res.redirect('/error');
                                }
                            });
                        });
                    }
                    async.parallel(funArry, function (err, results) {
                        results.splice(0, 0, result);
                        cb(null, results);
                    });
                }
            ],
            function (err, results) {
                common.configEnv.debug && console.log(results);
                var reObj = {}, userInfo = null;
                reObj.module = module;
                switch (module) {
                    case "sencondsKill":
                        reObj.activity = module;
                        reObj.module = common.utils.getModule(results[0].data.businessType);
                        reObj.beginDate = moment().format('YYYY-MM-DD');
                        reObj.endDate = moment().add(1, 'days').format('YYYY-MM-DD');
                        break;
                    case "groupBuy":
                        reObj.activity = module;
                        reObj.module = common.utils.getModule(results[0].data.businessType);
                        reObj.beginDate = moment().format('YYYY-MM-DD');
                        reObj.endDate = moment().add(1, 'days').format('YYYY-MM-DD');
                        reObj.groupFlag = groupFlag;
                        reObj.groupedId = groupedId;
                        break;
                }
                userInfo = req.session.member;
                reObj.det_url = req.session.preUrl;
                //优惠券登录成功时返回的地址
                reObj.cbUrl = req.originalUrl;
                if (module === 'hotel') {
                    reObj.beginDate = req.session.beginDate;
                    reObj.endDate = req.session.endDate;
                    reObj.numDays = req.session.numDays;
                } else if (module === 'traffic') {
                    reObj.begin = req.query.begin;
                } else if (module === 'ticket' || module === 'skiPark' || module === 'route' || module === 'combo') {
                    reObj.parkId = req.query.parkId;
                }
                res.render(page, {
                    title: common.pageTitle(module) + '订单',
                    data: results,
                    reObj: reObj,
                    userInfo: userInfo
                });
            });
    });

    // 省市区获取
    router.get('/order/getAdress', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['shop', 'order', 'address'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //获取邮费信息
    router.get('/order/getPostage', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['shop', 'order', 'getPostage'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 表单提交
    router.post('/order/:module', function (req, res, next) {
        var module = req.params.module,
            parameter = req.query,
            urlArr = module === 'addCart' ? ['cart', 'list', 'add'] : ['order', 'saveOrder'];
        //全员营销
        // var promoteCode = req.query.promoteCode;
        // parameter.promoteCode = promoteCode;
        for (var key in parameter) {
            if (Array.isArray(parameter[key])) {
                parameter[key] = parameter[key].join(',');
            }
        }

        if (req.query.paramExtension && req.query.paramExtension == 0) {
            var d2 = req.query.address2.split(',')[0] || '',
                d3 = req.query.address3.split(',')[0] || '';

            req.query.paramExtension = 0 + ',' + d2 + ',' + d3 + ',' + req.query.street;
            delete req.query.address;
            delete req.query.address1;
            delete req.query.address2;
            delete req.query.address3;
            delete req.query.street;
        } else if (req.query.paramExtension && req.query.paramExtension == 1) {
            req.query.paramExtension = 1 + ',' + req.query.address;
            delete req.query.address;
            delete req.query.address1;
            delete req.query.address2;
            delete req.query.address3;
            delete req.query.street;
        }
        if (req.session.member) {
            parameter.leaguerId = req.session.member.id;
        }
        if (module === 'ticket' || module === 'skiPark' || module === 'combo') {
            parameter.paramExtension = req.query.parkId || '';
            delete req.query.parkId;
        }

        var busiTypeName = common.utils.getBusiTypeName(module);

        parameter.busiType = parameter.busiType ? parameter.busiType: busiTypeName;
        parameter.accountType = 4;
        common.configEnv.debug && console.log(parameter);
        common.commonRequest({
            url: [{
                urlArr: urlArr,
                parameter: parameter
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results, reqs, resp, handTag) {
                req.session.orderinfo = results[0].data;
            }
        });
    });

    // 订单详细页
    router.get('/orderDetail/:page', function (req, res, next) {
        var page = req.params.page;
        var data = req.session[page];
        res.render('order/orderNotice', {data: data, title: '订单'});
    });
};

function handleError(data, req, res) {
    switch (data.status) {
        case 400:
            req.session.curUrl = req.originalUrl;
            res.redirect('/login');
            break;
        case 402:
            common.configEnv.debug && console.log("接口 402！");
            req.flash('message', data.message);
            res.redirect('/error');
            break;
        case 404:
            common.configEnv.debug && console.log("接口 404！");
            res.redirect('/error');
            break;
        default:
            res.redirect('/error');
            break;
    }
}
