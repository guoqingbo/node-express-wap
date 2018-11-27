crypto = require('crypto');
exports.mainRouter = function (router, common, requireLogin) {
    // 个人中心
    router.get('/member', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'info'],
                parameter: {leaguerId: req.session.member.id}
            }],
            req: req,
            res: res,
            page: 'member',
            title: '个人中心'
        });
    });

    // 用户中心
    router.get('/member/user', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'info'],
                parameter: {leaguerId: req.session.member.id}
            }],
            req: req,
            res: res,
            page: 'member/user/index',
            title: '用户中心',
            callBack: function (results, reObj, res, handTag) {
                let userInfo = results[0].data;
                for (key in userInfo) {
                    req.session.member[key] = userInfo[key];
                }
            }
        });
    });

    // 修改用户信息
    router.get('/member/user/:modify', requireLogin, function (req, res, next) {
        res.render('member/user/modify', {title: '修改信息', modify: req.params.modify, data: req.session.member});
    });

    //打开修改密码页面
    router.get('/member/changePassword', requireLogin, function (req, res, next) {
        res.render('member/user/changePassword');
    });

    //修改用户密码
    router.get('/member/leaguerFixPwd', requireLogin, function (req, res, next) {
        req.query.loginName = req.session.member.loginName;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'leaguerFixPwd'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 提交用户修改
    router.post('/member/modify', requireLogin, function (req, res, next) {
        req.query.loginId = req.session.member.id;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'modify'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results) {
                for (key in req.query) {
                    req.session.member[key] = req.query[key];
                }
            }
        });
    });

    /*----- 订单列表在list.js(方便统一做翻页) -----*/

    // 订单详情
    router.get('/member/order/:orderNo', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'detail'],
                parameter: {
                    orderNo: req.params.orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'member/order/detail',
            title: '订单详情',
            callBack: function (results, reqs, resp, handTag) {
                req.session.orderinfo = results[0].data;
                reqs.module = 'order';
            }
        });
    });
    // 退单详情
    router.get('/member/refundDetail/:orderNo', requireLogin, function (req, res, next) {
        let refundNo = req.query.refundNo;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'refundDetail'],
                parameter: {
                    orderNo: req.params.orderNo,
                    refundNo: refundNo,
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'member/order/refundDetail',
            title: '订单详情',
            callBack: function (results, reqs, resp, handTag) {
                req.session.orderinfo = results[0].data;
            }
        });
    });

    // 订单评论页
    router.get('/member/comment/:module', requireLogin, function (req, res, next) {
        res.render('member/order/comment', {
            title: '订单评论',
            module: req.params.module,
            orderNo: req.query.orderNo,
            modelCode: req.query.modelCode
        });
    });

    // 提交评论
    router.post('/member/comment', requireLogin, function (req, res, next) {
        req.body.leaguerId = req.session.member.id;
        req.body.leaguerName = req.session.member.realName ? req.session.member.realName : req.session.member.loginName;
        common.commonRequest({
            url: [{
                urlArr: ['main', 'comment', 'add'],
                parameter: req.body
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });

    // 退款页面
    router.get('/member/refund/:module', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'detail'],
                parameter: {
                    orderNo: req.query.orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'member/order/refund',
            title: '订单退款',
            callBack: function (results, reObj, resp, handTag) {
                reObj.module = req.params.module
            }
        });
    });

    // 提交退款
    router.post('/member/refund/:module', requireLogin, function (req, res, next) {
        var module = req.params.module;
        var params = {};
        params.leaguerId = req.session.member.id;
        params.orderNo = req.body.orderNo;
        params.reason = req.body.reason;
        params.refundDetailJson = {
            orderDetailId: req.body.orderDetailId,
            refundAmount: req.body.refundAmount
        };
        if (req.body.isRealName === 'true') {
            params.refundDetailJson.orderDetaimModelId = req.body.idNo.join(',');
        }
        if(module === 'combo'){
            var refundDetailJson = [];
            req.body.orderDetailId.forEach(function (item,index) {
                var refundDetailJsonItem = {};
                refundDetailJsonItem.orderDetailId = item
                refundDetailJsonItem.refundAmount = req.body.refundAmount[index]
                refundDetailJson.push(refundDetailJsonItem)
            })
            params.refundDetailJson = JSON.stringify(refundDetailJson);
        }else{
            params.refundDetailJson = JSON.stringify([params.refundDetailJson]);
        }
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'refund'],
                parameter: params
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });

    //取消订单
    router.post('/member/cancle/:orderNo', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'cancel'],
                parameter: {
                    orderNo: req.params.orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    //删除订单
    router.post('/member/remove/:orderNo', requireLogin, function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'remove'],
                parameter: {orderId: req.params.orderId}
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    // 确认收货
    router.post('/receivedGoods/:orderNo', requireLogin, function (req, res) {
        let orderNo = req.params.orderNo;
        let leaguerId = req.session.member.leaguerId;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'receivedGoods'],
                parameter: {
                    orderNo,
                    leaguerId
                },
                method: 'get'
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    // 会员二维码
    router.get('/member/userCode', requireLogin, function (req, res, next) {
        var userCode = req.session.member.leaguerId.toString();
        userCode = crypto.createHash('md5').update(userCode).digest('hex');
        res.render('member/user/userCode', {
            userCode,
            title: '会员二维码'
        })
    })
};
