/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/html",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/topic",
    "dojo/query",
    'dojo/on',
    "dojo/Deferred",
    "esri/map",
    "esri/graphic",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/symbols/PictureMarkerSymbol",

    'base/map/layers/GoogleLayer',
    'base/map/layers/GoogleLocalLayer',
    'base/map/layers/TianDiTuLayer',
    "base/map/exlayers/RainStationLayer",
    "base/map/exlayers/VideoGraphicsLayer",
    "base/map/exlayers/BaseLayer1",
    "base/map/exlayers/AlertPointsLayer",
    'esri/geometry/Point',
    'esri/geometry/Extent',
    "dojo/dom-construct",
    "base/Library",
    "base/map/utils/MapUtil",
    'esri/config'
], function (declare,
             lang,
             array,
             html,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             topic,
             query,
             on,
             Deferred,
             Map,
             Graphic,
             ArcGISTiledMapServiceLayer,
             PictureMarkerSymbol,
             GoogleLayer,
             GoogleLocalLayer,
             TianDiTuLayer,
             RainStationLayer,
             VideoGraphicsLayer,
             BaseLayer,
             AlertPointsLayer,
             Point,
             Extent,
             domConstruct,
             Library,
             MapUtil,
             
             esriConfig
) {
    return declare("base.map.View.View2D", [_Widget], {
        map: null,

        type: "2d",
        initExtent: null,
        layers:null,
        constructor: function (args) {
            this._Library = new Library();
            var methodName = "constructor";
            declare.safeMixin(this, args);


            this._initVars();
            this._initEvent();
        },
        _initVars:function(){
            this.layers = [];
            
            esriConfig.defaults.io.alwaysUseProxy = false; 
            esriConfig.defaults.io.proxyRules = [];
 
            esriConfig.defaults.io.proxyUrl = APP_ROOT+"base/js/map/proxy/proxy.jsp"; 
            
        },
        _initEvent:function(){
            //对外暴露的公共接口
            this.own(topic.subscribe("gis/map/setCenter" + this.type, lang.hitch(this, this.centerAt)));
            //缩放到某个范围
            this.own(topic.subscribe("gis/map/setExtent" + this.type, lang.hitch(this, this.setExtent)));
            //恢复全图范围，默认的初始化范围
            this.own(topic.subscribe("gis/map/toInitExtent" + this.type, lang.hitch(this, this.setToInitExtent)));
        },

        centerAt: function (item) {
            var pt = new Point(Number(item.lgtd), Number(item.lttd));
            this.map.centerAt(pt).then(lang.hitch(this,function(){
                this.alertLayer.getData({lgtd:pt.x,lttd:pt.y});
            }))
        },
       
        setToInitExtent: function () {
        },

        show: function () {
        },
        hide: function () {
        },

        init: function () {
            this.map = new Map(this.parameters.template,
            {
                'logo': false,
                'zoom': this.parameters.defaultZoom,
                'center':[Number(this.parameters.lgtd),Number(this.parameters.lttd)]
            });

            this.own(this.map.on("click", lang.hitch(this, this.mapClick))); //监听住click事件

            window.viewerMap= this.map;

            //更改下infowindow的弹出框样式
            setTimeout(lang.hitch(this, function () {
                var ss = query(".esriPopup", dojo.byId("map_root"));
                html.setStyle(ss[0], "z-index", 2000);
            }), 3000);
        },
        mapClick: function (evt) {
            //这个给测量的派发个事件
            topic.publish("base/map/widgets/MapBaseTool", evt);
            if (evt.graphic == null) {
                topic.publish("base/layout/floatLayout/panelBottomContainer/close");
                this.map.infoWindow.hide();
            }
        },
        createBaseMaps: function (basemapWidgets) {
            //根据basemaps创建
            var basemaps = this.basemapWidgets = basemapWidgets;
            if (basemaps) {
                this._visitConfigMapLayers(basemaps, lang.hitch(this, function (layerConfig) {
                    MapUtil.createLayer2(this.map, '2D', layerConfig);
                }));
            } else {
                var tiled = new ArcGISTiledMapServiceLayer(this.parameters.tileServerURL?this.parameters.tileServerURL:'http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer');
                this.map.addLayer(tiled);
            }

            //添加定位图层
            this.alertLayer = new AlertPointsLayer();
            this.map.addLayer(this.alertLayer);
        },

        _visitConfigMapLayers: function (basemaps, cb) {
            array.forEach(basemaps, function (layerConfig, i) {
                layerConfig.isOperationalLayer = false;
                cb(layerConfig, i);
            }, this);
        },

        createLayers: function (layers) {
            if (!layers)return;
            var widgetReadyArray = [];

            var widgets = this._Library.toWidgetArray(layers);
            this._Library.loadModules(widgets).then(lang.hitch(this, function (modules) {

                for (var i = 0; i < modules.length; i++) {
                    var Module = modules[i];
                    var cfg = widgets[i];
                    if (Module) {
                        try {
                            var layer = new Module({widget_id: cfg.id, parameters: cfg.parameters});
                            this.map.addLayer(layer);
                            this.layers.push(layer);
                        } catch (error) {
                            Logger.log(error);
                        }
                    }
                }
            }), lang.hitch(this, function (err) {
                var errors = [err];
                Logger.error(errors);
            }));
        },
        resize: function () {
            if( this.map){
                this.map.resize();
                this.map.reposition();
            }
        },

        destroy: function () {
            if (this.layers) {
                for (var i = 0; i < this.layers.length; i++) {
                    try {
                        this.layers[i].destroy();
                    } catch (e) {
                    }

                    this.map.removeLayer(this.layers[i]);
                }
                this.layers = null;
            }

            if(this.map.destroy){
                this.map.destroy();
            }

            this.inherited(arguments);
        },

        getExtent: function () {
            var extent = this.map.extent;
            return extent;
        },
        setExtent: function (item) {
            this.map.setExtent(new Extent(Number(item.xmin), Number(item.ymin), Number(item.xmax), Number(item.ymax)).expand(1.1));
        },
        setCenter:function(item){
        	 this.map.centerAt(new Point(Number(item.lgtd), Number(item.lttd)));
        }
    });
});