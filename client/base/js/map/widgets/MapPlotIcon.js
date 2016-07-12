/*
 Richway dlw
 */

define([
        'dojo/_base/declare',
        'dojo/_base/html',
        'dojo/query',
        "dojo/_base/fx",
        'base/_BaseWidget',
        "dijit/_TemplatedMixin",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/dom-attr",
        'dojo/_base/lang',
        "dojo/on",
        "base/map/widgets/MapPlot",
        'base/widget/Popup'
    ],
    function (declare,
              html,
              query,
              fx,
              BaseWidget,
              _TemplatedMixin,
              domConstruct,
              domStyle,
              domAttr,
              lang,
              on,
              MapPlot,
              Popup) {
        var clazz = declare("base.map.widgets.MapPlotIcon", [BaseWidget, _TemplatedMixin], {
            /* global apiUrl */
            templateString: '<span data-dojo-attach-point="boxNode">' +
            '<button    title="打开标绘" type="button" class="btn btn-default"  style="width: 35px; height: 35px;">' +
            '<span class="fa fa-paint-brush" style="margin-left: -3px;font-size:17px;" aria-hidden="true"></span>' +
            '</button>' +
            "</span>",

            position: {"top": 315, "width": 35, "height": 35, "right": 30,"bottom":"auto","left":"auto"},

            map: null,
            plotWidget: null,
            constructor: function (args) {
                this.inherited(arguments);
                this.map = args.map;
            },
            startup: function () {
                this.inherited(arguments);

                this.initLayout();

                this.own(on(this.boxNode, 'click', lang.hitch(this, this.showPlot)));

            },
            showPlot: function () {

                if (this.plotWidget) {

                } else {
                    this.plotWidget = new MapPlot({parameters: {map:this.map,withGrid:true,plotProps: 'types:["polyline","polygon","text"],showClear:true'}});
                    var pop = new Popup({
                        titleLabel: "标绘面板",
                        content: this.plotWidget,
                        width: 397,
                        height: dojo.window.getBox().h,
                        button: [],
                        //canMove:false,
                        overlayShow:false,
                        onClose: lang.hitch(this, function () {
                            this.plotWidget = null;
                            return true;
                        })

                    });

                    fx.animateProperty(
                        {
                            node: pop.domNode,
                            properties: {left: {end: dojo.window.getBox().w - 397}},
                            duration: 500
                        }).play();
                    this.plotWidget.startup();
                }
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