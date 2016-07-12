/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    "dojo/dom-construct",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/ListPanel.html",
        "dojo/topic",
        "dojo/Deferred",
        "esri/map",
        "./ListItem"
        ],function(
        	declare,
        	lang,
			html,
			domConstruct,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
    		Deferred,
    		Map,
    		ListItem
    	 
        ){
	return declare("base.map.dijit.ListPanel", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		map:null,
  
		constructor: function(args){
			var methodName = "constructor"; 
			declare.safeMixin(this, args);
		},
		
		postCreate:function(){
			var methodName = "postCreate"; 
			this.inherited(arguments);
		},
		startup:function(){
			this.inherited(arguments);
			
		},
		list:[],
		setData:function(layer,features,fileds){
		 
			for(var n =0;n<features.length;n++){
				var item = features[n];
				var node = new ListItem({f:item,layer:layer,fileds:fileds});  
				domConstruct.place( node.domNode, this.domNode);
				
				this.list.push(node);
			}
			
		},
		clearData:function(){
			 
			for(var k =0;k<this.list.length;k++){
				this.list[k].destroy();
			}
			
			this.list = [];
		}
		
		
	});
});