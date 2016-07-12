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
        "dojo/text!./template/Box.html",
        "dojo/text!./css/Box1.css"
        ],function(
        	declare,
        	lang,
			html,
			on,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		css
    	 
        ){
	return declare("base.map.dijit.Box1", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template, 
  
		baseClass:'base-map-dijit-box1',
		constructor: function(args){
			declare.safeMixin(this, args);
			this.setCss(css);
		},
		postCreate:function(){
			this.inherited(arguments);

		},
		destroy:function(){
			this.inherited(arguments);
		},
		getContainer:function(){
			return this.container;
		}
		
	});
});