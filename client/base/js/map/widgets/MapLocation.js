/*
 Richway dlw
 */

define([
        'dojo/_base/declare',
        'dojo/_base/html',
        'dojo/query',
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/dom-attr",
        'dojo/_base/lang',
        "dojo/on",
        "dojo/topic",
        "esri/dijit/LocateButton",
        "./MapPluginIcon"
    ],
    function (declare,
              html,
              query,
              domConstruct,
              domStyle,
              domAttr,
              lang,
              on,
              topic,
              LocateButton,
              MapPluginIcon
    ) {
        var clazz = declare("base.map.widgets.MapLocation",[MapPluginIcon], {
            /* global apiUrl */
            templateString: '<div data-dojo-attach-point="boxNode"></div>',

            position: {"top": 130, "width": 35, "height": 35, "right": 30},

            constructor: function (args) {

            },
            startup: function () {
                this.inherited(arguments);

                this.createLocation();
            },
            createLocation: function () {
                var json = {
                    "locateButton": {
                        "geolocationOptions": {
                            "timeout": 15000
                        },
                        "highlightLocation": true
                    }
                };
                json.map = this.map;

                if (window.navigator.geolocation) {
                    var geoLocate = new LocateButton(json);
                    geoLocate.startup();
                    html.place(geoLocate.domNode, this.domNode);
                    this.own(on(geoLocate, "locate", lang.hitch(this, this.locate)));
                } else {
                    html.create('div', {
                        'class': 'place-holder',
                        title: "浏览器不支持定位"
                    }, this.domNode);
                }

            },
            locate: function(parameters){
                if(parameters.error){
                    topic.publish("base/manager/message",{state:"error",title:"获取位置",content:parameters.error.message});
                }
            }
        });
        return clazz;
    });