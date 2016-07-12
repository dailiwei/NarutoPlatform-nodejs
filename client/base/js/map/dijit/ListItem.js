/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    'dojo/on',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/ListItem.html",
        "dojo/text!./css/ListItem.css",
        "dojo/topic",
        "dojo/Deferred",
        "esri/map"
        ],function(
        	declare,
        	lang,
			html,
			on,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		css,
    		topic,
    		Deferred,
    		Map
    	 
        ){
	return declare("base.map.dijit.ListItem", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template, 
  
		baseClass:'base-map-dijit-ListItem',
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args);
			this.setCss(css);
		},
		nameField:"CNNM",
		postCreate:function(){
			var methodName = "postCreate"; 
			this.inherited(arguments);
			
			//判断类型
			if(this.layer.type=="point"){
				html.addClass(this.geometryIcon,"icon_map_point");
			}else if(this.layer.type=="polygon"){ 
				html.addClass(this.geometryIcon,"icon_map_polygon"); 
			}else if(this.layer.type=="polyline"){
				html.addClass(this.geometryIcon,"icon_map_line"); 
			} 
			
			this.featureName.innerHTML = this.f.attributes[this.nameField];
			var attr = this.f.attributes;
			var attrStr ="";
			var fileds = this.fileds;
			for(var i=0;i<fileds.length;i++){
				attrStr+=fileds[i].alias+":"+attr[fileds[i].name] +",";
			}
			attrStr = attrStr.substring(0,attrStr.length-2);
			this.desInfo.innerHTML = "图层("+this.layer.name+"),属性:"+attrStr;
			this.desInfo.title = "图层("+this.layer.name+"),属性:"+attrStr;
			
			this.own(on(this.domNode, 'click', lang.hitch(this, this.onClick)));
		},
		onClick:function(){
			topic.publish("gis/map/query",{layer:this.layer,"attr":this.f.attributes});
		},
		destroy:function(){
			this.inherited(arguments);
		}
		
	});
});