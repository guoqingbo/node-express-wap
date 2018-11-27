var jade = require("jade");
var utils = {
    moduleObj:{
        sencondsKill:"秒杀",
        groupBuy:"团购",
        coupons:"优惠券",
    },
    busiTypeToFlag: {
        park:"门票",
        hotel:"酒店",
        combo:"套票",
        company:"租车",
        eatery:"美食",
        shop:"商品",
        route:"自由行",
        guide:"导游",
    },
    activityStatus:{
        0:"未开始",
        1:"马上抢",
        2:"已结束",
    },
    sencondsKillItemFormat:function(item){
        var nowTime = new Date().getTime();
        item.activityStatus = 2
        if(item.useFlag === "T" && item.totalNum > 0){
            //是否开始
            // var startTime = moment(item.startTime).unix();
            var startTime = new Date(item.startTime).getTime();
            if(startTime > nowTime){
                item.activityStatus = 0
            }else{
                //是否结束
                // var endTime = moment(item.endTime).unix();
                var endTime = new Date(item.endTime).getTime();
                if(endTime < nowTime){
                    item.activityStatus = 2
                }else{
                    item.activityStatus = 1
                }
            }
        }
        item.activityStatusText = utils.activityStatus[item.activityStatus]
    },
    sencondsKillIsFormat:function (data) {
        //秒杀是否结束
        if(data && data.data.rows && data.data.rows.length){
            data.data.rows.forEach(utils.sencondsKillItemFormat)
        }
    },
    groupBuyItemFormat:function(item){
        item.flag = ""
        if(item.businessType){
            item.flag = utils.busiTypeToFlag[item.businessType]
        }
    },
    groupBuyIsFormat:function(data){
        //获取团购类型标签
        if(data && data.data.rows && data.data.rows.length){
            data.data.rows.forEach(utils.groupBuyItemFormat)
        }
    },
    groupBuyOrderUrl:function(data){
        //获取团购单独购买的订单url
        if(data && data.data.rows && data.data.rows.length){
            data.data.rows.forEach(utils.getOrderUrl)
        }
    },
    getOrderUrl:function (item) {
        var businessType = item.businessType;
        var orderUrl = "javascript:;"
        switch (businessType) {
            case 'park':
                // http://localhost:3004/order/ticket/park2018110211143608580?parkId=18
                orderUrl = '/order/ticket/'+ item.rateCode+ '?parkId =' + item.parkId;
                break;
            case 'hotel':
                // http://localhost:3004/order/hotel/hotel2018102215482793194?beginDate=2018-11-2&endDate=2018-11-3
                var dayObj = utils.getHotelDuration();
                orderUrl = '/order/hotel/'+ item.rateCode+ '?beginDate=' + dayObj.beginDate + '&&endDate=' + dayObj.endDate;
                break;
            case 'eatery':
                // http://localhost:3004/order/repast/eatery2018102315122863653
                orderUrl = '/order/repast/' + item.rateCode;
                break;
            case 'shop':
                // http://localhost:3004/order/shop/SP2018102313334989774?rateCode=shop2018102313423654376
                orderUrl = '/order/shop/' + item.modelCode + '?rateCode='+ item.rateCode;;
                break;
            case 'combo':
                // http://localhost:3004/order/combo/combo2018103113345148847?rateCode=combo2018103113380610458
                orderUrl = '/order/combo/' + item.modelCode + '?rateCode='+ item.rateCode;;
                break;
            case 'route':
                //http://localhost:3004/order/route/route2018101910372047093
                orderUrl = '/order/route/' + item.rateCode;
                break;
            case 'car':
                //http://localhost:3004/order/car/ZC2018071609122160087?rateCode=company2018101913073046660
                orderUrl = '/order/car/' + item.modelCode + '?rateCode=' + item.rateCode;
                break;
            case 'guide':
                //http://localhost:3004/order/guide/DY2018080215400472175?rateCode=guide2018101914404798315
                orderUrl = '/order/guide/' + item.modelCode + '?rateCode='+ item.rateCode;
                break;
        }
        item.orderUrl = orderUrl
    },
    getHotelDuration:function () {
        var dayObj = {}
            nowDate = new Date(),
            nextDate = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000);
        dayObj.beginDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        dayObj.endDate = nextDate.getFullYear() + '-' + (nextDate.getMonth() + 1) + '-' + nextDate.getDate();
        return dayObj;
    }
}
exports.mainRouter = function (router, common) {
    // 限时抢购更多
    var page = 'activity/discountActivity';
    router.get('/activity/discountActivity', function (req, res, next) {
        var title = "更多活动";
        var url = [
            {
                urlArr: ['main', 'index', 'allInfo'],
                parameter: {
                    modelCode:'discountActivity'
                }
            }, {
                urlArr: ['sencondsKill','list','main'],
                parameter: {
                    currPage:1,
                    pageSize:3,
                    activityChannel:1,
                }
            }, {
                urlArr: ['groupBuy','list','main'],
                parameter: {
                    currPage:1,
                    pageSize:2,
                },
                // noLocal:true,
                method:"POST"
            },{
                urlArr: ["coupons", "list", "main"],
                parameter: {
                    currPage:1,
                    pageSize:3,
                }
            }]
        common.commonRequest({
            url: url,
            req: req,
            res: res,
            page: page,
            title: title,
            callBack: function (results, reObj) {
                utils.sencondsKillIsFormat(results[1])
                utils.groupBuyIsFormat(results[2])
            }
        });
    });

    //活动列表
    router.get('/activity/:module', function (req, res, next) {
        var module = req.params.module;
        var title = utils.moduleObj[module];
        var params = {
            title:title,
            module:module
        }
        res.render('activity/activityList', params);
    });

    //分页活动下拉列表
    router.post('/activity/:module', function (req, res, next) {
        var module = req.params.module;
        var url = [];
        var title = utils.moduleObj[module];
        switch (module) {
            case "sencondsKill":
                title = "秒杀列表";
                url = [{
                    urlArr: ['sencondsKill','list','main'],
                    parameter: {
                        currPage:req.body.currPage,
                        pageSize:req.body.pageSize,
                        activityChannel:1,
                    },
                    method:"GET"
                }];
                break;
            case "groupBuy":
                title = "团购列表";
                url = [{
                    urlArr: ['groupBuy','list','main'],
                    parameter: {
                        currPage:req.body.currPage,
                        pageSize:req.body.pageSize,
                    },
                    method:"POST"
                }];
                break;
            case "coupons":
                title = "优惠券列表";
                url = [{
                    urlArr: ["coupons", "list", "main"],
                    parameter: {
                        currPage:req.body.currPage,
                        pageSize:req.body.pageSize,
                    },
                    method:"GET"
                }];
                break;
            default:

        }
        common.commonRequest({
            url: url,
            isAjax: true,
            req: req,
            res: res,
            callBack: function (results, reObj) {
                if(module === "sencondsKill"){
                    utils.sencondsKillIsFormat(results[0])
                }else if (module === "groupBuy"){
                    utils.groupBuyIsFormat(results[0])
                }
                reObj.module = module,
                reObj.data =  results,
                reObj.method = "ajax"
                results[0].data.html = jade.renderFile('views/activity/mixin/common.jade', reObj);
            }
        });
    });

    //活动详情
    router.get('/activity/detail/:module', function (req, res, next) {
        var module = req.params.module;
        var url = [];
        var title = "活动详情";

        switch (module) {
            //秒杀详情
            case "sencondsKill":
                url = [{
                    urlArr: ['sencondsKill','order','main'],
                    parameter: {
                        activityCode:req.query.activityCode,
                    },
                    method:"GET"
                }];
                break;
            case "groupBuy":
                url = [{
                    urlArr: ['groupBuy','detail','main'],
                    parameter: {
                        businessType:req.query.businessType,
                        activityId:req.query.activityId,
                    },
                    method:"POST"
                },{
                    urlArr: ['groupBuy','detail','orderList'],
                    parameter: {
                        activityId:req.query.activityId,
                        currPage:1,
                        pageSize:3,
                    },
                    method:"POST"
                }];
                break;
        }
        common.commonRequest({
            url: url,
            req: req,
            res: res,
            page: "activity/activityDetail",
            title: title,
            callBack: function (results, reObj) {
                reObj.module = module;
                if(module === "sencondsKill"){
                    utils.sencondsKillItemFormat(results[0].data)
                }else if(module === "groupBuy"){
                    reObj.activityId = req.query.activityId
                    // utils.groupBuyItemFormat(results[0].data)
                    //获取单独购买的订单url
                    utils.getOrderUrl(results[0].data)
                }
            }
        });
    });
};
