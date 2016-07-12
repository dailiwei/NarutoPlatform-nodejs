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
    'dojo/on',
    "dojo/Deferred",

    "dojo/dom-construct",
    "base/Library",
    "dojo/promise/all",
    "base/map/widgets/MapBoundary3D",
    'require'
], function (declare,
             lang,
             array,
             html,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             topic,
             on,
             Deferred,


             domConstruct,
             Library,
             all,
             MapBoundary3D,
             require) {
    return declare("base.map.view.View3D", [_Widget], {
        map: null,

        type: "3d",
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
            this.map.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(Number(item.lgtd), Number(item.lttd), 550000.0)
            });
        },
        setExtent: function (item) {
            var west = item.xmin;
            var south = item.ymin;
            var east = item.xmax;
            var north = item.ymax;

            //有动画效果的
            this.map.camera.flyToRectangle({
                destination: Cesium.Rectangle.fromDegrees(west, south, east, north)
            });
        },
        setToInitExtent: function () {

        },

        init: function () {

//			var esri = new Cesium.ArcGisMapServerImageryProvider({
//				url: '//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
////				url: '//www.rwworks.com:6080/arcgis/rest/services/rwmap/MapServer'	
//			}); 
    	    var layer = new Cesium.UrlTemplateImageryProvider({
                 url : 'http://mt1.google.cn/vt/lyrs=s@158&hl=zh-CN&gl=CN&src=app&expIds=201527&rlbl=1&x={x}&y={y}&z={z}&s=Gali'
            });
		    var terrainProvider = new Cesium.CesiumTerrainProvider({
	             url : '//assets.agi.com/stk-terrain/world',
	             requestWaterMask : true,
	             requestVertexNormals : true
	        });

            this.map = new Cesium.Viewer(this.parameters.template, {
				imageryProvider:layer,
				terrainProvider:terrainProvider,
                baseLayerPicker: false,
                timeline: false,//
                animation: false,//
                navigationHelpButton: false,
                infoBox: false,
                homeButton: false,
                geocoder: false,
                fullscreenButton: false,
                scene3DOnly: true
            });

            setTimeout(lang.hitch(this, function () {
                this.map.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(Number(this.parameters.lgtd), Number(this.parameters.lttd), 25000.0),
                    orientation: {
                        heading: Cesium.Math.toRadians(0.0),
                        pitch: Cesium.Math.toRadians(-15.0),
                        roll: 0.0
                    }
                });

            }), 1000);
        },
        createBaseMaps: function (basemapWidgets) {
            //根据basemaps创建
            var basemaps = this.basemapWidgets = basemapWidgets;
//            if (basemaps) {
//                this._visitConfigMapLayers(basemaps, lang.hitch(this, function (layerConfig) {
//                    this.createLayer(this.map, '3D', layerConfig);
//                }));
//            } else {
//                var arcgisLayer = new Cesium.ArcGisMapServerImageryProvider({
//                    url: '//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
//                });
//
//                var layers = this.map.imageryLayers;
//                layers.addImageryProvider(arcgisLayer);
//            }
            
//            var layers = this.map.imageryLayers;
//            var layer = new Cesium.UrlTemplateImageryProvider({
//                url : 'http://mt1.google.cn/vt/lyrs=s@158&hl=zh-CN&gl=CN&src=app&expIds=201527&rlbl=1&x={x}&y={y}&z={z}&s=Gali'
//            });
//      	    layers.addImageryProvider(layer);
      	    
      	    this.boundary = new MapBoundary3D();
            this.boundary.setMap(this.map);
        },
        createLayers: function (layers) {
        	 if (!layers)return;

            var layersNew = [];
            for(var k=0;k< layers.length;k++){
                if (layers[k].parameters["3d"]&&layers[k].parameters["3d"]) {
                    layersNew.push(layers[k]);
                }
            }
            layers = layersNew;
             //转换成三维图层
             array.forEach(layers, function (layer) {
            	 layer.module = layer.module+"3D"; 
             }, this);

             var widgets = this._Library.toWidgetArray(layers);
             this._Library.loadModules(widgets).then(lang.hitch(this, function (modules) {

                 for (var i = 0; i < modules.length; i++) {
                     var Module = modules[i];
                     var cfg = widgets[i];
                     if (Module) {
                         try {
                             var layer = new Module({parameters: cfg.parameters});
                             layer.setMap(this.map);
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
        _visitConfigMapLayers: function (basemaps, cb) {
            array.forEach(basemaps, function (layerConfig, i) {
                cb(layerConfig, i);
            }, this);

        },
        createLayer: function (map, maptype, layerConfig) { 
        	var layers = map.imageryLayers; 
            var layer;
            if (layerConfig.type == "googlemap" || layerConfig.type == "googleimage" || layerConfig.type == "googletrain" || layerConfig.type == "googleabc") {
            	 if (layerConfig.type == "googlelocalmap") {
                 	  var layer = new Cesium.UrlTemplateImageryProvider({
                           url : 'http://mt1.google.cn/vt/lyrs=s@158&hl=zh-CN&gl=CN&src=app&expIds=201527&rlbl=1&x={x}&y={y}&z={z}&s=Gali'
                       });
                 	  layers.addImageryProvider(layer);
                 }
            }
            //离线地图
            else if (layerConfig.type == "googlelocalmap" || layerConfig.type == "googlelocalimage" || layerConfig.type == "googlelocaltrain") {
                if (layerConfig.type == "googlelocalimage") {
                	  var layer = new Cesium.UrlTemplateImageryProvider({
                          url : 'http://gis.rtongcloud.com:8888/cacheLayer/image/{z}/{x}_{y}.png',
                          credit : '© googlemap' 
                      });
                	  layers.addImageryProvider(layer);
                }  
            }

            else if (layerConfig.type == "tianditumap" || layerConfig.type == "tiandituimage" || layerConfig.type == "tianditutrain") {
            	if(layerConfig.type=="tianditumap1"){
            		var layer = new Cesium.WebMapTileServiceImageryProvider(
        			{ 
                        //url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                        url: "http://t0.tianditu.com/DataServer?T=vec_c&x={TileRow}&y={TileCol}&l={TileMatrix}",
        				layer: "tdtBasicLayer",
                        style: "default",
                        format: "image/png",
                        tileMatrixSetID: "GoogleMapsCompatible",
                        show: false
                    });

                    layers.addImageryProvider(layer);
            	}
            	else if(layerConfig.type=="tiandituimage"){
            		var layer = new Cesium.WebMapTileServiceImageryProvider(
        			{ 
                        //url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                        url: "http://t7.tianditu.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
        				layer: "tdtBasicLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                        show: false
                    });

                    layers.addImageryProvider(layer);
            	}
            	
            }

        },

        resize: function () {
//			this.map.resize(); 
        },
        destroy: function () {
            if (this.layers) {
                for (var i = 0; i < this.layers.length; i++) {
                    try {
                        this.layers[i].destroy();
                    } catch (e) {
                    }

                }
                this.layers = null;
            }

            if(this.map.destroy){
                this.map.destroy();
            }

            this.inherited(arguments);
        },
        getCenter: function () {
            var position = this.map.camera.positionCartographic; 
         
            return {"lgtd":Cesium.Math.toDegrees(position.longitude),"lttd":Cesium.Math.toDegrees(position.latitude)};
        },
        getExtent: function () {
            var position = this.map.camera.positionCartographic; 
         
            endUserOptions.view = CesiumMath.toDegrees(position.longitude) + ',' + CesiumMath.toDegrees(position.latitude) + ',' + position.height + hpr;
         
        },
        setExtent: function (extent) {
//            this.map.camera.setView({
//                destination: Cesium.Rectangle.fromDegrees(extent.xmin, extent.ymin, extent.xmax, extent.ymax)
//            });
           if(extent.xmin){
        	   var rectangle = Cesium.Rectangle.fromDegrees(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
               this.map.camera.flyTo({
                   destination : rectangle
               });
           } 
        }

    });
});