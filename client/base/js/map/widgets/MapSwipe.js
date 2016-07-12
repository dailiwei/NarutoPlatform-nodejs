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
        "dojo/text!./template/MapSwipe.html",
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
	return declare("base.map.widgets.MapSwipe", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,
 
		// 同期的影像地图的对比
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