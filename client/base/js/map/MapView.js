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
        "dojo/text!./template/mapView1.html",
        "dojo/topic",
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
		'esri/geometry/Point',
	'esri/geometry/Extent',
	    "dojo/dom-construct",
	"base/Library",
	"dojo/promise/all",
		'require'
        ],function(
        	declare,
        	lang,
			array,
			html,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
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
			Point,
			Extent,
			domConstruct,
			Library,
			all,
			require
    	 
        ){
	return declare("base.map.MapView1", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,

		type:"2d",
		initExtent:null,
		constructor: function(args){
			this._Library = new Library();
			var methodName = "constructor";
			declare.safeMixin(this, args);
			
			//暴露的方法可以创建图层的
			topic.subscribe("gis/layer/data",lang.hitch(this,this.getData));


			//动态创建的图层
			topic.subscribe("base/map/MapView/createLayer",lang.hitch(this,this.createLayer));

			//对外暴露的公共接口
			topic.subscribe("gis/map/setCenter",lang.hitch(this,this.centerAt));
			//缩放到某个范围
			topic.subscribe("gis/map/setExtent",lang.hitch(this,this.setExtent));
			//恢复全图范围，默认的初始化范围
			topic.subscribe("gis/map/toInitExtent",lang.hitch(this,this.setToInitExtent));

		},
		clearGraphic2 :function()
		{
			if(this.parameters.type == "2d") {
				this.map.graphics.clear();
			}
		},
		centerAt:function(item){
			if(this.parameters.type == "2d"){
				this.map.centerAt(new Point(Number(item.lgtd),Number(item.lttd)));

				var symbol = new PictureMarkerSymbol({
				  "url": APP_ROOT+"base/images/red_flow.gif",
				  "height": 30,
				  "width": 30
				});

				this.map.graphics.add(new Graphic(new Point(Number(item.lgtd),Number(item.lttd)), symbol));

				setTimeout(lang.hitch(this,this.clearGraphic2), 2500); //  5秒后执行clearGraphic(),只执行一次,这种写法不带括号

			}else{
				this.map.camera.flyTo({
					destination : Cartesian3.fromDegrees(Number(item.lgtd), Number(item.lttd), 15000.0)
				});
			}
		},
		setExtent:function(item){
			if(this.parameters.type == "2d"){
				this.map.setExtent(new Extent(Number(item.xmin),Number(item.ymin),Number(item.xmax),Number(item.ymax)).expand(1.1));
			}else{
				//var west = item.xmin;
				//var south = item.ymin;
				//var east = item.xmax
				//var north = item.ymax;
                //
				////有动画效果的
				//this.map.camera.flyToRectangle({
				//	destination : Rectangle.fromDegrees(west, south, east, north)
				//});
			}

	    },
		setToInitExtent:function(){

		},
		postCreate:function(){
			var methodName = "postCreate";
		 
			this.domNode.title = "";
			this.getWidgetx();
			if(this.parameters.type == "2d"){
				this.map = new Map(this.mapNode,
					{
						'logo':false,
						'zoom':this.parameters.defaultZoom
						//'center':[]
					}); ////cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer

				//监听resize
				 this.own(on(window, 'resize', lang.hitch(this, this.resize)));
				//根据basemaps创建
				var basemaps = this.basemapWidgets;
				if(basemaps){
					this._visitConfigMapLayers(basemaps, lang.hitch(this, function(layerConfig) {
						this.createLayer2(this.map, '2D', layerConfig);
					}));
				}else{
				
					if(this.parameters.tileServerURL&&this.parameters.tileServerURL.length>0){
						var tiled = new ArcGISTiledMapServiceLayer('http:'+this.parameters.tileServerURL);
						//var tiled = new ArcGISTiledMapServiceLayer('http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer');
						this.map.addLayer(tiled);
					}
					else if(this.parameters.dynamicServerURL&&this.parameters.dynamicServerURL.length>0){
						var tiled = new ArcGISTiledMapServiceLayer('http:'+this.parameters.dynamicServerURL);
						//var tiled = new ArcGISTiledMapServiceLayer('http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer');
						this.map.addLayer(tiled);
					}else{
						var tiled = new ArcGISTiledMapServiceLayer('http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer');
						this.map.addLayer(tiled);
					}
					
				}

				html.setStyle(this.mapNode, 'width', '100%');
				html.setStyle(this.mapNode, 'height', '100%');

				//根据参数，先创建layer
				this.createLayersByConfig(this.layerWidgets);

				this.map.on("click",lang.hitch(this,this.mapClick)); //监听住click事件

				setTimeout(lang.hitch(this,function(){
					require(['esri/geometry/Point'], lang.hitch(this, function(point) {
						this.map.centerAt(new point(Number(this.parameters.lgtd),Number(this.parameters.lttd)))
					}));

					this.createPlugins();
					////测量工具
					//require(['base/map/widgets/MapMeasure'], lang.hitch(this, function(MapMeasure) {
                    //
					//	var widget = new MapMeasure();
                    //
					//		domConstruct.place(widget.domNode, this.mapContainer);
					//}));

				}),500);
				 
			}else{
				var esri = new Cesium.ArcGisMapServerImageryProvider({
					//url: '//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
					url: this.parameters.tileServerURL
				});


				this.map = new Cesium.Viewer(this.mapNode,{
					imageryProvider:esri,
					baseLayerPicker:false,
					timeline: false,//
					animation:false,//
					navigationHelpButton:false
				});
				
				setTimeout(lang.hitch(this,function(){
					this.map.camera.flyTo({
	                    destination : Cesium.Cartesian3.fromDegrees(Number(this.parameters.lgtd),Number(this.parameters.lttd), 25000.0),
						orientation : {
							heading : Cesium.Math.toRadians(0.0),
							pitch : Cesium.Math.toRadians(-15.0),
							roll : 0.0
						}
	                });

					var layer = new VideoGraphicsLayer();
					layer.map = this.map;
					
				}),1000);
				
			}

			this.inherited(arguments);
			
		},
		mapClick:function (evt){
			//这个给测量的派发个事件
			topic.publish("base/map/widgets/MapBaseTool",evt);

			if(evt.graphic==null){
				topic.publish("base/layout/floatLayout/panelBottomContainer/close");
				this.map.infoWindow.hide();
//				this.map.infoWindow.setContent({});

			}
		},
		_visitConfigMapLayers: function(basemaps, cb) {
			array.forEach(basemaps, function(layerConfig, i) {
				layerConfig.isOperationalLayer = false;
				cb(layerConfig, i);
			}, this);

		},
		createLayer2: function(map, maptype, layerConfig) {
			var layMap = {
				'2D_tiled': 'esri/layers/ArcGISTiledMapServiceLayer',
				'2D_dynamic': 'esri/layers/ArcGISDynamicMapServiceLayer',
				'2D_image': 'esri/layers/ArcGISImageServiceLayer',
				'2D_feature': 'esri/layers/FeatureLayer',
				'2D_rss': 'esri/layers/GeoRSSLayer',
				'2D_kml': 'esri/layers/KMLLayer',
				'2D_webTiled': 'esri/layers/WebTiledLayer',
				'2D_wms': 'esri/layers/WMSLayer',
				'2D_wmts': 'esri/layers/WMTSLayer',
				'2D_googlemap': 'GoogleLayer',
				'2D_googleimage': 'GoogleLayer',
				'2D_googletrain': 'GoogleLayer',
				'2D_googleabc': 'GoogleLayer',
				'2D_googlelocalmap': 'GoogleLocalLayer',
				'2D_googlelocalimage': 'GoogleLocalLayer',
				'2D_googlelocaltrain': 'GoogleLocalLayer',
				'2D_tianditumap': 'TianDiTuLayer',
				'2D_tiandituimage': 'TianDiTuLayer',
				'2D_tianditutrain': 'TianDiTuLayer',

				'3D_tiled': 'esri3d/layers/ArcGISTiledMapServiceLayer',
				'3D_dynamic': 'esri3d/layers/ArcGISDynamicMapServiceLayer',
				'3D_image': 'esri3d/layers/ArcGISImageServiceLayer',
				'3D_feature': 'esri3d/layers/FeatureLayer',
				'3D_elevation': 'esri3d/layers/ArcGISElevationServiceLayer',
				'3D_3dmodle': 'esri3d/layers/SceneLayer'
			};

			var layer;
			if (layerConfig.type == "googlemap" || layerConfig.type == "googleimage" || layerConfig.type == "googletrain"|| layerConfig.type == "googleabc") {
				layer = new GoogleLayer();//
				layer.id = layerConfig.type;
				layer.type = layerConfig.type;
				layer.visible = layerConfig.visible;
				map.addLayer(layer);
				if (layerConfig.type == "googleimage" )
				{
					layer = new GoogleLayer();//
					layer.id = layerConfig.type+"i";
					layer.type = "googleimagei";
					layer.visible = layerConfig.visible;
					map.addLayer(layer);
				}
			}
			//离线地图
			else  if (layerConfig.type == "googlelocalmap" || layerConfig.type == "googlelocalimage" || layerConfig.type == "googlelocaltrain") {
				layer = new GoogleLocalLayer(layerConfig.url);//
				layer.id = layerConfig.type;
				layer.type = layerConfig.type;
				layer.visible = layerConfig.visible;
				map.addLayer(layer);
				if (layerConfig.type == "googlelocalimage")
				{
					layer = new GoogleLocalLayer(layerConfig.url);//
					layer.id = "googlelocalimagei";
					layer.type = "googlelocalimagei";
					layer.visible = layerConfig.visible;
					map.addLayer(layer);
				}
			}

			else if(layerConfig.type == "tianditumap" || layerConfig.type == "tiandituimage" || layerConfig.type == "tianditutrain")
			{
				layer = new TianDiTuLayer();//
				layer.id = layerConfig.type;
				layer.type = layerConfig.type;
				layer.visible = layerConfig.visible;
				map.addLayer(layer);
				if (layerConfig.type == "tianditumap")
				{
					layer = new TianDiTuLayer();//
					layer.id = "tianditumapi"
					layer.type = "tianditumapi";
					layer.visible = layerConfig.visible;
					map.addLayer(layer);
				} else if (layerConfig.type == "tiandituimage")
				{
					layer = new TianDiTuLayer();//
					layer.id = "tiandituimagei"
					layer.type = "tiandituimagei";
					layer.visible = layerConfig.visible;
					map.addLayer(layer);
				}else if (layerConfig.type == "tianditutrain")
				{
					layer = new TianDiTuLayer();//
					layer.id = "tianditutraini"
					layer.type = "tianditutraini";
					layer.visible = layerConfig.visible;
					map.addLayer(layer);
				}
			}
			else {
				//以前的这个是
				require([layMap[maptype + '_' + layerConfig.type]], lang.hitch(this, function(layerClass) {
					var infoTemplate, options = {},
						keyProperties = ['label', 'url', 'type', 'icon', 'infoTemplate', 'isOperationalLayer'];
					for (var p in layerConfig) {
						if (keyProperties.indexOf(p) < 0) {
							options[p] = layerConfig[p];
						}
					}
					if (layerConfig.infoTemplate) {
						infoTemplate = new InfoTemplate(layerConfig.infoTemplate.title,
							layerConfig.infoTemplate.content);
						options.infoTemplate = infoTemplate;

						layer = new layerClass(layerConfig.url, options);

						if (layerConfig.infoTemplate.width && layerConfig.infoTemplate.height) {
							aspect.after(layer, 'onClick', lang.hitch(this, function() {
								map.infoWindow.resize(layerConfig.infoTemplate.width,
									layerConfig.infoTemplate.height);
							}), true);
						}
					} else {
						layer = new layerClass(layerConfig.url, options);
					}

					layer.isOperationalLayer = layerConfig.isOperationalLayer;
					layer.label = layerConfig.label;
					layer.icon = layerConfig.icon;
					layer.id = layerConfig.label;
					map.addLayer(layer);
				}));
			}

		},

		createLayersByConfig:function(layers){

			if(!layers)return;
			var widgetReadyArray = [];
			//for(var i=0;i<layers.length;i++)
			//{
			//	var widgetDef =  layers[i];
			//	var widgetReady = this._Library.loadWidget(widgetDef.pathName, widgetDef.pathLocation, widgetDef.moduleName);
			//	widgetReadyArray.push(widgetReady);
			//}
            //
			//all(widgetReadyArray).then(dojo.hitch(this, function(layersArray){
			//	for(var item in layersArray){
			//		var layerClass = layersArray[item];
			//		var layer = new layerClass(layers[item].parameters);
			//		this.map.addLayer(layer);
			//	}
            //
			//}));

			var widgets = this._Library.toWidgetArray(layers);
			this._Library.loadModules(widgets).then(lang.hitch(this,function (modules) {

				for (var i = 0; i < modules.length; i++) {
					var Module = modules[i];
					var cfg = widgets[i];
					if (Module) {
						try {
							var layer = new Module({widget_id:cfg.id,parameters:cfg.parameters});
							this.map.addLayer(layer);
						} catch (error) {
							Logger.log(error);
						}
					}
				}
			}), lang.hitch(this,function (err) {
				var errors = [err];
				Logger.error(errors);
			}));


		},
		resize:function(){
			this.map.resize();
			this.map.reposition(); 
			 
		},
		layerList:[],
		/**
		 * 创建图层，或者更新图层数据
		 *
		 * @param {object} 包括name：名称，data：数据
		 * @returns {} 无
		 */
		getData:function(object){

			Logger.log("发送数据了");
			for(var i =0;i<this.layerList.length;i++){
				if(this.layerList[i].name == object.name){
					return;
				}
			}
			//不然就是没有，直接创建
			this.layerList.push(object);
			this.createLayer1(object);
		},

		createLayer1:function(object){

			if(this.parameters.type=="2d"){
				var layer = new RainStationLayer();
				this.map.addLayer(layer);
			}else{
				var layer = new VideoGraphicsLayer();
				layer.map = this.map;
			}
			
		},

		updateLayer:function(object){

		},

		//
		createLayer:function(args){

			if(this.parameters.type=="2d"){
				if(args.path){

				}else{
					var layer = new BaseLayer(args);
					this.map.addLayer(layer);
					this.layerList.push(layer);
				}

			}else{
				var layer = new VideoGraphicsLayer();
				layer.map = this.map;
			}

		}

		///都自己去获取就得了
		,
		getWidgetx:function(){
			//获取左侧的panel
			this.basemapWidgets = [];
			this.layerWidgets = [];
			this.pluginWidgets = [];

			var list = window.currentPageWidgets;
			var containerId = this.widget_id;
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				if (item.container == containerId && item.parameters.region == "basemap") {
					this.basemapWidgets.push(item.parameters);
				}
				if (item.container == containerId && item.parameters.region == "layer") {
					this.layerWidgets.push(item);
				}
				if (item.container == containerId && item.parameters.region == "plugin") {
					this.pluginWidgets.push(item);
				}
			}

		},
		createPlugins:function(){
			var widgets = this._Library.toWidgetArray(this.pluginWidgets);
			this._Library.loadModules(widgets).then(lang.hitch(this,function (modules) {

				for (var i = 0; i < modules.length; i++) {
					var Module = modules[i];
					var cfg = widgets[i];
					if (Module) {
						try {
							var widget = new Module({
								widget_id: cfg.id,
								parameters: cfg.parameters,
								map:this.map,
								baseMaps:this.basemapWidgets
							});
							widget.startup();

							domConstruct.place(widget.domNode, this.mapContainer);
						} catch (error) {
							throw "Error create instance:" + cfg.id + ". " + error;
						}
					}
				}
			}), lang.hitch(this,function (err) {
				var errors = [err];
				Logger.error(errors);
			}));

		},
		addChild: function (widget) {
			switch (widget.parameters.region) {
				case "basemap":

					break;
				case "layer":

					break;
				case "plugin":

					break;
				default:
					break;

			}
		},

		destroy:function(){
			this.inherited(arguments);
			Logger.log("map被删除了00");
//			this.map.destroy();
		}
		
	});
});