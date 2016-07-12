/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    "dojo/_base/fx",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget", 
        "dojo/topic",
        "dojo/Deferred",
        "esri/map",
        "dojo/on",
        "base/utils/commonUtils",
        "esri/layers/WMSLayer",
        "esri/geometry/Extent",
        "esri/SpatialReference"
        ],function(
        	declare,
        	lang,
			html,
			fx,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget, 
    		topic,
    		Deferred,
    		Map,
    		on,
    		commonUtils,
    		WMSLayer,
    		Extent,
    		SpatialReference
    	 
        ){
	return declare("base.map.widgets.MapWMS", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: '<div style="display:none"></div>',
		map:null,
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args); 
		},
		
		postCreate:function(){
			var methodName = "postCreate"; 
			this.inherited(arguments);   
			
			this.initLayer();
		},
		initLayer:function(){
			 var  initExtent = new Extent(326335.701161546,222498.798765796,685640.586437984,460359.691154248, new SpatialReference({ wkid: 2422 }));
             
             var resourceInfo = {
   				  extent: initExtent,	
   				  layerInfos:[],
   				  version : '1.1.1'
   		    }; 
            var wmsUrl = "http://192.168.240.185:8080/sisp/atservices/WaterBase/wms?attoken=";
            
            var layers = this.parameters.layerNames;
   		    var wmsLayer = new WMSLayer(wmsUrl,{resourceInfo: resourceInfo,visibleLayers:[layers]});  //
   		    wmsLayer.setImageFormat("png"); 
		    this.map.addLayer(wmsLayer);
		    if(this.parameters&&this.parameters.opacity){
		    	 wmsLayer.setOpacity(this.parameters.opacity);
		    }
		   
		}
		
	});
});