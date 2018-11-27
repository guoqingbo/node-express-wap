var jade = require("jade");
exports.mainRouter = function (router, common) {
    // 列表页
    var page = "list/list";
    router.get('/list/:module', function (req, res, next) {
        var module = req.params.module,
            title = common.pageTitle(module) + '列表';
        var businessType  =  common.utils.getBusiTypeName(module);
        var url = [{
            urlArr: ['main', 'search'],
            parameter: { businessType: businessType }
        }, {
            urlArr: ['main', 'sort'],
            parameter: { businessType: businessType }
        }];
        switch (module) {
            case 'getInfoByType':
            case 'strategy':
            case 'commentList':
            case 'integral':
                res.render(page, {
                    title: title,
                    module: module
                });
                return;
            case 'order':
            case 'refund':
                if (!req.session.member||req.session.member.id=='') {
                    var redir = req.originalUrl;
                    res.redirect('/login?redir='+redir);
                    return;
                }
                var orderStatus = req.query.orderStatus || '';
                res.render(page, {
                    title: title,
                    module: module,
                    orderStatus: orderStatus
                });
                return;
            case 'travelAgency':
               url = [{
                    urlArr: ['main', 'search'],
                    parameter: { businessType: businessType }
                }];
        }
        common.commonRequest({
            url: url,
            req: req,
            res: res,
            page: page,
            title: title,
            callBack: function (results, reObj) {
                reObj.module = module;
                reObj.searchName = req.query.searchName || ''
            }
        });
    });

    // 下拉加载
    router.post('/list/:module', function (req, res, next) {
        let module = req.params.module,
            method = 'get',
            urlArrm;

        switch (module) {
            case 'order':
                urlArrm = ['member', 'order', 'pagelist'];
                if (req.query.orderStatue) req.session.orderStatus = req.body.orderStatus = req.query.orderStatue;
                req.body.buyerId = req.session.member.id;
                break;
            case 'refund':
                urlArrm = ['member', 'order', 'refundOrder'];
                if (req.query.orderStatue) req.session.orderStatus = req.body.orderStatus = req.query.orderStatue;
                req.body.buyerId = req.session.member.id;
                break;
            case 'commentList':
                urlArrm = ['main', 'comment', 'list'];
                break;
            case 'getInfoByType':
                urlArrm = ['ticket', 'detail', 'getInfoByType'];
                break;
            case 'hotel':
                req.session.beginDate = req.body.beginDate;
                req.session.endDate = req.body.endDate;
                urlArrm = [module, 'list', 'pagelist'];
                break;
            case 'strategy':
                req.body.modelCode = module;
                urlArrm = [module, 'list', 'pagelist'];
                break;
            case 'integral':
                urlArrm = ['member', 'integral'];
                method='post'
                //req.body.modelCode = module;
                break;
            default:
                urlArrm = [module, 'list', 'pagelist'];
                break;
        }

        for (key in req.query) {
            req.body[key] = req.query[key];
        }

        common.commonRequest({
            url: [{
                urlArr: urlArrm,
                parameter: req.body,
                method: method
            }],
            isAjax: true,
            req: req,
            res: res,
            callBack: function (results, reObj) {
                //
                if(module === "travelAgency"){
                    reObj.module = module,
                    reObj.data =  results,
                    reObj.method = "ajax"
                    results[0].data.html = jade.renderFile('views/travelAgency/mixin/list.jade', reObj);
                }
            }
        });
    });
};
