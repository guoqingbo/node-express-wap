var utils = {
    getDetailUrl:function (item) {
        var url = 'javascript:;';
        var module = item.productType
        switch (module) {
            case 'shop':
                url = '/detail/shop/' + item.modelCode + '?rateCode=' + item.rateCode;
                break;
            case 'guide':
                url = '/detail/guide/' + item.modelCode + '?rateCode=' + item.rateCode;
                break;
            case 'combo':
                url = '/detail/combo/' + item.goodsCode + '?rateCode=' + item.rateCode;
                break;
            case 'strategy':
                url = '/detail/strategy/' + item.baseCode;
                break;
            case 'car':
                url = '/detail/car/' + item.modelCode+'?rateCode=' + item.rateCode;
                break;
            default:
                url = '/detail/' + module + '/' + item.goodsCode;
                break;
        }
        item.detailUrl = url
    }
}
exports.mainRouter = function (router, common) {
    router.get('/travelAgency/travelAgencyList',function (req,res,next){
        res.render("travelAgency/travelAgencyList",{})
    });
    router.get('/travelAgency/travelAgencyDetail/:id',function (req,res,next){
        var id = req.params.id;
        var handArr = handArr = [{
            urlArr: ['travelAgency','detail','main'],
            parameter: {
                crop:id,
            }
        }];
        common.commonRequest({
            url: handArr,
            req: req,
            res: res,
            page: "travelAgency/travelAgencyDetail",
            title: "旅行社详情",
            callBack: function (results,reObj){
                if(results[0].data.travelProducts && results[0].data.travelProducts.length){
                    results[0].data.travelProducts.forEach(utils.getDetailUrl)
                }
            }
        });
    });
}
