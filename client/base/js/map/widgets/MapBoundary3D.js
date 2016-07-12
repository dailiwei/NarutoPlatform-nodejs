/*
 Richway dlw
*/

define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'base/_BaseWidget',
		'dojo/_base/html',
		'dojo/dom-construct',
		'dojo/topic',  
		'dojo/_base/array',
		'dojox/xml/parser', 
		'dojo/request/xhr',
		"esri/tasks/QueryTask",
		"esri/tasks/query"
	],
	function (declare,
			  lang,
			  BaseWidget,
			  html,
			  domConstruct,
			  topic,  
			  array,
			  parser, 
			  xhr,
			  QueryTask,
			  Query
	) {
		var clazz = declare("base/map/widgets/MapBoundary3D",[], { 
			map:null, 
			constructor:function(args){
				this.inherited(arguments); 

				this.firstLoad = true;
				topic.subscribe("base/map/widgets/MapBoundary/updateByGraphicByAdcd", lang.hitch(this, this.getGeoByGisserver));
			},
			setMap:function(map){
				this.map = map;
				this.loadBoundLayer();
			}, 
			 
			addBoundLayer: function (graphic) { 
				var graphic = graphic;
				var ringsArray = [];
				var rings = graphic.geometry.rings[0];
				array.forEach(rings, function (item) {   
//					Logger.log(item);
					ringsArray.push(item[0], item[1]); 
				}, this); 
				
				if(this.bound){
					this.bound.polygon.hierarchy = Cesium.Cartesian3.fromDegreesArray(ringsArray);
					return;
				}
				this.bound = this.map.entities.add({
				    name : 'polygon',
				    polygon : {
				        hierarchy : Cesium.Cartesian3.fromDegreesArray(ringsArray),
//				        extrudedHeight: 500000.0,
				        material : Cesium.Color.GREEN.withAlpha(0.1),
				        outline : true,
				        outlineColor : Cesium.Color.ORANGE,
				        outlineWidth:2.0
				    }
				}); 
			},

			loadBoundLayer: function () {  
				if(APP_ID=="98eba86f7d954468b5a836cbdc59a36c"){
					this.getGeoByGisserver("060000");
					return;
				}else{
					this.getGeoByGisserver(window.DEFAULT_ADCD);
				} 
			},
			getGeoByGisserver:function(adcd){ 
				var queryTask = new QueryTask("http://www.rwworks.com:6080/arcgis/rest/services/2015shp/MapServer/8");
 
				var query = new Query();
				query.returnGeometry = true;
				if(adcd.length>6)
					adcd = adcd.substring(0,6);
				query.outFields = ["CNNM", "CNNMCD"];
				query.where = "CNNMCD = '"+adcd+"'";
				query.outSpatialReference = {"wkid":4326};

				dojo.connect(queryTask, "onComplete",lang.hitch(this, function(featureSet) { 

					dojo.forEach(featureSet.features,lang.hitch(this,function(feature){
						var graphic = feature; 
						this.addBoundLayer(graphic); 
					}));
				}));
				queryTask.execute(query);
			} 
		});
		return clazz;
	});