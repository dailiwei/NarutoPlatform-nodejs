/**
 * Created by dailiwei on 14/12/18.
 */
define([
        'dojo/_base/lang',
        "dojo/_base/declare",
        'dojo/on',
        "esri/layers/GraphicsLayer",
        'dojo/topic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/PictureMarkerSymbol',
        'dojo/_base/Color',
        'esri/graphic',
        'esri/geometry/Point',
        'dojo/_base/array',
        "esri/geometry/webMercatorUtils",
        'esri/geometry/Polyline'
    ],
    function (
        lang,
        declare,
        on,

        GraphicsLayer,
        topic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        PictureMarkerSymbol,
        Color,
        Graphic,
        Point,
        array,
        webMercatorUtils,
        Polyline
    ) {
        return declare("PlatMonitorLayer", GraphicsLayer, { // 中心监视图层


            centerSymbol: null,
            greenSymbol: null,
            redSymbol:null ,
            centerPoint: null,//中心点
            source: null,//数据点数组

            handlers:null,
            connects:null,
            constructor: function (args) {
                //初始化变量
                this.centerSymbol = new PictureMarkerSymbol("base/images/marker/marker_blue.png", 21, 21);
                this.greenSymbol = new PictureMarkerSymbol("images/map_11.png", 16, 16);
                this.redSymbol = new PictureMarkerSymbol("images/map_07.png", 16, 16);
                this.centerPoint = null;
                if(args.parameters.centerPoint){
                    this.centerPoint = new Point(Number(args.parameters.centerPoint.lgtd), Number(args.parameters.centerPoint.lttd));
                }
                this.source = [];
                this.handlers = [];
                this.connects = [];

                declare.safeMixin(this, args);

                this.id = args.parameters.layerName;
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = args.parameters.catalog;

                this.isTest = args.parameters.isTest?args.parameters.isTest:false;

                this.handlers.push(this.on("mouse-over", lang.hitch(this,this.mouseOverHandler)));
                this.handlers.push(this.on("mouse-out",  lang.hitch(this,this.mouseOutHandler)));
                this.handlers.push(this.on("click", lang.hitch(this,this.clickHandler)));

                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/data", lang.hitch(this, this.getData)));
                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/visible", lang.hitch(this, this.setVis)));

                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/center", lang.hitch(this, this.setCenter)));

            },
            mouseOutHandler:function(e){
                Logger.debug("mouseOutHandler"+e);
            },
            mouseOverHandler:function(e){
                Logger.debug("mouseOverHandler"+e);
            },
            clickHandler:function(e){
                Logger.debug("clickHandler"+e);
            },
            _setMap: function(){

                if(this.isTest){
                    //模拟后台数据返回
                    setTimeout(lang.hitch(this,function(){
                        this.getTestData();
                    }),5000);
                }

                return this.inherited(arguments);
            },
            getTestData: function () {

                var url = "simple/temp/platMonitor.json";
                var der = dojo.xhrPost({
                    url: url,
                    handleAs: "json",
                    content: {}
                });
                der.then(lang.hitch(this, function (json) {
                    if (json.success == true) {//成功返回
                        topic.publish("layer/"+this.catalog+"/data",json.data);
                    } else {
                        Logger.log("测试派发数据报错!!!");
                    }
                }));
            },

            destroy:function(){
                //移除监听
                var list = this.handlers;
                for (var i = 0, max = list.length; i < max; i++) {
                    var item = list[i];
                    item.remove();
                }
            },
            //更新中心点
            setCenter:function(data){
                this.centerPoint = new Point(Number(data.lgtd), Number(data.lttd));
            },

            getData: function (list) {
                this.source = list;
                this.clear();
                //先画线
                array.forEach(this.source, function (item) {
                    var ept = new Point(Number(item.lgtd), Number(item.lttd));
                    //加个判断对于曲线的顺序
                    var centerPtC = this.centerPoint;//webMercatorUtils.webMercatorToGeographic(this.centerPoint);
                    if (centerPtC.x < Number(item.lgtd)) {
                        this.add(this.createSpatialLine_S(centerPtC, ept, item.status));
                    } else {
                        this.add(this.createSpatialLine_N(centerPtC, ept, item.status));
                    }

                }, this);

                //画中心点
                //var p:Graphic = new Graphic(centerPoint,new SuperMarker(15,0xF061E0));
                var p = new Graphic(this.centerPoint, this.centerSymbol);
                this.add(p);
                //其他监视点
                array.forEach(this.source, function (item) {
                    var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 6, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#E3170D"), 1),
                        new dojo.Color("#FFFF66"));
                    if (item.status == "1") {//正常
                        symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 6, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#E3170D"), 1),
                            new dojo.Color("#FFFF66"));
                    }

                    var graphic = new Graphic(new Point(Number(item.lgtd), Number(item.lttd)), symbol, item);

                    this.add(graphic);
                }, this);

            },
            angle: 35,
            createSpatialLine_S: function (mp1, mp2, status) {
                var midp = this.getMidPoint(mp1, mp2);
                //逆时针
                //var x:Number = (midp.y-(m_firstpoints[0])["y"])*Math.tan(45)+midp.x;
                //var y:Number = ((m_firstpoints[0])["x"]-midp.x)*Math.tan(45)+midp.y;
                //顺时针
                var x = ((mp1)["y"] - midp.y) * Math.tan(this.angle) + midp.x;
                var y = (midp.x - (mp1)["x"]) * Math.tan(this.angle) + midp.y;
                //var x:Number = ((m_firstpoints[0])["y"]-(m_firstpoints[1])["y"])*Math.tan(40)+(m_firstpoints[0])["x"];
                //var y:Number = ((m_firstpoints[1])["x"]-(m_firstpoints[0])["x"])*Math.tan(40)+(m_firstpoints[0])["y"];
                var pp = new Point(x, y);
                var points = [];
                points.push(mp1, pp, mp2);
                var dgbj_geometry = this.getBezierPoints(points);
                var dgbj_geometry2 = new Array();
                //坐标转换
                array.forEach(dgbj_geometry, function (item) {
                    dgbj_geometry2.push(new Point(item.x, item.y));
                }, this);

                var pg = new Polyline();
                pg.addPath(dgbj_geometry2);
                if (status == "1") {//正常
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color("#48670E"), 2));

                } else if (status == "0") {//严重
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color("#E3170D"), 2));

                } else {//警告，status =="2"
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color("#F5831D"), 2));

                }
            },
            createSpatialLine_N: function (mp1, mp2, status) {
                var midp = this.getMidPoint(mp1, mp2);
                //逆时针
                var x = (midp.y - (mp1)["y"]) * Math.tan(this.angle) + midp.x;
                var y = ((mp1)["x"] - midp.x) * Math.tan(this.angle) + midp.y;
                //顺时针
                //var x:Number = ((mp1)["y"]-midp.y)*Math.tan(angle)+midp.x;
                //var y:Number = (midp.x-(mp1)["x"])*Math.tan(angle)+midp.y;
                //var x:Number = ((m_firstpoints[0])["y"]-(m_firstpoints[1])["y"])*Math.tan(40)+(m_firstpoints[0])["x"];
                //var y:Number = ((m_firstpoints[1])["x"]-(m_firstpoints[0])["x"])*Math.tan(40)+(m_firstpoints[0])["y"];
                var pp = new Point(x, y);
                var points = [];
                points.push(mp1, pp, mp2);
                var dgbj_geometry = this.getBezierPoints(points);
                var dgbj_geometry2 = new Array();
                //坐标转换
                array.forEach(dgbj_geometry, function (item) {
                    dgbj_geometry2.push(new Point(item.x, item.y));
                }, this);

                var pg = new Polyline();
                pg.addPath(dgbj_geometry2);

                //return new Graphic(pg,new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 3));

                if (status == "1") {//正常
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#48670E"), 2));

                } else if (status == "0") {//严重
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color("#E3170D"), 2));
                } else {//警告
                    return new Graphic(pg, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color("#F5831D"), 2));
                }
            },
            getMidPoint: function (sp, ep) {
                var midx = (sp.getLongitude() + ep.getLongitude()) / 2;
                var midy = (sp.getLatitude() + ep.getLatitude()) / 2;

                return new Point(midx, midy);
            },
            getBezierPoints: function (param1) {
                var _loc_5 = NaN;
                var _loc_6 = NaN;
                var _loc_7 = 0;
                var _loc_8 = NaN;
                var _loc_9 = NaN;
                var _loc_10 = NaN;
                if (param1.length <= 2) {
                    return param1;
                }
                var _loc_2 = new Array();
                var _loc_3 = param1.length - 1;
                var _loc_4 = 0;
                while (_loc_4 <= 1) {
                    _loc_5 = 0;
                    _loc_6 = 0;
                    _loc_7 = 0;
                    while (_loc_7 <= _loc_3) {
                        _loc_8 = this.getBinomialFactor(_loc_3, _loc_7);
                        _loc_9 = Math.pow(_loc_4, _loc_7);
                        _loc_10 = Math.pow(1 - _loc_4, _loc_3 - _loc_7);
                        _loc_5 = _loc_5 + _loc_8 * _loc_9 * _loc_10 * param1[_loc_7].x;
                        _loc_6 = _loc_6 + _loc_8 * _loc_9 * _loc_10 * param1[_loc_7].y;
                        _loc_7++;
                    }
                    _loc_2.push(new Point(_loc_5, _loc_6));
                    _loc_4 = _loc_4 + 0.01;
                }
                _loc_2.push(param1[_loc_3]);
                return _loc_2;
            },
            getBinomialFactor: function (param1, param2) {
                return this.getFactorial(param1) / (this.getFactorial(param2) * this.getFactorial(param1 - param2));
            },
            getFactorial: function (param1) {
                if (param1 <= 1) {
                    return 1;
                }
                if (param1 == 2) {
                    return 2;
                }
                if (param1 == 3) {
                    return 6;
                }
                if (param1 == 4) {
                    return 24;
                }
                if (param1 == 5) {
                    return 120;
                }
                var _loc_2 = 1;
                var _loc_3 = 1;
                while (_loc_3 <= param1) {

                    _loc_2 = _loc_2 * _loc_3;
                    _loc_3++;
                }
                return _loc_2;
            },
            currentVis:null,
            setVis: function (vis) {
                this.currentVis = vis;
                this.setVisibility(vis);
            }
        });
    });