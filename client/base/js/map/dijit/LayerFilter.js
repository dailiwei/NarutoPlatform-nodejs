/*
 richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    'dojo/on',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/LayerFilter.html",
        "dojo/text!./css/LayerFilter.css",
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
	return declare("base.map.dijit.LayerFilter", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template, 
  
		baseClass:'base-map-dijit-LayerFilter',
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args);
			this.setCss(css);
		}, 
		labels:[],
		postCreate:function(){
			var methodName = "postCreate"; 
			this.inherited(arguments);

			 
		}, 
		startup:function(){
			this.inherited(arguments);
			
			for(var i=0;i<this.layer.length;i++){
				var item = this.layer[i];
				  var label = html.create('label', { 
					  'id':item.url+"/"+item.id,
	                 'class': 'checkbox-inline',
	                 innerHTML: '<input type="checkbox" checked data-dojo-attach-point="check_all_sttp">'+item.name+''
	              }, this.check_all);
//				  this.own(on(label, 'click', lang.hitch(this, function (evt) {
//					 Logger.log( evt.currentTarget.childNodes[0].checked);
//				  })));
				  this.labels.push(label);
			}
		},
		
		destroy:function(){
			this.inherited(arguments);
		},
		getLayers:function(){
			var layers = [];
			var layersLabels = "";
			for(var i=0;i<this.labels.length;i++){
				var item = this.labels[i];
				if(item.childNodes[0].checked){
					layers.push(this.layer[i]);
					layersLabels +=this.layer[i].name+",";
				}
			}
			layersLabels = layersLabels.substring(0,layersLabels.length-1);
			return {layers:layers,labels:layersLabels};
		}
		
	});
});