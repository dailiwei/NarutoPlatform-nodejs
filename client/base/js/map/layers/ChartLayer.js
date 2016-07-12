/**
 * Created by dailiwei on 14/12/30.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/graphic",
    "dojox/charting/Chart2D",
    "dojox/charting/themes/PlotKit/blue",
    "dojox/charting/action2d/Highlight",
    "dojox/charting/action2d/Tooltip",
    'dojo/_base/html', 'dojo/_base/connect'
], function (
    declare,lang,
    GraphicsLayer,
    Point,
    Graphic,
    Chart2D,
    theme,
    Highlight,
    Tooltip,html,connect
) {
    return declare([GraphicsLayer], {
        constructor: function(options) {
            this._divId = new Date().toTimeString();
            html.create('div', {
                'id': this._divId,
                'style': 'width:100%;height:100%'
            }, dojo.byId(jimuConfig.mapId));

            //this._id = options.id || "";
            //this._divId = options.chartDiv || "chart";
            this._charttype = options.chartType || "Pie";
            this._chartSize = options.size || 60;



        },
        level:0,
        // 重构esri/layers/GraphicsLayer方法
        _setMap: function(map, surface) {
            // GraphicsLayer will add its own listener here
            var div = this.inherited(arguments);

            connect.connect(this._map, "onPanStart", lang.hitch(this, this.onPanStart));
            connect.connect(this._map, "onPanEnd", lang.hitch(this, this.onPanEnd));
            this.level = map.getLevel();

            return div;
        },
        _unsetMap: function() {
            this.inherited(arguments);
        },
        hide: function() {
            dojo.style(dojo.byId(this._divId),{
                "display": "none"
            });
        },
        show: function() {
            dojo.style(dojo.byId(this._divId),{
                "display": ""
            });
        },
        //拖拽
        onPanStart: function() {
            Logger.log("onPanStart");
            this.hide();
        },
        onPanEnd:function(){
            Logger.log("onPanEnd");
            this.show();
        },
        //缩放
        _onZoomStartHandler:function(){
            Logger.log("_onZoomStartHandler");
            this.hide();
        },
        _onExtentChangeHandler: function() {
            Logger.log("_onExtentChangeHandler");
            if( this.level ==this._map.getLevel())return;
            this.level =this._map.getLevel();
            this.show();

            this._refresh(true);
        },
        _refresh: function(redraw) {
            Logger.log("_refresh");
            var that=this;
            var gs = this.graphics,
                _draw = this._draw;

            for (i = 0; i < gs.length; i++) {
                _draw(gs[i], redraw);
            }
            //this.show();
        },
        _draw:function(graphic, redraw){
            if (!this._map) {
                return;
            }
            if(graphic instanceof Graphic)//判断graphic是否为MapChartGraphic类型
            {
                this._drawChart(graphic,redraw);
            }
        },
        _drawChart:function(graphic,redraw){
            var showMapPt = graphic.geometry,
                attribute = graphic.attributes;
            var showPt = this._map.toScreen(showMapPt);
            var id=attribute.code,
                series = [attribute.male, attribute.female];
            if(true){

                var dd  = dojo.byId("div"+id);
                if(dd){
                    dojo.byId(this._divId).removeChild(dojo.byId("div"+id));
                    //this._div.removeChild(dojo.byId("div"+id));
                }

            }
            if(attribute){
                var _chartDiv = dojo.doc.createElement("div");
                _chartDiv.id ="div"+id;
                dojo.style(_chartDiv, {
                    "left": (showPt.x-this._chartSize/4) + "px",
                    "top": (showPt.y-this._chartSize/2) + "px",
                    "position": "absolute",
                    "width": this._chartSize + "px",
                    "height": this._chartSize + "px"
                });
                dojo.byId(this._divId).appendChild(_chartDiv);

                var _chart = new Chart2D(_chartDiv);
                var _themes = dojox.charting.themes.PlotKit.blue;
                _themes.chart.fill = "transparent";
                _themes.chart.stroke = "transparent";
                _themes.plotarea.fill = "transparent";
                _chart.setTheme(_themes);
                switch(this._charttype){
                    case "Pie":{//饼状图
                        _chart.addPlot("default", {
                            type: this._charttype,
                            labels:false
                        });
                        break;
                    }
                    case "StackedColumns":{//柱状堆积图
                        _chart.addPlot("default", {
                            type: this._charttype,
                            labels:false,
                            markers: true,
                            gap: 2
                        });
                        break;
                    }
                    case "Lines":{//柱状堆积图
                        _chart.addPlot("default", {
                            type: this._charttype,
                            labels:false,
                            markers: true,
                            radius: 1,
                            tension:"X"
                        });
                        break;
                    }
                    default:{//柱状图
                        _chart.addPlot("default", {
                            type: this._charttype,
                            labels:false,
                            gap: 3
                        });
                        chart.addAxis("y", { vertical:true, fixLower: "major", fixUpper: "major" });
                        break;
                    }
                }
                _chart.addSeries(id, series,{stroke: {width:1}});
                //效果
                new Highlight(_chart, "default", {highlight: "lightskyblue"});
                new Tooltip(_chart, "default");
                _chart.render();
            }
        }
    });
});