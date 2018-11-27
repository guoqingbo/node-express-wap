exports.mainRouter = function (router,common){
    // 详情页
    var page = "detail/detail"
    router.get('/detail/:module/:productCode',function (req,res,next){
        req.session.preUrl=req.originalUrl;
        var module = req.params.module,
            productCode = req.params.productCode,
            rateCode=req.query.rateCode?req.query.rateCode:'',
            handArr = [{
                urlArr: ['main','detailimgs'],
                parameter: { modelCode: productCode}
            },{
                urlArr: [module,'detail','main'],
                parameter: { goodsCode: productCode}
            },{
                urlArr: ['main','comment','info'],
                parameter: {
                    modelCode: productCode
                }
            },
        ];

        if(module === 'combo' || module === 'shop'|| module === 'car'|| module === 'guide'){
            handArr[1].parameter.rateCode = req.query.rateCode
        }
        if(module==="skiPark" ||  module==="repast" || module==="route"){
            handArr.push({
                urlArr: [module,'detail','productItems'],
                parameter: { goodsCode: productCode,corpCode:'cgb2cfxs'}
            });
        }
        if(module==="ticket"){
            handArr.push({
                urlArr: [module,'detail','productItems'],
                parameter: { goodsCode: productCode,corpCode:'cgb2cfxs'}
            },{
                urlArr: ['main','comment','list'],
                parameter: {modelCode: productCode, currPage: '1', pageSize: '6', commentLevel: '0',},
            });
        }
        if (module === 'strategy'){
            handArr = handArr = [{
                urlArr: [module,'detail','main'],
                parameter: {
                    modelCode: productCode
                }
            }];
        }

        if (module === 'qr'){
            req.session.backDetailUrl = req.originalUrl;
            handArr = handArr = [{
                urlArr: ['qr','detail','main'],
                parameter: {
                    currPage:1,
                    pageSize:100,
                    modelCode: productCode
                }
            }
        ];
        }

        common.commonRequest({
            url: handArr,
            req: req,
            res: res,
            page: page,
            title: common.pageTitle(module) + '详情',
            callBack: function (results,reObj){
                reObj.module = module;
                reObj.productCode = productCode;
                reObj.rateCode=rateCode;

                if (module !== 'guide' && module !== 'strategy' && module !== 'qr'){
                    req.session.location = {
                        location: results[1].data.latitudeLongitude,
                        address: results[1].data.addr
                    };
                    req.session.content = results[1].data.content;
                    req.session.orderNotice = results[1].data.orderNotice;

                    if (module === 'hotel'){
                        reObj.beginDate = req.session.beginDate;
                        reObj.endDate = req.session.endDate;
                    }
                }
                if (module === 'qr'){
                    if (results[0].data.rows.length > 0)
                        req.session.orderNotice = results[0].data.rows[0].ydxz;
                }
            }
        });
    });

     //房型列表
    router.get('/detail/roomItems',function (req,res,next){
        req.session.beginDate = req.query.beginDate;
        req.session.endDate = req.query.endDate;
        req.session.numDays = req.query.numDays;
        delete req.query.numDays;
        //req.query.corpCode="cgb2cfxs";
        common.commonRequest({
            url: [{
                urlArr: ['hotel','detail','productItems'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results,reObj){
                // req.session.productItems = results[0].datas;
            }
        });
    });
    //房型图片
    router.get('/detail/picture',function (req,res,next){

        common.commonRequest({
            url: [{
                urlArr:['main','detailimgs'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results,reObj){
                // req.session.productItems = results[0].datas;
            }
        });
    });
    //地图
    router.get('/detail/location',function (req,res,next){
        var page = "location";
        var data = req.session[page]
        if(req.query.location){
            data = {
                address:req.query.address,
                location:req.query.location,
            };
        }
        res.render('detail/'+page,{data: data, title:'地图'});
    });
    // 详情详细页
    router.get('/detail/:page',function (req,res,next){
        var page = req.params.page;
        var data = req.session[page]
        // switch (page) {
        //     case "productItems":
        //         data = req.session.content;
        //         break;
        //     default:
        //         data = req.session[page];
        //         break;
        // }
        res.render('detail/content',{data: data, title:'详情'});
    });
};
