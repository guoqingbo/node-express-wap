exports.mainRouter = function (router, common) {
    // 一机游首页
    router.get(['/yijiyou', '/main'], function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:'yijiyouIndex'
                }
            }],
            req: req,
            res: res,
            page: "main/main",
            title: '一机游首页',
            callBack: function(result, reObj){
                if(result[0].data.destination){
                    //目的地
                    req.session.destination = result[0].data.destination
                }
                if(result[0].data.hotVideo){
                    //热门视频
                    req.session.hotVideo = result[0].data.hotVideo
                }
                if(result[0].data.goodTravel){
                    //精品游记
                    req.session.goodTravel = result[0].data.goodTravel
                }
            }
        });
    });
    // 安图首页
    router.get("/", function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:'index'
                }
            }],
            req: req,
            res: res,
            page: "main/main2",
            title: '安图首页',
            callBack: function(result, reObj){
                if(reObj){
                    reObj.module = 'index'
                }
            }
        });
    });


    // 登陆页面
    router.get('/login', function (req, res, next) {
        res.render('login', {title: '登录', redir: req.query.redir || req.session.curUrl || './member'})
    });

    //注册
    router.get('/register', function (req, res, next) {
        res.render('register', {title: '注册', redir: req.session.curUrl || './member'});
    });

    //查看用户协议
    router.get('/register/protocol', function (req, res, next) {
        res.render('member/register/registrationProtocol', {title: '注册协议'});
    });


    // 注册
    router.post('/signIn', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'register'],
                parameter: req.body,
                method: 'get'
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //登录
    router.post('/leaguerLogin', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'main'],
                parameter: req.body,
                method: 'get'
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });
    //手机号快捷登录
    router.post('/phoneNumberLogin', function (req, res, next) {
        req.body.channel = 'LOTSWAP';
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'leaguerMobileLogin'],
                parameter: req.body,
                method: 'get'
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 发送验证码
    router.post('/checkCode', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'sendCheckCode'],
                parameter: req.body
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 注销用户
    router.post('/logOut', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'logout'],
                method: 'get'
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results, reqs, resp, handTag) {
                req.session.destroy()
            }
        });
    });

    //忘记密码
    router.get('/forgetPassword', function (req, res, next) {
        res.render('pwd1', {title: '忘记密码'});
    });

    //核对验证码是否正确
    router.post('/checkPhoneCode', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'checkPhoneCode'],
                parameter: req.body,
                method: 'get'
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results, reObj) {
                if(results[0].status === 200){
                    req.session.leaguerId = results[0].data.leaguerId;
                }
            }
        });
    });

    //打开重置密码页面
    router.get('/resetPassword', function (req, res, next) {
        res.render('pwd2', {title: '忘记密码'});
    });

    //设置新密码
    router.post('/setNewPassword', function (req, res, next) {
        if(!req.session.leaguerId){
            return res.send([{status: '400', message: '请先验证注册手机'}])
        }
        var parameter = {
            leaguerId:req.session.leaguerId,
            password:req.body.password
        };
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'resetPwd'],
                parameter:parameter,
                method:"POST"
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //无密登录
    router.get('/fastregByAccount', function (req, res, next) {
        req.query.channel = 'LOTSWAP';
        common.commonRequest({
            url: [{
                urlArr: ['member', 'login', 'fastregByAccount'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //私人订制
    router.get('/customized', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['custom', 'info'],
                parameter: req.query,
            }],
            req: req,
            res: res,
            callBack: function (results, reqs, resp, handTag) {
                res.render('customized', {
                    module:'customized',
                    data:results
                });
            }
        });
    });
    router.get('/customizeds', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['custom', 'order'],
                parameter: req.query,
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

     //错误处理
    router.get('/error', function (req, res, next) {
        res.render('error', {
            message: req.flash('message').toString()
        })
    });

    router.get('/404', function (req, res) {
        res.render('error404', {
            message: req.flash('message').toString()
        })
    });
};
