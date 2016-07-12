/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	'dojo/_base/html',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/MapTool.html",
        "dojo/topic",
        "dojo/Deferred",
        "esri/map"
        ],function(
        	declare,
        	lang,
			html,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
    		Deferred,
    		Map
    	 
        ){
	return declare("base.map.widgets.MapTool", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,
 
		// 集成化（放大，缩小，漫游，前后视图，全图）
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args);
		},
		
		postCreate:function(){
			var methodName = "postCreate";
			this.domNode.title = "";
			this.inherited(arguments);
		}
		
	});
});