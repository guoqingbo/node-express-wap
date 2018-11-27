var express = require('express');
var router = express.Router();
var common = require('./common/index').common;

var requireLogin = function (req, res, next) {
    if (!req.session.member || !req.session.member.leaguerId) {
        var redir = req.originalUrl;
        res.redirect('/login?redir='+redir);
    } else {
        return next();
    }
};
//测试路由（可删除）
require('./test').mainRouter(router, common);
// main
require('./main').mainRouter(router, common);
// member
require('./member').mainRouter(router, common, requireLogin);
// list
require('./list').mainRouter(router, common);
// detail
require('./detail').mainRouter(router, common);
// order
require('./order').mainRouter(router, common);
// cart
require('./cart').mainRouter(router, common, requireLogin);
// pay
require('./pay').mainRouter(router, common, requireLogin);
//coupons
require('./coupons').mainRouter(router, common, requireLogin);
//限时活动更多
require('./more').mainRouter(router, common);
//complaint
require('./complaint').mainRouter(router, common);
//图片上传
require('./upload').mainRouter(router, common);
//navigation
require('./navigation').mainRouter(router, common);
//weather
require('./weather').mainRouter(router, common);
//乡村游
require('./xcy').mainRouter(router, common);
//活动
require('./activity').mainRouter(router, common, requireLogin);
//目的地
require('./destination').mainRouter(router, common);
//旅行社
require('./travelAgency').mainRouter(router, common);
//资讯
require('./information').mainRouter(router, common);
//城市介绍
require('./cityIntro').mainRouter(router, common);
module.exports = router;
