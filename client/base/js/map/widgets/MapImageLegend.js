/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    "dojo/_base/fx",
        "./MapPlugin"
        ],function(
        	declare,
        	lang,
			html,
			fx,
            MapPlugin
    	 
        ){
	return declare("base.map.widgets.MapImageLegend", [MapPlugin],{
		templateString: '<div style="display:block"><div style="width:100%;height:100%;padding:0px;background-color:gray"><img data-dojo-attach-point="img" src="base/images/rich/bj-gg3-m.jpg" style="width:100%;height:100%"/></div></div>',
		map:null,
		constructor: function(args){
			if(args&&args.parameters&&args.parameters.url){
				this.imageUrl = args.parameters.url;
			}
		},
		
		postCreate:function(){
			var methodName = "postCreate"; 
			this.inherited(arguments);    
		},
		startup:function(){
		    this.initLayout();
		    if(this.imageUrl){
				this.img.src =  this.imageUrl;
			} 
		},
		panelWidth: 300,//面板的宽度
        panelHeight: 300,//面板的高度
        panelMiniHeight: 30,
        panelLeft: 0,
        panelRight: 0,
        panelTop: 0,
        panelBottom: 0,
		initLayout:function(){
			  if (this.parameters.width) {
                  this.panelWidth = this.parameters.width;
              }
              if (this.parameters.height) {
                  this.panelHeight = this.parameters.height;
              }
              if (this.parameters.left) {
                  this.panelLeft = this.parameters.left;
              }
              if (this.parameters.right) {
                  this.panelRight = this.parameters.right;
              }
              if (this.parameters.top) {
                  this.panelTop = this.parameters.top;
              }
              if (this.parameters.bottom) {
                  this.panelBottom = this.parameters.bottom;
              } 

              html.setStyle(this.domNode, "width", this.panelWidth + "px");
              html.setStyle(this.domNode, "height",this.panelHeight+"px");
              html.setStyle(this.domNode, "top", (this.panelTop + ( this.panelTop=="auto"?"":"px")));
              html.setStyle(this.domNode, "left", this.panelLeft + ( this.panelLeft=="auto"?"":"px"));
              html.setStyle(this.domNode, "right", this.panelRight + ( this.panelRight=="auto"?"":"px"));
              html.setStyle(this.domNode, "bottom", this.panelBottom + ( this.panelBottom=="auto"?"":"px"));
              html.setStyle(this.domNode, "position", "absolute");
		}
		
	});
});