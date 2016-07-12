define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",
        "dijit/Dialog",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "esri/layers/GraphicsLayer",
        'dojo/topic',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'esri/symbols/SimpleFillSymbol',
        'dojo/_base/Color',
        'esri/graphic',
        'esri/geometry/Point',
        'esri/geometry/Polyline',
        'esri/geometry/Polygon',
        'base/widget/Popup',
        "esri/symbols/Font",
        "esri/symbols/TextSymbol",
        'dijit/layout/ContentPane',
        './RainChartPanel',
        'esri/symbols/PictureMarkerSymbol',
        "dijit/Menu",
        "dijit/MenuItem",
        "dijit/MenuSeparator"
    ],
    function (lang,
              array,
              declare,
              Dialog,
              _WidgetBase,
              _TemplatedMixin,
              GraphicsLayer,
              topic,
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              SimpleFillSymbol,
              Color,
              Graphic,
              Point,
              Polyline,
              Polygon,

              Popup,
              Font,
              TextSymbol,
              ContentPane,
              RainChartPanel,
              PictureMarkerSymbol,
              Menu,
              MenuItem,
              MenuSeparator
    ) {
        return declare("base.map.exlayers.ContourLayer", GraphicsLayer, { // 等值线面

            name: "ContourLayer",
            url : window.APP_ROOT+"/base/api/asset/${solutionId}/model/${modelId}/assetType/${assetTypeId}/assetInstance",
            /**
             * 构造方法
             * @param args
             */
            catalog:null,
            constructor: function (args) {
                declare.safeMixin(this, args); 
                //传过来的参数
                var tStr = 'layer/rainContour/';
                this.catalog = "rainContour";
                //创建图层数据
                topic.subscribe(tStr+"data", lang.hitch(this, this.getData));
                //控制可见
                topic.subscribe(tStr+"visible", lang.hitch(this, this.setVis));
                this.id = "降雨等值面图层";//this.name;//为以后获取图例名称准备

                ////鼠标移入
                //this.on("mouse-over",lang.hitch(this,this.mouseOverHandler));
                ////鼠标移出
                //this.on("mouse-out",lang.hitch(this,this.mouseOutHandler));
                ////鼠标点击
                //this.on("click",lang.hitch(this,this.clickHandler));

            },
            //可以重写这个方法
            mouseOverHandler:function(evt){
                this.getMap().setMapCursor("pointer");
            },
            mouseOutHandler:function(evt){
                this.getMap().setMapCursor("default");
                this.getMap().infoWindow.hide();
            },
            clickHandler:function(evt){
                var selected = evt.graphic;
                var item = selected.attributes;
            },

            getData: function (result) {
               //result:{"isLine":false,"data","levels":[]}
                this.isLine = result.isLine;

                this.addContourGraphics(result.data);
            } ,

            currentVis:true,
            setVis:function(vis){
                this.currentVis = vis;
                this.setVisibility(vis);
            },

            isLine:false,//默认是面，参数化
            levels: [
                {"value": "A", "label": "A:10,25,50,100", "level": "0,2#2,10#10,25#25,50#50,100#100,100000"},
                {
                    "value": "B",
                    "label": "B:10,25,50,100,200,300",
                    "level": "0,2#2,10#10,25#25,50#50,100#100,200#200,300#300,100000"
                },
                {
                    "value": "C",
                    "label": "C:50,100,200,300,400,500,600",
                    "level": "0,2#2,50#50,100#100,200#200,300#300,400#400,500#500,600#600,100000"
                },
                {
                    "value": "D",
                    "label": "D:300,500,600,800,900,1000",
                    "level": "0,2#2,300#300,500#500,600#600,800#800,900#900,1000#1000,100000"
                },
                {
                    "value": "E",
                    "label": "E:10,20,30,40,50,60",
                    "level": "0,2#2,10#10,20#20,30#30,40#40,50#50,60#60,100000"
                },
                {
                    "value": "F",
                    "label": "F:100,300,500,800,1000,1200",
                    "level": "0,2#2,100#100,300#300,500#500,800#800,1000#1000,1200#1200,100000"
                }
            ],
            //颜色的，等值面的
            // colorArray:[0xFFFFFF, 0xFFFFFF, 0xA9F18D, 0x3BB642, 0x5EB9FF, 0x0000FE, 0xF901F8, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444],
            colorArray: [new dojo.Color([255, 255, 255]), new dojo.Color([255, 255, 255]), new dojo.Color([169, 241, 141]), new dojo.Color([59, 182, 66]), new dojo.Color([94, 185, 255]), new dojo.Color([0, 0, 254]), new dojo.Color([249, 1, 248]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68])],
            colorArray2: [new dojo.Color([255, 255, 255, 0.5]), new dojo.Color([255, 255, 255, 0.5]), new dojo.Color([169, 241, 141, 0.5]), new dojo.Color([59, 182, 66, 0.5]), new dojo.Color([94, 185, 255, 0.5]), new dojo.Color([0, 0, 254, 0.5]), new dojo.Color([249, 1, 248, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5])],

            addContourGraphics: function (obj) {
                this.clear();
                var resultObject = obj["results"][0];
                var value = resultObject.value;
                var features = value.features;
                if (this.isLine) {

                    array.forEach(features, function (feature) {
                        var attributes = feature.attributes;
                        var i = (attributes.level);
                        var graphic = new Graphic();
                        var geometry = feature.geometry;
                        var polyLine = new Polyline();
                        var pathsArray = new Array();
                        var paths = geometry.paths[0];

                        array.forEach(paths, function (pointArray) {
                            var mp = new Point(pointArray[0], pointArray[1]);
                            pathsArray.push(mp);
                        }, this);

                        polyLine.addPath(pathsArray);

                        graphic.geometry = polyLine;
                        graphic.symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this.colorArray[i], 1);
                        //new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([56, 168, 0, 0.5]), 2);

                        this.add(graphic);

                    }, this);

                }
                else {
                    array.forEach(features, function (feature) {
                        var attributes = feature.attributes;
                        var i = attributes.level;
                        var graphic = new Graphic();
                        var geometry = feature.geometry;
                        var polyGon = new Polygon();
                        var ringsArray = new Array();
                        var rings = geometry.rings[0];
                        array.forEach(rings, function (pointArray) {
                            var mp = new Point(pointArray[0], pointArray[1]);
                            ringsArray.push(mp);
                        }, this);

                        polyGon.addRing(ringsArray);
                        graphic.geometry = polyGon;
                        graphic.symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this.colorArray[i], 1), this.colorArray2[i]);
                        this.add(graphic);
                    }, this);

                }

            }


        });
    });