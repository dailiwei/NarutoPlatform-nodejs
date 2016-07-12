define([
    'dojo/_base/lang',
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/Color",
    "dojo/_base/connect",
    'dojo/topic',
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    'esri/symbols/SimpleLineSymbol',
    "esri/symbols/TextSymbol",

    "esri/dijit/PopupTemplate",
    "esri/layers/GraphicsLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "jimu/richway/component/RainChartPanel",
    "jimu/richway/component/RainWaterChartPanel",
    "jimu/richway/component/VideoPanel",
    "jimu/richway/component/WaterChartPanel",
    "esri/geometry/webMercatorUtils",
    "dijit/Tooltip"

], function (
        lang,
        declare,
        arrayUtils,
        Color,
        connect,
        topic,
        SpatialReference,
        Point,
        Extent,
        Graphic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        TextSymbol,
        PopupTemplate,
        GraphicsLayer,
        ClassBreaksRenderer,
        PictureMarkerSymbol,
        RainChartPanel,
        RainWaterChartPanel,
        VideoPanel,
        WaterChartPanel,
        webMercatorUtils,
        Tooltip
) {
    return declare([GraphicsLayer], {
        constructor: function () {
            // options:
            //   data:  Object[]
            //     Array of objects. Required. Object are required to have properties named x, y and attributes. The x and y coordinates have to be numbers that represent a points coordinates.
            //   distance:  Number?
            //     Optional. The max number of pixels between points to group points in the same cluster. Default value is 50.
            //   labelColor:  String?
            //     Optional. Hex string or array of rgba values used as the color for cluster labels. Default value is #fff (white).
            //   labelOffset:  String?
            //     Optional. Number of pixels to shift a cluster label vertically. Defaults to -5 to align labels with circle symbols. Does not work in IE.
            //   resolution:  Number
            //     Required. Width of a pixel in map coordinates. Example of how to calculate:
            //     map.extent.getWidth() / map.width
            //   showSingles:  Boolean?
            //     Optional. Whether or graphics should be displayed when a cluster graphic is clicked. Default is true.
            //   singleSymbol:  MarkerSymbol?
            //     Marker Symbol (picture or simple). Optional. Symbol to use for graphics that represent single points. Default is a small gray SimpleMarkerSymbol.
            //   singleTemplate:  PopupTemplate?
            //     PopupTemplate</a>. Optional. Popup template used to format attributes for graphics that represent single points. Default shows all attributes as "attribute = value" (not recommended).
            //   maxSingles:  Number?
            //     Optional. Threshold for whether or not to show graphics for points in a cluster. Default is 1000.
            //   webmap:  Boolean?
            //     Optional. Whether or not the map is from an ArcGIS.com webmap. Default is false.
            //   spatialReference:  SpatialReference?
            //     Optional. Spatial reference for all graphics in the layer. This has to match the spatial reference of the map. Default is 102100. Omit this if the map uses basemaps in web mercator.
            var options = {};
            this._isclusterNow = options.now || true;
            this._clusterTolerance = options.distance || 100;
            this._clusterData = this.getNewList((options.data || []));
            this._clusters = [];
            this._clusterLabelColor = options.labelColor || "#000";
            // labelOffset can be zero so handle it differently
            this._clusterLabelOffset = (options.hasOwnProperty("labelOffset")) ? options.labelOffset : -5;
            // graphics that represent a single point
            this._singles = []; // populated when a graphic is clicked
            this._showSingles = options.hasOwnProperty("showSingles") ? options.showSingles : false;
            // symbol for single graphics
            var SMS = SimpleMarkerSymbol;
            this._singleSym = options.singleSymbol || new SMS("circle", 6, null, new Color("#888"));
            this._singleTemplate = options.singleTemplate || new PopupTemplate({"title": "", "description": "{*}"});
            this._maxSingles = options.maxSingles || 1000;

            this._webmap = options.hasOwnProperty("webmap") ? options.webmap : false;

            this._sr = options.spatialReference || new SpatialReference({"wkid": 102100});

            this._zoomEnd = null;

            topic.subscribe("getDataPopWindow", lang.hitch(this, this.popWindow));
            topic.subscribe("changeGraphicsSize", lang.hitch(this, this.changeSize));
            topic.subscribe("setClusterIsOk", lang.hitch(this, this.setClusterIsOk));

            this.on("mouse-over", function (evt) {
                this.getMap().setMapCursor("pointer");
                var selected = evt.graphic;
                var item = selected.attributes;
                Tooltip.show(item.data.stnm, evt.graphic.getNode());
            });

            this.on("mouse-out", function (evt) {
                this.getMap().setMapCursor("default");
                Tooltip.hide(evt.graphic.getNode());
            });

        },

        _setMap: function (map, surface) {
            this._clusterResolution = map.extent.getWidth() / map.width; // probably a bad default...
            this._clusterGraphics();

            this._zoomEnd = connect.connect(map, "onZoomEnd", this, function () {
                if(this.type == "common")return;
                this._clusterResolution = this._map.extent.getWidth() / this._map.width;
                this.clear();
                this._clusterGraphics();
            });

            var div = this.inherited(arguments);
            return div;
        },

        _unsetMap: function () {
            this.inherited(arguments);
            connect.disconnect(this._zoomEnd);
        },

        add: function (p) {
            if (p.declaredClass) {
                this.inherited(arguments);
                return;
            }

            this._clusterData.push(p);
            var clustered = false;
            for (var i = 0; i < this._clusters.length; i++) {
                var c = this._clusters[i];
                if (this._clusterTest(p, c)) {
                    this._clusterAddPoint(p, c);
                    this._updateClusterGeometry(c);
                    this._updateLabel(c);
                    clustered = true;
                    break;
                }
            }

            if (!clustered) {
                this._clusterCreate(p);
                p.attributes.clusterCount = 1;
                this._showCluster(p);
            }
        },

        clear: function () {
            this.inherited(arguments);
            this._clusters.length = 0;
        },

        clearSingles: function (singles) {
            var s = singles || this._singles;
            arrayUtils.forEach(s, function (g) {
                this.remove(g);
            }, this);
            this._singles.length = 0;
        },

        onClick: function (e) {
            this.clearSingles(this._singles);

            var singles = [];
            for (var i = 0, il = this._clusterData.length; i < il; i++) {
                if (e.graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId) {
                    singles.push(this._clusterData[i]);
                }
            }
            if (singles.length > this._maxSingles) {
                alert("Sorry, that cluster contains more than " + this._maxSingles + " points. Zoom in for more detail.");
                return;
            } else {
                e.stopPropagation();
                if(singles.length<=1){
                    //直接弹出对应的window
                    var selected = e.graphic;
                    var item = selected.attributes;

                    this.createPopWindow(item.data);
                }
                else{

                    var extent = this.getSinglesExtent(singles);
                    this._map.setExtent(extent.expand(2));
                }
            }
        },

        _clusterGraphics: function () {
            // first time through, loop through the points
            for (var j = 0, jl = this._clusterData.length; j < jl; j++) {
                // see if the current feature should be added to a cluster
                var point = this._clusterData[j];
                var clustered = false;
                var numClusters = this._clusters.length;
                for (var i = 0; i < this._clusters.length; i++) {
                    var c = this._clusters[i];
                    if (this._clusterTest(point, c)) {
                        this._clusterAddPoint(point, c);
                        clustered = true;
                        break;
                    }
                }

                if (!clustered) {
                    this._clusterCreate(point);
                }
            }
            this._showAllClusters();
        },

        _clusterTest: function (p, cluster) {
            if (this._isclusterNow) {
                var distance = (
                Math.sqrt(
                    Math.pow((cluster.x - p.x), 2) + Math.pow((cluster.y - p.y), 2)
                ) / this._clusterResolution
                );
                return (distance <= this._clusterTolerance);
            } else {
                return false;
            }

        },

        // points passed to clusterAddPoint should be included
        // in an existing cluster
        // also give the point an attribute called clusterId
        // that corresponds to its cluster
        _clusterAddPoint: function (p, cluster) {
            // average in the new point to the cluster geometry
            var count, x, y;
            count = cluster.attributes.clusterCount;
            x = (p.x + (cluster.x * count)) / (count + 1);
            y = (p.y + (cluster.y * count)) / (count + 1);
            cluster.x = x;
            cluster.y = y;

            // build an extent that includes all points in a cluster
            // extents are for debug/testing only...not used by the layer
            if (p.x < cluster.attributes.extent[0]) {
                cluster.attributes.extent[0] = p.x;
            } else if (p.x > cluster.attributes.extent[2]) {
                cluster.attributes.extent[2] = p.x;
            }
            if (p.y < cluster.attributes.extent[1]) {
                cluster.attributes.extent[1] = p.y;
            } else if (p.y > cluster.attributes.extent[3]) {
                cluster.attributes.extent[3] = p.y;
            }

            // increment the count
            cluster.attributes.clusterCount++;
            // attributes might not exist
            if (!p.hasOwnProperty("attributes")) {
                p.attributes = {};
            }
            // give the graphic a cluster id
            p.attributes.clusterId = cluster.attributes.clusterId;
        },

        // point passed to clusterCreate isn't within the
        // clustering distance specified for the layer so
        // create a new cluster for it
        _clusterCreate: function (p) {
            var clusterId = this._clusters.length + 1;
            // Logger.log("cluster create, id is: ", clusterId);
            // p.attributes might be undefined
            if (!p.attributes) {
                p.attributes = {};
            }
            p.attributes.clusterId = clusterId;
            // create the cluster
            var cluster = {
                "x": p.x,
                "y": p.y,
                "data":p,
                "attributes": {
                    "clusterCount": 1,
                    "clusterId": clusterId,
                    "extent": [p.x, p.y, p.x, p.y]
                }
            };
            this._clusters.push(cluster);
        },

        _showAllClusters: function () {
            for (var i = 0, il = this._clusters.length; i < il; i++) {
                var c = this._clusters[i];
                this._showCluster(c);
            }
        },

        _showCluster: function (c) {
            var point = new Point(c.x, c.y, this._sr);
            var symbol2 = this.getSymbolBySttp(c.data);
            var symbol = new PictureMarkerSymbol("images/icon_cluster.png", 24, 24);

            //this.add(
            //    new Graphic(
            //        point,
            //        null,
            //        c.attributes
            //    )
            //);

            // code below is used to not label clusters with a single point
            if (c.attributes.clusterCount == 1) {
                this.add(
                    new Graphic(
                        point,
                        symbol2,
                        c
                    )
                );
                return;
            }else{
                //判断下里面有没有预警的
                var newsymbol = this._getStatusSymbol(c.attributes.clusterId);
                this.add(
                    new Graphic(
                        point,
                        newsymbol,
                        c.attributes
                    )
                );
            }

            // show number of points in the cluster
            var label = new TextSymbol(c.attributes.clusterCount)
                .setColor(new Color(this._clusterLabelColor))
                .setOffset(0, this._clusterLabelOffset);
            this.add(
                new Graphic(
                    point,
                    label,
                    c.attributes
                )
            );
        },
        _getStatusSymbol:function(clusterId){
            var warn = false;
            var status  = false;
            for (var i = 0, il = this._clusterData.length; i < il; i++) {
                if (clusterId == this._clusterData[i].attributes.clusterId) {
                    var item = this._clusterData[i];
                    warn = item.isWarnSt == "1"?true:false;
                    if(warn)break;//有一个预警的肯定是红色了

                    var status1 = item.sm.status=="0"?true:false;//获取状态
                    if(status1){
                        status = true;
                    }

                }
            }

            var symbol = new PictureMarkerSymbol(this._getStationIcon(null,warn,status), 24, 24);

            return symbol;
        },
        _getStationIcon:function (sttp,warn,status){
            //先判断是否预警,icon分类啊，1，0，2,正常，异常，预警
            if(warn){//如果预警了
                return "images/32/32-6.png";
            }else{
                if(status){
                    return "images/32/32-1.png";
                }else{
                    return "images/32/32-2.png";
                }
            }
            return  "images/icon_cluster.png";
        },

        _addSingles: function (singles) {
            // add single graphics to the map
            arrayUtils.forEach(singles, function (p) {
                var g = new Graphic(
                    new Point(p.x, p.y, this._sr),
                    this._singleSym,
                    p.attributes,
                    this._singleTemplate
                );
                this._singles.push(g);
                if (this._showSingles) {
                    this.add(g);
                }
            }, this);
            this._map.infoWindow.setFeatures(this._singles);
        },

        _updateClusterGeometry: function (c) {
            // find the cluster graphic
            var cg = arrayUtils.filter(this.graphics, function (g) {
                return !g.symbol &&
                    g.attributes.clusterId == c.attributes.clusterId;
            });
            if (cg.length == 1) {
                cg[0].geometry.update(c.x, c.y);
            } else {
                Logger.log("didn't find exactly one cluster geometry to update: ", cg);
            }
        },

        _updateLabel: function (c) {
            // find the existing label
            var label = arrayUtils.filter(this.graphics, function (g) {
                return g.symbol &&
                    g.symbol.declaredClass == "esri.symbol.TextSymbol" &&
                    g.attributes.clusterId == c.attributes.clusterId;
            });
            if (label.length == 1) {
                // Logger.log("update label...found: ", label);
                this.remove(label[0]);
                var newLabel = new TextSymbol(c.attributes.clusterCount)
                    .setColor(new Color(this._clusterLabelColor))
                    .setOffset(0, this._clusterLabelOffset);
                this.add(
                    new Graphic(
                        new Point(c.x, c.y, this._sr),
                        newLabel,
                        c.attributes
                    )
                );
                // Logger.log("updated the label");
            } else {
                Logger.log("didn't find exactly one label: ", label);
            }
        },

        // debug only...never called by the layer
        _clusterMeta: function () {
            // print total number of features
            Logger.log("Total:  ", this._clusterData.length);

            // add up counts and print it
            var count = 0;
            arrayUtils.forEach(this._clusters, function (c) {
                count += c.attributes.clusterCount;
            });
            Logger.log("In clusters:  ", count);
        },
        //////
        //获取这个集合的extent，定位
        getSinglesExtent:function (singles){

            var xmin;
            var ymin;
            var xmax;
            var ymax;
            var lg =singles.length;

            var x=[];
            var y=[];
            //alert(Math.max.apply(null, x));//最大值
            //alert(Math.min.apply(null, x));//最小值
            //
            for(var i=0;i<lg;i++){
                x.push(singles[i].x);
                y.push(singles[i].y);
            }

            xmin = Math.min.apply(null, x);
            ymin = Math.min.apply(null, y);
            xmax = Math.max.apply(null, x);
            ymax = Math.max.apply(null, y);

            return new Extent(xmin,ymin,xmax,ymax,this._sr);

        },
        createPopWindow:function(item){//弹出对应的面板
            var panel;
            switch (item.sttp) {
                case "PP"://雨量站

                    panel = new RainChartPanel({
                        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                        label: "",
                        data: item
                    });

                    this.getMap().infoWindow.setContent(panel.domNode);
                    this.getMap().infoWindow.show(new Point(item.lgtd, item.lttd));
                    this.getMap().infoWindow.resize(435,320);
                    break;
                case "ZP"://同位站
                case "RP"://同位站
                    panel = new RainWaterChartPanel({
                        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                        label: "",
                        data: item
                    });
                    this.getMap().infoWindow.setContent(panel.domNode);
                    //html.setStyle(this.getMap().infoWindow.domNode, 'width', "600px");
                    //html.setStyle(this.getMap().infoWindow.domNode, 'height', "400px");
                    this.getMap().infoWindow.show(new Point(item.lgtd, item.lttd));
                    this.getMap().infoWindow.resize(435,320);
                    break;
                case "RR"://水库站
                case "ZZ"://河道站
                    panel = new WaterChartPanel({
                        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                        label: "",
                        data: item
                    });
                    this.getMap().infoWindow.setContent(panel.domNode);
                    //html.setStyle(this.getMap().infoWindow.domNode, 'width', "600px");
                    //html.setStyle(this.getMap().infoWindow.domNode, 'height', "400px");
                    this.getMap().infoWindow.show(new Point(item.lgtd, item.lttd));
                    this.getMap().infoWindow.resize(435,320);
                    break;
                case "VV"://视频站

                    var panel = new VideoPanel({
                        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                        label: "视频站:"+item.stnm,
                        stcd: item.stcd
                    });

                    this.getMap().infoWindow.setContent(panel.domNode);
                    //html.setStyle(this.getMap().infoWindow.domNode, 'width', "600px");
                    //html.setStyle(this.getMap().infoWindow.domNode, 'height', "400px");
                    this.getMap().infoWindow.show(new Point(item.lgtd, item.lttd));
                    this.getMap().infoWindow.resize(435,320);

                    break;
                case "SS"://墒情站
                case "II"://图像站
                case "DR"://排水站
                case "MM"://气象站
                case "BB"://蒸发站
                case "DD"://堰闸

                    return;
                default:
                    return;
            }
        },
        size:11,//图片大小
        getSymbolBySttp: function (item) {
            //类型	代码		类型	   		代码
            //气象站	MM		雨量站		PP
            //蒸发站	BB		河道水位水文站	ZZ
            //堰闸水文站	DD		水库水文站		RR
            //潮位站	TT		地下水站		ZG
            //泵站		DP		分洪水位站		ZB
            //墒情站	SS		视频站		VV
            //图像站	II		排水站		DR
            var PointSymbol = new SimpleMarkerSymbol();
            var sls = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([0,0,0,0.3]),
                1
            );
            PointSymbol.setOutline(sls);
            var sttp = item.sttp;
            var status = item.sm.status=="0"?true:false;//获取状态
            var warn = item.isWarnSt == "1"?true:false;

            switch (sttp) {
                case "PP"://雨量站
                case "ZP"://同位站
                case "RP"://同位站
                    if(warn){//如果预警了
                        PointSymbol = new PictureMarkerSymbol("images/20/PP_2.png", this.size, this.size);
                    }else{
                        if(status){
                            PointSymbol = new PictureMarkerSymbol("images/20/PP_0.png", this.size, this.size);
                        }else{
                            PointSymbol = new PictureMarkerSymbol("images/20/PP_1.png", this.size, this.size);
                            //根据不同数值不同图片了
                            //PointSymbol = new PictureMarkerSymbol(this.getImageByDrp(item.sumdrp), this.size, this.size);
                        }
                    }
                    break;
                case "RR"://水库站
                    PointSymbol.style = SimpleMarkerSymbol.STYLE_SQUARE;//正方形
                    PointSymbol.setSize(this.size-2);
                    if(warn){//如果预警了
                        PointSymbol.setColor(new dojo.Color("red"));
                    }else{
                        if(status){
                            PointSymbol.setColor(new dojo.Color("gray"));
                        }else{
                            PointSymbol.setColor(new dojo.Color("#208e3e"));
                        }
                    }


                    break;
                case "ZZ"://河道站
                    if(item.stnm=="万安坝"){
                        Logger.log(item);
                    }
                    PointSymbol.setPath("M 100 100 L 300 100 L 200 -100 z");//正三角
                    PointSymbol.setSize(this.size-2);
                    if(warn){//如果预警了
                        PointSymbol.setColor(new dojo.Color("red"));
                    }else{
                        if(status){
                            PointSymbol.setColor(new dojo.Color("gray"));
                        }else{
                            PointSymbol.setColor(new dojo.Color("#208e3e"));
                        }
                    }
                    break;

                case "SS"://墒情站
                case "II"://图像站
                case "DR"://排水站
                case "MM"://气象站
                case "BB"://蒸发站
                case "DD"://堰闸
                case "VV"://视频站
                    if(status){
                        PointSymbol = new PictureMarkerSymbol("images/20/"+sttp+"_0.png", this.size, this.size);
                    }else{
                        PointSymbol = new PictureMarkerSymbol("images/20/"+sttp+"_1.png", this.size, this.size);
                    }
                    break;
                default:
                    PointSymbol =  new PictureMarkerSymbol("images/icon.gif", this.size, this.size);
                    break;
            }

            return PointSymbol;

        },
        getImageByDrp:function (dropRain){
            var colorStr = "PP_1";
            if (dropRain == 0||dropRain==""||dropRain=="--")
            {
                colorStr='/R20X20/20-7';
            }
            else if ((dropRain > 0 && dropRain < 10) || dropRain == 10)
            {
                colorStr='/R20X20/20-6';
            }
            else if ((dropRain > 10 && dropRain < 25) || dropRain == 25)
            {
                colorStr='/R20X20/20-5';
            }
            else if ((dropRain > 25 && dropRain < 50) || dropRain == 50)
            {
                colorStr='/R20X20/20-4';
            }
            else if ((dropRain > 50 && dropRain < 100) || dropRain == 100)
            {
                colorStr='/R20X20/20-3';
            }
            else if ((dropRain > 100 && dropRain < 250) || dropRain == 250)
            {
                colorStr='/R20X20/20-2';
            }
            else//大于250
            {
                colorStr='/R20X20/20-1';
            }
            return "images/"+colorStr+".png";
        },

        popWindow:function (type,stcd,lgtd,lttd){
            if(this.type==type){//判断是不是自己的这个图层组的
                //先定位
                this.getMap().centerAt(new Point(lgtd,lttd)).then(lang.hitch(this,function(){

                    this.getMap().setLevel(13).then(lang.hitch(this,function(){

                        //定位之后，弹框
                        var list = this._clusterData;
                        var length = list.length;
                        for(var i=0;i<length;i++){
                            if(this._clusterData[i]["stcd"]==stcd){
                                setTimeout(lang.hitch(this,function(){
                                    this.createPopWindow(this._clusterData[i]);
                                },500));
                                break;
                            }
                        }
                    }));
                }));
            }
        },
        changeSize:function(size){//1，2，3 大中小

            this.size = size;
            this.showSymbol(this._clusterData);
        },
        type:"",
        firstLoad:false,
        currentList:[],
        showSymbol: function (list) {

            this._clusterTolerance =  (this._map.spatialReference.wkid==4326?8000000:100);
            this._clusterData = this.getNewList(list);
            if (this.firstLoad) {
                this.firstLoad = false;
                return;
            }
            //重新计算数据
            this._clusterResolution = this._map.extent.getWidth() / this.getMap().width;
            this.clear();
            this._clusterGraphics();
        },

        setClusterIsOk: function (now) {//设置是否聚合

            if(this._isclusterNow == now){
                //判断下当前的
                return;
            }else{
                this._isclusterNow = now;

                this._clusterResolution = this._map.extent.getWidth() / this._map.width;
                this.clear();
                this._clusterGraphics();
            }
        },
        getNewList:function(list){
            var newList = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].lttd != "" && list[i].lttd != "--" && Number(list[i].lttd) > 0) {
                    var pt = webMercatorUtils.geographicToWebMercator(new Point(Number(list[i].lgtd), Number(list[i].lttd)));
                    list[i]["x"] = pt.x;
                    list[i]["y"] = pt.y;
                    //  list[i]["attributes"]= list[i];
                    newList.push(list[i]);
                }
            }

            return newList;
        },
        addPoint:function(item){
            this.clear();

            this.currentList = this.getNewList([item]) ;
            var pt = new Point(item.lgtd, item.lttd);
            var attr = item;
            var symbol = this.getSymbolBySttp(item);

            var graphic = new Graphic(pt, symbol, attr);//不给符号的话，没有符号显示，必须赋符号
            this.add(graphic);

            //先定位
            this.getMap().centerAt(new Point(item.lgtd,item.lttd)).then(lang.hitch(this,function(){
                this.getMap().setLevel(13).then(lang.hitch(this,function(){

                    //定位之后，弹框
                    setTimeout(lang.hitch(this,function(){
                        this.createPopWindow(item);
                    },500))
                }));

            }));
        }

    });
});