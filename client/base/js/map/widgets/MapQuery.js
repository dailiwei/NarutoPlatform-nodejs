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
        "dojo/text!./template/MapQuery.html",
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
	return declare("base.map.widgets.MapQuery", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,
 
		// 集成框选，点击，关键字等三种查询方式为一体，提供配置功能
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