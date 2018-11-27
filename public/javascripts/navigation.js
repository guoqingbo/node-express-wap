$(function () {
    var  settings = {
        module:$("#allmap").data("module"),
        map:"",
        point:"",
        tabNav:$(".map-tab-item"),
        tabSelectInde : 0,
        type: {
            park:"景区",
            hotel:"酒店",
            toilet:"厕所",
            parkingLot:"停车场"
        },
        nowAddressName:"",
    }
    var utils = {
        getTypeKey:function (val) {
            var keyStr = "park";
            for (var key in settings.type) {
                if(settings.type[key] === val){
                    keyStr =  key;
                    break;
                }
            }
            return keyStr
        },
        getTypeVal:function (key) {
            return settings.type[key]
        },
        getTypeValArr:function () {
            var keyArr = [];
            for (var key in settings.type) {
                keyArr.push(settings.type[key])
            }
            return keyArr
        },
        getInfoHtml:function (content,type) {
            var htmlStr = '';
            var locationStr ="";
            var address = ""
            switch (type) {
                case "baiduMap":
                    locationStr = content.point.lng+","+content.point.lat;
                    address = content.address;
                    htmlStr =
                        '<div class="map-tab-img-box">' +
                            '<img src="/images/demo/foods-list1.jpg" alt="图片" class="map-tab-img">' +
                        '</div>' +
                        '<div class="map-tab-info">' +
                            '<p class="map-tab-title">' +content.title+ '<span class="map-tab-scroe"></span></p>' +
                            '<p class="map-tab-telphone">电话：'+ (content.phoneNumber?content.phoneNumber:"无") +'</p>' +
                            '<p class="map-tab-addr">地址：'+content.address+'</p>'+
                        '</div>' +
                        '<a href="/detail/location?location='+locationStr+'&address='+address+'" class="map-tab-go">' +
                            '<p class="go-icon-box"><i class="icon iconfont icon-quzheli"></i></p>' +
                            '<span>到这里去</span>' +
                        '</a>'
                    break;
                case "post":
                    locationStr = content.latitudeLongitude;
                    address = content.mapName;
                    var pic = content.pic? content.pic : "/images/demo/foods-list1.jpg";
                    htmlStr =
                        '<div class="map-tab-img-box">' +
                            '<img src='+pic+' alt="图片" class="map-tab-img">' +
                        '</div>' +
                        '<div class="map-tab-info">' +
                            '<p class="map-tab-title">'+content.mapName+'<span class="map-tab-scroe"> '+(content.avgScore?content.avgScore:"0")+'分</span></p>' +
                            '<p class="map-tab-telphone">电话：'+content.tel+'</p>' +
                            '<p class="map-tab-price"><span class="map-tab-icon-price">￥</span>'+(content.price?content.price:"0")+'</p>'+
                        '</div>' +
                        '<a href="/detail/location?location='+locationStr+'&address='+address+'" class="map-tab-go">' +
                            '<p class="go-icon-box"><i class="icon iconfont icon-quzheli"></i></p>' +
                            '<span>到这里去</span>' +
                        '</a>'
                    break;
            }
            return htmlStr;
        }
    };
    var common = {
        init: function(){
            common.createMap();
            common.btnSearch();
            if(settings.module != "index"){
                //不为首页
                common.autocomplete();
                common.mapClick()
            }
        },
        tab: function () {
            //选项卡切换
            settings.tabNav.click(function () {
                var text = $(this).text()
                settings.tabSelectInde = $(this).index();
                $(this).siblings().removeClass("active");
                $(this).addClass("active")
                $(".map-tab-content").css({transform:"translateX("+ (-  settings.tabSelectInde*100) +"%)"})
                if(text == "全部"){
                    text = utils.getTypeValArr()
                }
                $.when(
                    common.searchAround(text), //搜索附近
                    common.getMapguideInfo(settings.point,utils.getTypeKey(text))//添加后台数据图标
                ).then(function (res1, res2){
                   //设置选项卡内容
                    common.setTabcontent(res1,res2)
                });

            })
            settings.tabNav.eq(0).trigger("click")
        },
        createMap:function(){
            settings.map = new BMap.Map("allmap");
            var geolocation = new BMap.Geolocation();  //实例化定位对象。
            geolocation.getCurrentPosition(function (r) {   //定位结果对象会传递给r变量 r.point.lng 经度 r.point.lat 纬度
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {  //通过Geolocation类的getStatus()可以判断是否成功定位。
                    settings.point = r.point
                    settings.map.centerAndZoom(settings.point, 12);//设定地图的中心点和坐标并将地图显示在地图容器中
                    var mk = new BMap.Marker(settings.point);    //基于定位的这个点的点位创建marker
                    settings.map.addOverlay(mk);    //将marker作为覆盖物添加到map地图上
                    settings.map.panTo(settings.point);   //将地图中心点移动到定位的这个点位置。注意是r.point而不是r对象。

                    var keyArr = utils.getTypeValArr();
                    var myGeo = new BMap.Geocoder();
                    // 根据坐标得到地址描述
                    myGeo.getLocation(r.point, function(result){
                        if (result.surroundingPois[0].title){
                            //搜索周边
                            keyArr.unshift(result.surroundingPois[0].title);
                            common.searchAround(keyArr)
                        }else{
                            common.searchAround(keyArr)
                        }
                    });
                    //添加控件
                    settings.map.addControl(new BMap.NavigationControl({
                        anchor: BMAP_ANCHOR_TOP_RIGHT,
                        type: BMAP_NAVIGATION_CONTROL_SMALL,
                        offset: new BMap.Size(10, 100)
                    }));

                    //初始化选项卡
                    common.tab();
                } else {
                   alert("定位失败")
                }
            }, {enableHighAccuracy: true});
        },
        btnSearch:function(){
            $("#searchBtn").click(function (e) {
                var typeArr = utils.getTypeValArr();
                var myValue = $("#searchInput").val();
                if (myValue){
                    typeArr.unshift(myValue)
                }
                common.searchAround(typeArr)
            })
        },
        searchAround: function (keyWord) {
            var deferred = $.Deferred();
            settings.map.clearOverlays()
            // 范围区域
            var circle = new BMap.Circle(settings.point, 1000, {
                fillColor: "#ccc",
                strokeWeight: 1,
                fillOpacity: 0.2,
                strokeOpacity: 0.2
            });
            settings.map.addOverlay(circle);
            var local = new BMap.LocalSearch(settings.map, {
                renderOptions: {
                    // map: settings.map,
                    // panel:"test",
                    autoViewport: true,
                    selectFirstResult:false
                },
                onSearchComplete: function (results) {
                    var content = ""
                    if(Array.isArray(results)){
                        for (var i = 0 ;i<results.length;i++) {
                            for (var j = 0 ;j<results[i].Ar.length;j++) {
                                var point = results[i].Ar[j].point
                                common.addMark(point)
                            }
                        }
                    }else{
                        for (var i = 0 ;i<results.Ar.length;i++) {
                            var point = results.Ar[i].point
                            common.addMark(point)
                        }
                    }
                    deferred.resolve(results)
                    // common.setTabcontent(results)
                },
                onMarkersSet:function (pois) {
                    for(var i=0;i<pois.length;i++){
                        common.markerClick(pois[i])
                    }
                }
            });
            local.searchNearby(keyWord, settings.point, 1000);
            return deferred
        },
        autocomplete: function () {
            var bmapAutocomplete = new BMap.Autocomplete({"input": "searchInput", "location": settings.map});
            bmapAutocomplete.addEventListener("onconfirm", function (e) {
                var _value = e.item.value;
                var myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                var myGeo = new BMap.Geocoder();// 将地址解析结果显示在地图上,并调整地图视野
                myGeo.getPoint(myValue, function(point){
                    if (point) {
                        settings.point = point;
                        settings.map.centerAndZoom(settings.point, 12);

                        // settings.map.clearOverlays()
                        // var mk = new BMap.Marker(settings.point);
                        // console.log(mk)
                        // settings.map.addOverlay(mk);
                        var typeArr = utils.getTypeValArr();
                        typeArr.unshift(myValue)
                        common.searchAround(typeArr)
                    }
                });

                // var local = new BMap.LocalSearch(settings.map, {
                //     onSearchComplete: function () {
                //         settings.point = local.getResults().getPoi(0).point;
                //         settings.map.centerAndZoom(settings.point, 12);
                //         settings.map.addOverlay(new BMap.Marker(settings.point));
                //         // common.searchAround(utils.getTypeValArr())
                //     }
                // });
                // local.search(myValue);
            });
        },
        openInfoWindow:function(point,content,type){
            if(!content){
                return
            }
            var htmlStr = utils.getInfoHtml(content,type)
            var infoWindow = new BMap.InfoWindow(htmlStr,{
                width : 300,     // 信息窗口宽度
            });  // 创建信息窗口对象
            settings.map.openInfoWindow(infoWindow,point); //开启信息窗口
        },
        markerClick:function (poisItem) {
            // poisItem.marker.addEventListener("click",function(e) {
            //     console.log()
            //     // common.setTabcontent(poisItem)
            //     if(poisItem.type === "post"){
            //         //自定义提示框
            //         var point = poisItem.data.latitudeLongitude.split(",")
            //         var content =  poisItem.data;
            //         common.openInfoWindow(new BMap.Point(point[0], point[1]),content,"post")
            //     }
            // });
        },
        setTabcontent:function (results,postData) {
            var contentEle = $(".map-tab-content").eq(settings.tabSelectInde);
            var htmlStr = "";
            if(postData){
                var data = postData[0][0].data
                for (var i = 0 ;i<data.length;i++) {
                    htmlStr += '<li class="map-content-item">'+utils.getInfoHtml(data[i],"post")+'</li>';
                }
            }
            if(results){
                //百度获取数据
                if(Array.isArray(results)){
                    for (var i = 0 ;i<results.length;i++) {
                        for (var j = 0 ;j<results[i].Ar.length;j++) {
                            htmlStr += '<li class="map-content-item">'+utils.getInfoHtml(results[i].Ar[j],"baiduMap")+'</li>';
                        }
                    }
                }else{
                    for (var i = 0 ;i<results.Ar.length;i++) {
                        htmlStr += '<li class="map-content-item">'+utils.getInfoHtml(results.Ar[i],"baiduMap")+'</li>';
                    }
                }
            }
            contentEle.find(".map-content-list").html(htmlStr)
        },
        addMark:function(point,type,data){
            var mk = new BMap.Marker(point);
            settings.map.addOverlay(mk);
            // common.markerClick({
            //     marker:mk,
            //     type:type,
            //     data:data
            // })
        },
        getMapguideInfo:function (point,type) {
            settings.map.clearOverlays();
            return  $.ajax({
                type: 'POST',
                url: "/navigation",
                data: {
                    longitude: point.lng,
                    latitude: point.lat,
                    type: type,
                },
                dataType: 'json',
                success: function (res) {
                    if(res[0].status === 200){
                        var data = res[0].data;
                        // common.setTabcontent(data,"post")
                        for (var i = 0 ;i<data.length;i++) {
                            var point = data[i].latitudeLongitude.split(",")
                            if(point){
                                common.addMark(new BMap.Point(point[0], point[1]),"post", data[i])
                            }
                        }
                    }else{
                        alert("远程获取数据错误")
                    }
                },
                error: function (data) {
                    console.log(data)
                }
            });
        },
        mapClick:function () {
            var myGeo = new BMap.Geocoder();
            settings.map.addEventListener("click", function(e){
                var pt = e.point;
                myGeo.getLocation(pt, function(rs){
                    common.openInfoWindow(rs.point,rs.surroundingPois[0],"baiduMap")
                });
            });
        }
    }
    common.init()
});

