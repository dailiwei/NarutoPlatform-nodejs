/*
 Richway dlw
 地图的导航工具
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/MapNavigation.html",
        "dojo/topic",
        "dojo/Deferred",
	    "./MapPluginIcon"
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
			MapPluginIcon
    	 
        ){
	return declare("base.map.widgets.MapNavigation", [MapPluginIcon],{
		templateString: template,
		baseClass:"base-map-widgets-MapNavigation",

		position: {"top": 205, "width": 35, "height": 35, "right": 30},

		constructor: function(args){
		},

		postCreate:function(){
			this.inherited(arguments);
			this.own(on(this.map, 'zoom-end', lang.hitch(this, this._zoomHandler)));
			this._zoomHandler();
		},
		startup:function(){
			this.inherited(arguments);
		},
		_zoomHandler: function(){
			html.removeClass(this.btnZoomIn, this._disabledClass);
			html.removeClass(this.btnZoomOut, this._disabledClass);
			var level = this.map.getLevel();
			var disabledButton = null;
			if(level > -1){
				if(level === this.map.getMaxZoom()){
					disabledButton = this.btnZoomIn;
				}else if(level === this.map.getMinZoom()){
					disabledButton = this.btnZoomOut;
				}
			}
			if(disabledButton){
				html.addClass(disabledButton, this._disabledClass);
			}
		},

		_onBtnZoomInClicked: function(){
			this.map._extentUtil({ numLevels: 1});
		},

		_onBtnZoomOutClicked: function(){
			this.map._extentUtil({ numLevels: -1});
		}
		
	});
});