/*
 richway&IBM dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    "dojo/dom-construct",
	    "dojo/dom",
	    "dojo/on",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/IdentifyPanel.html",
        "dojo/text!./css/IdentifyPanel.css",
        "dojo/topic",
        "dojo/Deferred",
        "esri/map",
        "rdijit/form/Search",
        'esri/dijit/PopupTemplate',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/PictureMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'esri/symbols/SimpleFillSymbol',
        "esri/Color",
        'esri/layers/GraphicsLayer',
        'dojo/promise/all',
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "./ListPanel",
        "./LayerFilter",
        'base/widget/Popup',
        './DrawBox'
        ],function(
        	declare,
        	lang,
			html,
			domConstruct, 
			dom,
			on,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		css,
    		topic,
    		Deferred,
    		Map,
    		Search,
    		  PopupTemplate,
    		  SimpleMarkerSymbol,
    		  PictureMarkerSymbol,
              SimpleLineSymbol,
              SimpleFillSymbol,
              Color,
              GraphicsLayer,
              all,
              QueryTask,
              Query,
              ListPanel,
              LayerFilter,
              Popup,
              DrawBox
    	 
        ){
	return declare("base.map.dijit.IdentifyPanel", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		baseClass:'base-map-dijit-IdentifyPanel',
		map:null,
 
		//查询图层配置的
		oldLayers: [
		            {
			             "name": "省界",
			             "url": "http://rwworks.com:6080/arcgis/rest/services/guangxi_shzh/MapServer",
			             "id": 6,
			             "type":"polygon",
			             "fields": {
			               "all": true
			             }
			           }
			          //,
			          // {
			          //   "name": "市界",
			          //   "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/2015shp/MapServer",
			          //   "id": 6,
			          //   "type":"polygon",
			          //   "fields": {
			          //     "all": true
			          //   }
			          // }
			          //,
			          // {
			          //   "name": "省会",
			          //   "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/2015shp/MapServer",
			          //   "id": 0,
			          //   "type":"point",
			          //   "fields": {
			          //     "all": true
			          //   }
			          // }
//			           ,
//			           {
//			             "name": "heliu1",
//			             "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/rwmap/MapServer",
//			             "id": 0, 
//			             "type":"polyline",
//			             "fields": {
//			               "all": true
//			             }
//			           }
//			           ,
//			           {
//			             "name": "水库",
//			             "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/rwmap/MapServer",
//			             "id": 3, 
//			             "type":"polygon",
//			             "fields": {
//			               "all": true
//			             }
//			           }
		],
		layers: [
		         {
		             "name": "省界",
		             "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/2015shp/MapServer",
		             "id": 7,  
		             "type":"polygon",
		             "fields": {
		               "all": true
		             }
		           } 
		          ,
		           {
		             "name": "省会",
		             "url": "http://gis.rtongcloud.com:6080/arcgis/rest/services/2015shp/MapServer",
		             "id": 0, 
		             "type":"point",
		             "fields": {
		               "all": true
		             }
		           } 
		],
		queryResluts:[],
		graphicsLayer:null,
		// 集成框选，点击，关键字等三种查询方式为一体，提供配置功能
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args);
			
			this.setCss(css); 
			
			if(this.parameters){
				this.oldLayers = this.parameters.layers?this.parameters.layers:this.oldLayers;//否则使用默认的
			}
		},
		
		postCreate:function(){
			var methodName = "postCreate";
			this.domNode.title = "";
			this.inherited(arguments); 
			
			topic.subscribe("gis/map/query",lang.hitch(this,this.queryFeatureByInfo));
			
		},
		startup:function(){
		
			this.inherited(arguments); 
			
			setTimeout(lang.hitch(this,function(){
				this.initLayer();
				this.initDijit();   
				this.initLayerFilter();
				this.initSymbols();
			}),1000);
		},
		initSymbols: function () {
            if (this.parameters.symbols && this.parameters.symbols.simplemarkersymbol) {
                this.identMarkerSymbol = new SimpleMarkerSymbol(this.parameters.symbols.simplemarkersymbol);
            } else {
                this.identMarkerSymbol = new PictureMarkerSymbol({"url": "base/images/marker/marker_blue.png","height": 16, "width": 12 });
            }
            if (this.parameters.symbols && this.parameters.symbols.simplelinesymbol) {
                this.identLineSymbol = new SimpleLineSymbol(this.parameters.symbols.simplelinesymbol);
            } else {
                this.identLineSymbol = new SimpleLineSymbol();
            }
            if (this.parameters.symbols && this.parameters.symbols.simplefillsymbol) {
                this.identFillSymbol = new SimpleFillSymbol(this.parameters.symbols.simplefillsymbol);
            } else {
                this.identFillSymbol = new SimpleFillSymbol();
            }
            
//            this.drawBox.setPointSymbol( this.identMarkerSymbol);
//		    this.drawBox.setLineSymbol( this.identLineSymbol);
//	        this.drawBox.setPolygonSymbol( this.identFillSymbol);
        },
		initLayer:function(){
			this.map = window.viewerMap;
            
            this.currentGraphicsLayer = new GraphicsLayer();
            this.currentGraphicsLayer.name = '查询图层';
            this.map.addLayer(this.currentGraphicsLayer);
            
            this.graphicsLayer = new GraphicsLayer();
            this.graphicsLayer.name = '查询结果';
            this.map.addLayer(this.graphicsLayer);
		},
		initDijit:function(){ 
//			this.drawBox = new DrawBox({
//				"geoTypes":["POINT", "POLYLINE", "POLYGON","CIRCLE","EXTENT"],
//				"showClear":false
//			});
//			domConstruct.place(this.drawBox.domNode, this.indentifyFilter);
			this.own(on(this.drawBox, 'DrawEnd', lang.hitch(this, this._onDrawEnd)));
			this.drawBox.startup();
			this.drawBox.setMap(this.map);
			
			this.panel = new ListPanel();
			domConstruct.place( this.panel.domNode, this.resultContainer);
			this.panel.startup();
			html.setStyle(this.panel.domNode,"display","none");
			html.setStyle(this.resultContainer,"height",this.domNode.clientHeight - 120+"px");
		},
		_onDrawEnd:function(graphic, geotype, commontype){ 
	        this.drawBox.clear(); 
	        this.currentGraphicsLayer.clear();
	        this.currentGraphicsLayer.add(graphic);
	        
	        var geometry = graphic.geometry;
	        if(geometry.type === 'extent'){
	          var a = geometry;
	          var polygon = new Polygon(a.spatialReference);
	          var r = [
	            [a.xmin, a.ymin],
	            [a.xmin, a.ymax],
	            [a.xmax, a.ymax],
	            [a.xmax, a.ymin],
	            [a.xmin, a.ymin]
	          ];
	          polygon.addRing(r);
	          geometry = polygon;
	          commontype = 'polygon';
	        }
	        if(commontype === 'polyline'){
	          
	        }
	        else if(commontype === 'polygon'){
	          
	        }else{
	          
	        }
	        this.currentGeometry = geometry;
	        
	        this.queryByText("");
	    }, 
		 
		queryByText:function(text){
			 html.setStyle(this.panel.domNode,"display","none");
			 html.setStyle(this.loading,"display","block");
			 this.graphicsLayer.clear();
             var list =  this.layers;
             var promise = [];
             for(var i=0;i<list.length;i++){
                 promise.push(this.getLayerResult(list[i].url+"/"+list[i].id,text,list[i]));
             }
             all(promise).then(lang.hitch(this,function(result){
            	 html.setStyle(this.loading,"display","none");
            	 html.setStyle(this.panel.domNode,"display","block");
//                 Logger.dir(result);
                 this.panel.clearData();//清除一下
                 var count = 0;
                 //分组添加数据需要
	             for(var i=0;i<result.length;i++){
	                 var item = result[i]; 
	            	 this.panel.setData(item.layer,item.f.features,item.f.fields);
	            	 count +=item.f.features.length;
	             } 
                 this.featureCount.innerHTML = "总条数:"+count;
             }));
         },
        queryField:"CNNM",
		getLayerResult:function(url,text,layer){
            var defer = new Deferred();
            var queryTask = new QueryTask(url);

            var query = new Query();
            query.returnGeometry = false;
            query.outFields = ["*"];//返回字段
            //query.where = "UPPER("+this.queryField+") LIKE UPPER('%"+text+"%')";//返回字段 QLRMC LIKE '%w%'  UPPER(QLRMC) LIKE UPPER('%w%')
            query.where = "1=1";
            query.geometry = this.currentGeometry;
            //            query.objectIds = ["0"];//加逗号 ' 重要 重要 重要
            query.outSpatialReference = this.map.spatialReference;

            dojo.connect(queryTask, "onComplete",lang.hitch(this, function(featureSet) {

                var ary = [];
                if(featureSet){
                    defer.resolve({f:featureSet,layer:layer});
                }else{
                    defer.resolve([]);
                }
            }));
            //html.setStyle(this.progressBar.domNode, 'display', 'block');
            queryTask.execute(query);
            return defer;
        },
        queryFeatureByInfo:function(data){
        	var url = data.layer.url+"/"+data.layer.id;
        	var attr = data.attr;
//        	var where = "FID='"+attr["FID"]+"'";
        	var where = "FID="+attr["FID"];
        	this.getFeatureByID(url,where);
        },
        getFeatureByID:function(url,where){
        	 var queryTask = new QueryTask(url);

             var query = new Query();
             query.returnGeometry = true;
             query.outFields = ["*"];//返回字段
             query.where = where;
             query.outSpatialReference = this.map.spatialReference;

             dojo.connect(queryTask, "onComplete",lang.hitch(this, function(featureSet) {
 
                 if(featureSet&&featureSet.features&&featureSet.features.length>0){
                	 this.graphicsLayer.clear();
                	 var graphic = featureSet.features[0];
                	 //设置符号
                	 graphic.symbol = this.getSymbolByType(graphic.geometry.type);
                	 this.graphicsLayer.add(graphic);
                	 
                	 this.centerToGeometry(graphic.geometry);
                	 
                 } 
             }));
             //html.setStyle(this.progressBar.domNode, 'display', 'block');
             queryTask.execute(query);
        },
        centerToGeometry:function(geometry){
        	   if(geometry.type === 'point'){
        		   this.map.centerAt(geometry);
        	   }else{
        		   this.map.setExtent(geometry.getExtent().expand(1.4));
        	   }
        },
        getSymbolByType:function(type){
         
        	if(type=="point"){
        		return this.identMarkerSymbol;
        	}else if(type=="polyline"){
        		return this.identLineSymbol;
        	}else if(type=="polygon"){
        		return this.identFillSymbol;
        	}
        },
        isShowFilter:false,
        showLayerFilter:function(){
        	if(this.isShowFilter){       
		    	html.setStyle(this.pop.domNode,"display","none");  
		    	this.isShowFilter = false;
        	}else{
        		html.setStyle(this.pop.domNode,"display","block"); 
        		this.isShowFilter = true;
        	}  
        },
        initLayerFilter:function(){
        	if(!this.filter){
        		this.filter = new LayerFilter({layer:this.oldLayers}); 
        		this.pop = new Popup({
                    content: this.filter,
                    container: "main-page",
                    titleLabel: "图层选择",
                    width: 505,
                    height: 345+30,
					overlayShow:false,
                    buttons: [      
   							{
   							    label: '确定',
   							    onClick: lang.hitch(this, function() {
   							       
   							    	html.setStyle(this.pop.domNode,"display","none");
   							    	this.isShowFilter = false;
   							    	this.updateFilter();
   							     
   							    })
   							} 
                    ]
                });
        		html.setStyle(this.pop.closeBtnNode,"display","none");
        		html.setStyle(this.pop.domNode,"display","none");
        		
        		this.filter.startup();
        		
        		this.updateFilter();
			    	 
        	} 
        },
        updateFilter:function(){
        	var data  = this.filter.getLayers();
	    	this.layers = data.layers;
	    	this.layerFilter.innerHTML =   data.labels;
	    	this.layerFilter.title = data.labels;
        },
        destory:function(){
        	this.inherited(arguments);
        	if(this.drawBox){
                this.drawBox.destroy();
                this.drawBox = null;
            }
        }
        
		
	});
});