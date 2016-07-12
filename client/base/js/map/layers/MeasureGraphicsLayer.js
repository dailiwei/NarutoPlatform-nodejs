define([
    'dojo/_base/lang',
    "dojo/_base/declare",
    "dijit/Dialog",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "esri/layers/GraphicsLayer",
    'dojo/topic',
    'esri/symbols/SimpleMarkerSymbol',
    'dojo/_base/Color',
    'esri/graphic',
    'esri/geometry/Point',
    'dojox/xml/parser',
    'esri/symbols/PictureMarkerSymbol',
    'esri/geometry/Polyline',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/TextSymbol',
    "esri/symbols/Font"
], function (lang, declare, Dialog, _WidgetBase,
             _TemplatedMixin, GraphicsLayer,
             topic, SimpleMarkerSymbol, Color,
             Graphic, Point, parser,
             PictureMarkerSymbol, Polyline,
             SimpleLineSymbol, TextSymbol, Font) {
    return declare("MeasureGraphicsLayer", GraphicsLayer, { // 测量图层

        type: "Measure",
        deletePictureMarkerSymbol: null,
        mySymbol: null,
        graphicsArray: new Array(),
        graphicsLayer: null,
        constructor: function () {
            this.deletePictureMarkerSymbol = new PictureMarkerSymbol("base/images/map/cancel_red.png", 16, 16);
            this.mySymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 6, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1),
                new dojo.Color("#FFFF66"));

            this.on("click", lang.hitch(this, this.clickDeleteSymbol));
            this.on("mouse-over", function (evt) {
                if (evt.graphic != undefined && evt.graphic.id == "DeleteSymbol") {
                    this.getMap().setMapCursor("pointer");
                }
            });

            this.on("mouse-out", function (evt) {
                this.getMap().setMapCursor("default");
            });
        },
        showPoint: function (mp) {
            var pointGra = new Graphic();
            pointGra.geometry = mp;
            pointGra.symbol = this.mySymbol;
            this.add(pointGra);
            this.graphicsArray.push(pointGra);
        },
        showText: function (mp, text, end) {
            var textSymbol;
            if (end) {
                var font = new Font("12px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD);
                textSymbol = new TextSymbol(text + "", font, new Color([255, 0, 0]));
                textSymbol.setOffset(0, 5);
            }
            else {
                var font = new Font("10px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL);
                textSymbol = new TextSymbol(text + "", font, new Color([225, 123, 0]));
                textSymbol.setOffset(0, 5);
            }
            var textGra = new Graphic(mp, textSymbol);
            this.add(textGra);
            this.graphicsArray.push(textGra);

        },
        showDeleteSymbol: function (mp, measureGra) {
            Logger.log("添加了22");
            var sym = new PictureMarkerSymbol("base/images/map/cancel_red.png", 10, 10);
            sym.setOffset(10, -5);
            var graDelete = new Graphic(mp, sym);
            graDelete.id = "DeleteSymbol";
            this.add(graDelete);
            this.graphicsArray.push(graDelete);

        },
        clickDeleteSymbol: function (evt) {
            Logger.log("jinleile");
            if (evt.graphic != undefined && evt.graphic.id == "DeleteSymbol") {
                this.graphicsLayer.clear();
                for (var i = 0; i < this.graphicsArray.length; i++) {
                    this.remove(this.graphicsArray[i]);
                }
                this.graphicsArray = new Array();
            }
            this.getMap().setMapCursor("default");
        }
    });
});