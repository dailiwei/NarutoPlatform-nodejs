/*
 Richway dlw
 */

define([
        'dojo/_base/declare',
        'dojo/_base/html',
        'dojo/query',
        'base/_BaseWidget',
        "dijit/_TemplatedMixin",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/dom-attr",
        'dojo/_base/lang',
        "dojo/on",
        "dojo/topic"
    ],
    function (declare,
              html,
              query,
              BaseWidget,
              _TemplatedMixin,
              domConstruct,
              domStyle,
              domAttr,
              lang,
              on,
              topic
    ) {
        var clazz = declare([BaseWidget,_TemplatedMixin], {
            /* global apiUrl */
            normalHeight: 0,
            bottomPosition: 0,
            facepanelDiv: null,
            openHeight: 28,
            templateString: '<span data-dojo-attach-point="boxNode">' +
            '<img data-dojo-attach-point="imgNode" title="缩放到初始范围" src="base/images/map/location.png" style="cursor:pointer;width: 35px; height: 35px; position: absolute; ">' +

            "</span>",

            position:{"top":115,"width":35,"height":35,"right":30},

            map:null,
            constructor:function(args){
                this.inherited(arguments);
                this.map = args.map;
            },
            startup: function () {
                this.inherited(arguments);

                this.initLayout();

                this.own(on(this.imgNode, 'click', lang.hitch(this, this.change2FullExtent)));

            },
            change2FullExtent:function(){
//            	 if(this.map["view2D"]){
//            		
//            	 
//            	 }else{
//            		 this.map.setExtent(window.MAP_FULLEXTENT);
//            	 }
            	 
            	 topic.publish("gis/map/setExtent",{
        			 "xmin":window.MAP_FULLEXTENT.xmin,
        			 "ymin":window.MAP_FULLEXTENT.ymin,
        			 "xmax":window.MAP_FULLEXTENT.xmax,
        			 "ymax":window.MAP_FULLEXTENT.ymax
        			 }
        		 )
               
                //topic.publish("extentChanged",polyGon.getExtent().expand(1.5));
            },
            currentHeight: 30,

            panelWidth: 300,//面板的宽度
            panelHeight: 300,//面板的高度
            panelMiniHeight: 30,
            panelLeft: 0,
            panelTop: 0,
            panelBottom: 0,
            panelRight: 0,

            initLayout: function () {

                if (this.position.width) {
                    this.panelWidth = this.position.width;
                }
                if (this.position.height) {
                    this.panelHeight = this.position.height;
                }
                if (this.position.left) {
                    this.panelLeft = this.position.left;
                }
                if (this.position.top) {
                    this.panelTop = this.position.top;
                }
                if (this.position.bottom) {
                    this.panelBottom = this.position.bottom
                }
                if (this.position.right) {
                    this.panelRight = this.position.right;
                }

                domStyle.set(this.domNode, "width", this.panelWidth + "px");
                domStyle.set(this.domNode, "height", this.panelHeight + "px");
                domStyle.set(this.domNode, "top", this.panelTop + "px");
                //domStyle.set(this.domNode, "left", this.panelLeft + "px");
                //domStyle.set(this.domNode, "top", "auto");
                domStyle.set(this.domNode, "left", "auto");
                domStyle.set(this.domNode, "right", this.panelRight + "px");
                domStyle.set(this.domNode, "bottom", "auto");
                domStyle.set(this.domNode, "position", "absolute");
            }
        });

        clazz.inPanel = false;
        clazz.hasUIFile = false;
        return clazz;
    });