var async = require('async'),
    needle = require('needle'),
    // querystring = require('querystring'),
    crypto = require('crypto'),
    conJson = require('./config.json'),
    configEnv = require('config-lite')({
        filename: process.env.NODE_ENV,
        config_basedir: __dirname,
        config_dir: 'config'
    });

// 私有属性
var private = {
    partner: 'wap',
    key: 'd332326d0b36f9cf66d290363f3b29f6',
    reMd5: function (text) {
        return crypto.createHash('md5').update(text).digest('hex');
    },
    getMethod: function (url) {
        return url.split('/').splice(-1)[0].split('.')[0];
    },
    getUrl: function (url) {
        var config = conJson,
            reUrl = configEnv.domain;
        url.urlArr
            .map(function (item, index) {
                config = config[item];
            });
        url.outApi ? reUrl = config : reUrl += config;
        return reUrl;
    },
    gul: function (url, falg) {
        var reUrl = url;
        if (reUrl) {
            var tagUrl = '';

            for (key in falg) {
                tagUrl += key + '=' + falg[key] + '&'
            }
            return reUrl + '?' + tagUrl;
        } else {
            console.log('In config.json not found the url');
        }
    },
    // nowdDate: Date.now(),
    getParam: function (item) {
        // var _t = this,
        //     _o = {
        //         transTime: _t.nowdDate,
        //         partner: _t.partner,
        //         method: item.method || _t.getMethod(_t.getUrl(item)),
        //         bizContent: JSON.stringify(item.parameter || {})
        //     };

        // _o.sign = _t.reMd5(_t.partner + _o.method + _t.nowdDate + _t.key);
        _o = item.parameter || {};
        _o.corpCode = "cgb2cfxs";
        _o.wayType = "2";
        return _o;
    }
};
// 导出属性
var common = {
    getUrl: function (url) {
        var config = conJson,
            reUrl = null,
            tagUrl = '';

        url.urlArr
            .map(function (item, index) {
                config = reUrl = config[item];
            });
        if (url.parameter) {
            for (key in url.parameter) {
                tagUrl += key + '=' + url.parameter[key] + '&'
            }
            reUrl += '?' + tagUrl.slice(0, -1);
        }

        return reUrl;
    },
    gul: function (url) {
        var config = conJson,
            reUrl = configEnv.domain;
        // reUrl = config.domain;

        url.map(function (item, index) {
            config = config[item];
        });
        reUrl += config;
        return reUrl;
    },
    commonRequest: function (_p) {
        // 扩展对象
        var opt = {
            title: '标题',    // 页面标题
            isAjax: false,   // 是否为异步
            callBack: function () {
            }  // 流程处理完之后的回调
        };
        _p.__proto__ = opt;
        var _a = new Array(),
            _o = {
                'content-type': 'text/html;charset=utf-8',
                headers: {'access-token': _p.req.session.token || ""},
                cookies: _p.req.cookies,
                timeout: 100000
            };
        _p.url
            .map(function (item, index) {
                var _u = private.getUrl(item),
                    _d = item.noLocal ? item.parameter : private.getParam(item),
                    method = item.method ? item.method : _p.req.method;
                _a.push(function (cb) {
                    needle.request(method, _u, _d, _o, function (err, resp, body) {
                        configEnv.debug && console.log(_u);
                        configEnv.debug && console.log(_d);
                        configEnv.debug && console.log(_o);
                        configEnv.debug && console.log(body);
                        if (!err && resp.statusCode === 200) {
                            body = typeof body === 'string' ? JSON.parse(body) : body;
                            if (body && body.status != 200 && !item.noLocal) {
                                cb('error', body);
                            }
                            else {
                                cb(null, body);
                            }
                        } else {
                            var result = typeof body === 'string' ? JSON.parse(body) : body;
                            if (result && result.status == 400) {
                                _p.req.session.curUrl = _p.req.originalUrl;
                                cb('error', result);
                            } else {
                                cb('error', body);
                            }
                        }
                    });
                });
            });
        async.parallel(_a, function (err, results) {
            if (err) {
                // _p.callBack(results, reObj, _p.res, handTag);
                if (_p.isAjax) {
                    _p.res.send(results);
                } else {
                    if (results.length > 0) {
                        results.map(function (item, index) {
                            if (item.status !== 200) {
                                _p.req.flash('message', item.message ? item.message : '该产品不存在');
                                switch (item.status) {
                                    case 400:
                                        _p.req.session.curUrl = _p.req.originalUrl;
                                        _p.res.redirect('/login');
                                        break;
                                    case 402:
                                        configEnv.debug && console.log("接口 402！");
                                        _p.res.redirect('/error');
                                        break;
                                    case 404:
                                        configEnv.debug && console.log("接口 404！");
                                        _p.res.redirect('/error');
                                        break;
                                    default:
                                        _p.res.redirect('/error');
                                        break;
                                }
                            }
                        });
                    } else {
                        _p.req.flash('message', '没有数据');
                        _p.res.redirect('/error404');
                    }
                }
            } else {
                var reObj = {};
                var handTag = {tag: 1};

                _p.callBack(results, reObj, _p.res, handTag);

                if (handTag.tag) {
                    if (_p.isAjax) {
                        if (results[0].data && results[0].data.token) {
                            _p.req.session.token = results[0].data.token;
                            needle.request("GET", private.getUrl({urlArr: ['member', 'info']}), {leaguerId: results[0].data.leaguerId}, {
                                'content-type': 'text/html;charset=utf-8',
                                headers: {'access-token': _p.req.session.token},
                                timeout: 100000
                            }, function (err, resp, body) {
                                configEnv.debug && console.log(body);
                                var result = typeof body === 'string' ? JSON.parse(body) : body;
                                if (result.status == 200) {
                                    _p.req.session.member = result.data;
                                    // if( _p.req.originalUrl === "/leaguerLogin" &&  _p.req.body.redir){
                                    //     var redir =  _p.req.body.redir;
                                    //     _p.res.redirect(redir);
                                    // }else{
                                    _p.res.send([{status: 200}]);
                                    // }
                                }
                                else {
                                    _p.res.send([result]);
                                }
                            });
                        } else {
                            _p.res.send(results);
                        }
                    } else if (_p.page) {
                        reObj.title = _p.title;
                        reObj.data = results;
                        configEnv.debug && console.log(reObj);
                        _p.res.render(_p.page, reObj);
                    } else {
                        return false;
                    }
                }
            }
        });
    },
    pageTitle: function (module) {
        var title = "";
        switch (module) {
            case "ticket":
                title = "景区";
                break;
            case "hotel":
                title = "酒店";
                break;
            case "route":
                title = "跟团游";
                break;
            case "combo":
                title = "套票";
                break;
            case "zyx":
                title = "自由行";
                break;
            case "repast":
                title = "餐饮";
                break;
            case "goods":
                title = "商品";
                break;
            case "raiders":
                title = "攻略";
                break;
            case "guide":
                title = "导游";
                break;
            case "order":
                title = "订单";
                break;
            case "qr":
                title = "门票";
                break;
            case "integral":
                title = "积分";
                break;
            case "car":
                title = "租车";
                break;
            case "refund":
                title = "退单";
                break;
            case "skiPark":
                title = "滑雪场";
                break;
        }
        return title;
    },
    is_weixn: function (req) {
        var ua = req.headers["user-agent"].toLowerCase();
        return ua.match(/MicroMessenger/i) == "micromessenger";
    },
    utils:{
        moduleToBusiType: {
            ticket:"park",
            hotel:"hotel",
            combo:"combo",
            car:"company",
            repast:"eatery",
            shop:"shop",
            route:"route",
            guide:"guide",
            zyx:"zyx",
            skiPark:"skiPark",
        },
        getModule:function (busiTypeName) {
            var moduleName = busiTypeName
            for(var key in common.utils.moduleToBusiType) {
                if(common.utils.moduleToBusiType[key] === busiTypeName){
                    moduleName = key;
                    break;
                }
            }
            return moduleName;
        },
        getBusiTypeName:function (module) {
            var busiTypeName = common.utils.moduleToBusiType[module] ? common.utils.moduleToBusiType[module] : module;
            return busiTypeName;
        }
    },
    configEnv:configEnv
};

exports.common = common;
