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
        "dojo/text!./template/MapTitle.html",
        "dojo/topic",
        "dojo/Deferred",
        "esri/map",
        "dojo/on",
        "base/utils/commonUtils"
        ],function(
        	declare,
        	lang,
			html,
			fx,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
    		Deferred,
    		Map,
    		on,
    		commonUtils
    	 
        ){
	return declare("base.map.widgets.MapTitle", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args); 
			
			this.own(topic.subscribe("map/mapTitleName/change",lang.hitch(this,this.changeName)));
			this.own(topic.subscribe("map/mapTitleName/changeAll",lang.hitch(this,this.changeNameAll)));
		},
		changeName:function(name){
			this.titleNode.innerHTML = name+this.parameters.title;
		},
		changeNameAll:function(name){
			this.titleNode.innerHTML = name;
		},
		
		postCreate:function(){
			var methodName = "postCreate";
			this.domNode.title = "";
			this.inherited(arguments); 
			this.titleNode.innerHTML = window.DEFAULT_ADNM+this.parameters.title; 
		},
		destroy:function(){
			this.inherited(arguments);
		}
	});
});