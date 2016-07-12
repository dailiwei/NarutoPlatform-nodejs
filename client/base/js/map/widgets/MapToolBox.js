/*
 Richway fdw
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	'dojo/_base/html',
	"dojo/_base/fx",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"base/_BaseWidget",
    "dojo/text!./template/MapToolBox.html",
    "dojo/text!./css/MapToolBox.css",
    "dojo/topic",
    "dojo/Deferred",
    "esri/map",
    "base/map/layers/MeasureGraphicsLayer",
    "esri/layers/GraphicsLayer",
    "esri/geometry/geodesicUtils",
    "esri/units",
    "esri/geometry/webMercatorUtils",
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    'esri/geometry/Polyline',
    'esri/geometry/Point',
    "dojo/_base/Color",
    'dojo/_base/connect'
], function (declare,
	        lang,
	        html,
	        fx,
	        domConstruct,
	        domClass,
	        domStyle, 
	        _TemplatedMixin,
	        _WidgetsInTemplateMixin,
	        _Widget,
             template,
             css,
             topic,
             Deferred,
             Map,
             MeasureGraphicsLayer,
             GraphicsLayer,
             GeodesicUtils,
             Units,
             WebMercatorUtils,
             Draw,
             Graphic,
             SimpleLineSymbol,
             SimpleFillSymbol,
             Polyline,
             Point,
             Color,
             connect
) {
    return declare("base.map.widgets.MapToolBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        isShow:new Array(4),
        //测量 放大，缩小，漫游，前后视图，全图）
        constructor: function (args) {
        	var methodName = "constructor";
            declare.safeMixin(this, args); 
            this.setCss(css);
            topic.subscribe("base/map/widgets/MapBaseTool",lang.hitch(this,this.mapClick));
        }, 
        postCreate: function () { 
        	var methodName = "postCreate";
            this.inherited(arguments);
            //this.initEvent(); 
        },
        showBox: function (event) {
        	/*domConstruct.empty(this.toolBoxContainer);
        	var itemlistItemDiv = domConstruct.create("li");
        	domClass.add(itemlistItemDiv, "list-group-item layer-item"); 
            domConstruct.place(itemlistItemDiv, this.toolBoxContainer);*/
            this.changeState(this.toolBoxContainer,0); 
        	dojo.stopEvent(event);
        },
        showBaseTool:function(event){
        	this.changeState(this.base_tool_container,1); 
        	dojo.stopEvent(event);
        },
        changeState: function (obj,index) { 
        	if(this.isShow.length>0&&this.isShow[index]){ 
                fx.animateProperty({
                        node: obj,
                        properties: {
                            opacity: {start: 1, end: 0}
                        },
                        duration: 500
                }).play();
                html.setStyle(obj, 'display', 'none');
                this.isShow[index] = false; 
            } else {
                fx.animateProperty({
                        node: obj,
                        properties: {
                            opacity: {start: 0, end: 1}
                        }, 
                        duration: 500
                }).play(); 
                html.setStyle(obj, 'display', 'block');
                this.isShow[index] = true;
            }
        },
        //**********************地图工具开始***********************//
        fullScreen: function () {
            var docElm = document.documentElement;
            //W3C
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            //FireFox
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
            //Chrome等
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        },
        first: true,
        currentType: "xian",
        graphicsLayer: null,
        drawGraphicLayer: null,
        drawTool: null,
        lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 3),
        fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])
        ),
        drawLine: null,
        handle: null,
        isDrawing:false,
        selectedAreaUnits: {data: Units.SQUARE_METERS, label: "平方米"},
        selectedLinearUnits: {data: Units.METERS, label: "米"},
        start: true,//计数器 用于记录用户点了多少次鼠标,
        alClick: false,
        measureLine: function () {
            if (this.first) {
                this.initMeasure();
                this.first = false;
            }
            this.startDrawLine();
        },
        measureArea: function () {
            if (this.first) {
                this.initMeasure();
                this.first = false;
            }
            this.startDrawPolygon();
        },
        initMeasure: function () {//初始化测量得东西，如果需要调用，事件注销得事件是啥呢
            //初始化测量的图层
            this.graphicsLayer = new MeasureGraphicsLayer();
            this.drawGraphicLayer = new GraphicsLayer();
            this.graphicsLayer.graphicsLayer = this.drawGraphicLayer;
            this.map.addLayer(this.drawGraphicLayer);
            this.map.addLayer(this.graphicsLayer);
            this.drawTool = new Draw(this.map, {
                tooltipOffset: 20,
                drawTime: 90
            });
            this.drawTool.on("draw-end", lang.hitch(this, this._drawEnd));
        },
        _drawEnd: function (evt) {
            //draw完成之后就消失了，需要自己在叠加到地图上 
            var gra;
            if (this.currentType == "mian") {
                gra = new Graphic(evt.geometry, this.fillSymbol);
                this.drawGraphicLayer.add(gra);
            } else {
                gra = new Graphic(evt.geometry, this.lineSymbol);
                this.drawGraphicLayer.add(gra);
            }

            this.start = true;
            this.drawTool.deactivate();
            //map.removeEventListener(MapMouseEvent.MAP_CLICK, mapClickHandler);//需要修改
            //this.handle.remove();//移除监听
            //this.handle = null;
            this.isDrawing = false;
            //var gra = evt;//(this.drawGraphicLayer.graphics[this.drawGraphicLayer.graphics.length - 1]);
            if (this.currentType == "xian") {
                var pointArray = gra.geometry.paths[0];
                var mp = pointArray[pointArray.length - 1];
                var mpNew = new Point(mp[0], mp[1], this.map.spatialReference);
                this.showTextSymbol(mpNew, gra, true);
            } else {
                var pointArray = gra.geometry.rings[0];
                var mp = pointArray[pointArray.length - 1];
                var mpNew = new Point(mp[0], mp[1], this.map.spatialReference);
                this.showTextSymbol2(mpNew, gra, true);
            }

            //this.drawLine = null;

        },
        showTextSymbol: function (mp, gra, end) {
            if (gra == undefined)return;
            var len = this.MeasureLength(gra.geometry);
            var str = "";
            if (len / 1000 > 1) {
                if (end) {
                    //str = Math.round(len / 10) / 100 + "</b></font> 公里";
                    str = Math.round(len / 10) / 100 + " 公里";
                } else {
                    str = Math.round(len / 10) / 100 + "公里";
                }
            }
            else {
                if (end) {
                    //str = Number(len).toFixed(2) + "</b></font>米";
                    str = Number(len).toFixed(2) + "米";
                } else {
                    str = Number(len).toFixed(2) + "米";
                }

            }
            if (end) {
                // str = "总长:<font color='#ff0000' size='13'><b>" + str;
                str = "总长:" + str;

                this.graphicsLayer.showDeleteSymbol(mp, gra);

                return;
            }
            this.graphicsLayer.showText(mp, str, end);
        },
        MeasureLength: function (geometry) {
            //判断地图投影
            if (this.map.spatialReference.wkid == 102113 || this.map.spatialReference.wkid == 102100) {
                geometry = WebMercatorUtils.webMercatorToGeographic(geometry);
            }
            else if (this.map.spatialReference.wkid == 4326) {
            }
            var lengthsArr;
            lengthsArr = GeodesicUtils.geodesicLengths([geometry], this.selectedLinearUnits.data);
            return Number(lengthsArr[0]);
        },
        startDrawLine: function () {
            this.drawGraphicLayer.clear();
            this.graphicsLayer.clear();
            this.drawTool.activate(Draw.POLYLINE);
            this.drawTool.lineSymbol = this.lineSymbol;
            this.currentType = "xian";
            //监听住click事件   
            //this.handle = connect.connect(this.map, "onClick", lang.hitch(this, this.mapClick));
            this.isDrawing = true;
        }, 
        startDrawPolygon: function () {
            this.drawGraphicLayer.clear();
            this.graphicsLayer.clear(); 
            this.drawTool.activate(Draw.POLYGON);
            this.drawTool.fillSymbol = this.fillSymbol;
            this.currentType = "mian";
            //监听住click事件
            //this.handle = connect.connect(this.map, "onClick", lang.hitch(this, this.mapClick));
            this.isDrawing = true;
        },
        mapClick: function (evt) {
            if(!this.isDrawing)return;
            this.graphicsLayer.showPoint(evt.mapPoint);
            if (this.start) {
                this.graphicsLayer.showText(evt.mapPoint, "起点", false);

                this.line = new Polyline();
                this.line.addPath([evt.mapPoint, evt.mapPoint]);
                this.drawLine = new Graphic(this.line, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color("#873324"), 2));
                this.drawGraphicLayer.add(this.drawLine);
            }
            else {
                this.drawLine.geometry.insertPoint(0, this.drawLine.geometry.paths[0].length, evt.mapPoint);
                //var gra= (this.drawGraphicLayer.graphics[this.drawGraphicLayer.graphics.length - 1]);
                var gra = this.drawLine;

                if (this.currentType == "xian") {
                    this.showTextSymbol(evt.mapPoint, gra, false);
                } else {
                    this.showTextSymbol3(evt.mapPoint, gra, false);
                }
            }
            this.start = false;

        },
        showTextSymbol2: function (mp, gra, end) {
            var len = this.MeasureArea(gra.geometry);
            var str = "";
            if (len / 1000000 > 1) {
                if (end) {
                    str = Math.round(len / 10) / 10000 + " 平方公里";
                } else {
                    str = Math.round(len / 10) / 10000 + " 平方公里";
                }

            }
            else {
                if (end) {
                    str = Number(len).toFixed(2) + " 平方米";
                } else {
                    str = Number(len).toFixed(2) + "平方米";
                }

            }
            if (end) {
                str = "总面积: " + str;//"总面积:" + str;
                this.graphicsLayer.showDeleteSymbol(mp, gra);
                mp = gra.geometry.getCentroid();
            }
            this.graphicsLayer.showText(mp, str, end);
        },
        showTextSymbol3: function (mp, gra, end) {
            if (gra == undefined)return;
            var len = this.MeasureLength2(gra.geometry);
            var str = "";
            if (len / 1000 > 1) {
                if (end) {
                    str = Math.round(len / 10) / 100 + " 公里";
                } else {
                    str = Math.round(len / 10) / 100 + "公里";
                }

            }
            else {
                if (end) {
                    str = Number(len).toFixed(2) + "米";
                } else {
                    str = Number(len).toFixed(2) + "米";
                }

            }
            if (end) {
                str = "总长:" + str;
                this.graphicsLayer.showDeleteSymbol(mp, gra);
                return;
            }
            this.graphicsLayer.showText(mp, str, end);
        },
        MeasureLength2: function (geometry) {
            //判断地图投影
            if (this.map.spatialReference.wkid == 102113 || this.map.spatialReference.wkid == 102100) {
                geometry = WebMercatorUtils.webMercatorToGeographic(geometry);
            }
            else if (this.map.spatialReference.wkid == 4326) {
            }
            var lengthsArr = new Array();
            //var ly = new Polyline();
            //ly.paths = [geometry.rings[0]];
            lengthsArr = GeodesicUtils.geodesicLengths([geometry], this.selectedLinearUnits.data);
            return Number(lengthsArr[0]);
        },
        MeasureArea: function (geometry) {
            //判断地图投影
            if (this.map.spatialReference.wkid == 102113 || this.map.spatialReference.wkid == 102100) {
                geometry = WebMercatorUtils.webMercatorToGeographic(geometry);
            }
            else if (this.map.spatialReference.wkid == 4326) {
            }
            var areasArr = new Array();
            areasArr = GeodesicUtils.geodesicAreas([geometry], this.selectedAreaUnits.data);
            return Number(areasArr[0]);
        }
        
    });
});