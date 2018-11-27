var async = require('async'),
    needle = require('needle');
exports.mainRouter = function (router, common) {
    // 限时抢购更多
    router.post('/weather', function (req, res) {
        var handObj = {
            c:"code",
            id:1,
            color:"%23FFFFFF",
            icon:1,
            py:req.body.py,
            wind:1,
            num:1,
            site:12
        }
        var _o = { 'content-type': 'text/html;charset=utf-8', headers: { 'access-token': req.session.token || "" }, timeout: 100000 };
        async.waterfall([
            function(cb){
                // var _u = "//i.tianqi.com/index.php?c=code&id=1&color=%23FFFFFF&icon=1&py=antu&wind=1&num=1&site=12"
                var _u = "//i.tianqi.com/index.php"
                needle.request("get", _u, handObj, _o, function (err, resp, body) {
                    console.log( _u);
                    console.log( handObj);
                    console.log( _o);
                     if (!err && resp.statusCode === 200) {
                        var res1 = body;
                        cb(null, res1);
                         common.configEnv.debug && console.log('==============================res1=====================================');
                         common.configEnv.debug && console.log(res1.data);
                    } else {
                        handleError(resp, req, res);
                    }
                });
            },
        ], function(err, results){
            common.configEnv.debug && console.log(results)
            var data = {
                html:results
            }
            res.send(data)
        });
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
