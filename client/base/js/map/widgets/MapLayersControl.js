/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/_base/fx",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/text!./template/MapLayersControl.html",
    "dojo/text!./css/MapLayersControl.css",
    "dojo/topic",
    "dojo/on",
    "rdijit/form/CheckBox",
    "./MapPlugin"
], function (declare,
             lang,
             html,
             fx,
             domConstruct,
             domClass,
             template,
             css,
             topic,
             on,
             CheckBox,
             MapPlugin
) {
    return declare("base.map.widgets.MapLayersControl", [MapPlugin], {
        templateString: template,
        baseClass: 'base-map-widgets-MapLayersControl',
        map: null,

        isShow: null,
        constructor: function (args) {
            this.setCss(css);
            this.initVars();
        },
        initVars: function () {
            this.isShow = false;
        },

        initEvent: function () {

            this.own(on(window.document, "click", lang.hitch(this, function (evt) {

                if (this.listContainer) {
                	 if (this.isShow) {
                         fx.animateProperty(
                             {
                                 node: this.listContainer,
                                 properties: {
                                     opacity: {start: 1, end: 0}
                                 },
                                 duration: 500
                             }).play();
                         html.setStyle(this.listContainer, 'display', 'none');

                         this.isShow = false;
                     }
                }
            })));
             
        },

        postCreate: function () {
            this.inherited(arguments);
            this.initEvent();
        },

        _click: function () {
        },

        showLayers: function (event) {

            domConstruct.empty(this.listContainer);

            var baselayers = [];
            for(var k=0;k< this.map.layerIds.length;k++){
                if (this.map.layerIds[k].indexOf("_") >= 0) {
                    baselayers.push(this.map.layerIds[k]);
                }
            }
            for (var n = 0; n < baselayers.length; n++) {
                this.createItemLayer(baselayers[n]);
            }

            var layers = this.map.graphicsLayerIds;
            //0: "雨情监视图层"1: "graphicsLayer0"
            for (var i = 0; i < layers.length; i++) {

                if (layers[i].indexOf("graphic") >= 0) {
                    continue;
                }
                this.createItemLayer(layers[i]);
            }

            this.changeState();
            dojo.stopEvent(event);
        },

        changeState: function () {
            if (this.isShow) {
                fx.animateProperty(
                    {
                        node: this.listContainer,
                        properties: {
                            opacity: {start: 1, end: 0}
                        },
                        duration: 500
                    }).play();
                html.setStyle(this.listContainer, 'display', 'none');

                this.isShow = false;
            } else {
                fx.animateProperty(
                    {
                        node: this.listContainer,
                        properties: {
                            opacity: {start: 0, end: 1}
                        },
                        duration: 500
                    }).play();
                html.setStyle(this.listContainer, 'display', 'block');
                this.isShow = true;
            }
        },

        createItemLayer: function (id) {
            var itemlistItemDiv = domConstruct.create("li");

            domClass.add(itemlistItemDiv, "list-group-item layer-item"); 
            domConstruct.place(itemlistItemDiv, this.listContainer);

            var vis = this.map.getLayer(id).visible;
            var ckb_fb = new CheckBox({
                label: id,
                checked: vis,//设置选中状态
                onChange: lang.hitch(this, function (state, label) {
                    var catalog = this.map.getLayer(label).catalog;
                    topic.publish("layer/" + catalog + "/visible", state);
                    dojo.stopEvent(event);
                })
            });
            ckb_fb.placeAt(itemlistItemDiv);
            ckb_fb.startup();

            if(this.map.getLayer(id).isClusters){
            	
            	var vis = this.map.getLayer(id)._isclusterNow;
            	var catalog = this.map.getLayer(id).catalog;
                var ckb_fb2 = new CheckBox({
                	style:"float:right",
                    label: "聚合",
                    checked: vis,//设置选中状态
                    onChange: lang.hitch(this, function (state, label) {  
	                    topic.publish(catalog+"/layer/cluster",state); 
	                    dojo.stopEvent(event);
                    })
                });
                ckb_fb2.placeAt(itemlistItemDiv);
                ckb_fb2.startup();
            }
        }
    });
});