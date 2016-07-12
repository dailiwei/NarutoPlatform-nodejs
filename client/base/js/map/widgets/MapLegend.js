/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/_base/fx",
    "dojo/text!./template/MapLegend.html",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/on",
    "base/utils/commonUtils",
    "./MapPlugin"
], function (declare,
             lang,
             html,
             fx,
             template,
             topic,
             Deferred,
             on,
             commonUtils,
             MapPlugin) {
    return declare("base.map.widgets.MapLegend", [MapPlugin], {
        templateString: template,
        map: null,
        isShow: null,
        // 不同图层的符号的意义的图例的展示，两种：1 是发布的地图的图层的图例；2是动态叠加的图例的展示。比如水情，雨情，墒情，危险区，管网符号等。
        constructor: function (args) {
            this.isShow = false;
        },

        postCreate: function () {
            this.inherited(arguments);

            setTimeout(lang.hitch(this, function () {
                if (!commonUtils.isMobile()) {
                    this.changeState();
                }

            }), 1000);

            this.own(on(window.document, "click", lang.hitch(this, function (evt) {

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
            })));

        },
        showLegend: function (evt) {
            this.changeState();
            dojo.stopEvent(evt);
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
        }


    });
});