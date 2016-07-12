/////////////////////////////////////////////////////////////////////////// 
// create by dailiwei 2015-11-16 16:02
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare", 
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        'dojo/topic',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        'dojo/_base/Color',
        'esri/graphic',
        'esri/geometry/Point',  
        "esri/symbols/Font",
        "esri/symbols/TextSymbol", 
        'esri/symbols/PictureMarkerSymbol',  
        "esri/SpatialReference",
        "esri/tasks/QueryTask",
		"esri/tasks/query",
		"dojo/request",
		"water_resource/surface_water/service/Common",
		'esri/geometry/Extent',
		"esri/SpatialReference"
    ],
    function (lang,
              array,
              declare, 
              _WidgetBase,
              _TemplatedMixin,
              GraphicsLayer,
              FeatureLayer,
              topic,
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              SimpleFillSymbol,
              Color,
              Graphic,
              Point,  
              Font,
              TextSymbol, 
              PictureMarkerSymbol,  
              SpatialReference,
              QueryTask,
              Query,
              request,
              Common,
              Extent,
              SpatialReference
    ) {
        return declare("base.map.exlayers.WFSLayer", GraphicsLayer, { // wfs图层
  
            firstLoad: true,
            allList: [],
            constructor: function (args) { 
                declare.safeMixin(this, args);  
    
				//鼠标移入
                this.on("mouse-over", lang.hitch(this, this.mouseOverHandler));
                //鼠标移出
                this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
                //鼠标点击
                this.on("click", lang.hitch(this, this.clickHandler));
				this.labelLayer = new GraphicsLayer(); 
				
				if(this.parameters&&this.parameters.showName){  
					this.layerName = this.parameters.layerName;
					this.showName = this.parameters.showName;
					this.icon_width = this.parameters.icon_width;
					this.icon_height = this.parameters.icon_height; 
					this.icon = this.parameters.icon;
				}
				
				 
            },
            _setMap: function(map, surface){ 
             
            	this.getData();
                var div = this.inherited(arguments);
                return div;
            },
            layerName:"",
            showName:"stnm",
            icon_width:15,
            icon_height:15,
            icon:"",
            //可以重写这个方法
            mouseOverHandler: function (evt) {
                this.getMap().setMapCursor("pointer");  
            },
            mouseOutHandler: function (evt) {
                this.getMap().setMapCursor("default"); 
            },
            clickHandler: function (evt) {
                var selected = evt.graphic;
                var item = selected.attributes; 
            },
            openWindow: function (itemData) { 
            },
            location:function(stcd){ 
        		//定位
       		    var graphics = this.graphics;
                var item;
                for (var i = 0; i < graphics.length; i++) {
                    if (graphics[i].attributes.stcd == stcd) {
                        item = graphics[i].attributes;
                        topic.publish("gis/map/setCenter",{lgtd:graphics[i].geometry.x,lttd:graphics[i].geometry.y});//定位
                        break;
                    }
                }
            },
            clickHandler: function (evt) {
            	Logger.log(this.getMap().extent);
            	Logger.log(this.getMap().getLevel());
             	Logger.log(this.getMap().getZoom());
             	Logger.log(this.getMap().getScale());
            }, 
            adcdMap:{},
           
            getLayer:function(){
            	var layerName = this.layerName;
            	var url = window.GIS_SERVICE+"sisp/atservices/WaterBase/wfs?attoken="+window.GIS_TOKEN+"&layername="+layerName+"&SERVICE=wfs&REQUEST=getFeature&outFields=*&where=1=1&RETURNGEOMETRY=true";
            	return request.get(url, {
					handleAs : "json"
				}).then(lang.hitch(this, function(json) {
				    Logger.log(json);
				    var fs = json.layer[0].layerresources[0].features;
				    return fs;
				}));
            },
            getData:function(){
            	this.getLayer().then(lang.hitch(this,function(features){ 
        			this.showPoints(features);
        		}));
            },
            newList:[],
            stcd:"stcd",//id对应的
          
            showPoints:function(list){
            	 if (this.firstLoad) {
                     this.getMap().addLayer(this.labelLayer);
                     this.getMap().on("zoom-end", lang.hitch(this, this.changeGraphicState));
                     this.firstLoad = false;
                 } 
            	this.allList = list;
                //清除之前的
                this.clear();
                this.labelLayer.clear();

                var count = 0;
                for (var i = 0; i < list.length; i++) {

                	var item = list[i];
                    var pt = new Point(item.geometry.x, item.geometry.y,new SpatialReference({ wkid: 2422 }));
                
                    //符号颜色 点符号
                    var font = new Font("12px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var textSymbol = new TextSymbol(item.attributes[this.showName], font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 5);
                    var labelPointGraphic = new Graphic(pt, textSymbol, item);
                    this.labelLayer.add(labelPointGraphic);

                    var symbol = new PictureMarkerSymbol({
						  "url": this.icon,
						  "height": this.icon_height,
						  "width": this.icon_width
					}); 

                    var gra = new Graphic(pt, symbol, item);//不给符号的话，没有符号显示，必须赋符号
                    this.add(gra);
                }
                //判断下级别
                this.changeLabelVis();
                this.redraw();//还必须要刷新下有时候
            },
           
            changeGraphicState: function (evt) {
                if (!this.currentVis)return;
                this.changeLabelVis(); 
            },
            currentVis: true,
            labelVis: false,
            setVis: function (vis) {
                this.currentVis = vis;
                this.setVisibility(vis);

                this.changeLabelVis();
            },
            setLabelVis: function (vis) {
                this.labelVis = vis;
                this.changeLabelVis();
            },
            levelNum: 2,
            changeLabelVis: function () {
                var level = this.getMap().getLevel();
                if (this.currentVis && this.labelVis || (level > this.levelNum)) {
                    this.labelLayer.setVisibility(true);
                } else {
                    this.labelLayer.setVisibility(false);
                }
            }
             
        });
    });