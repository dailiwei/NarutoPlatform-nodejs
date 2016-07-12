/**
 * Created by dailiwei on 14/12/18.
 */
define([ "dojo/_base/declare", "dijit/Dialog", "dijit/_WidgetBase",
    "dijit/_TemplatedMixin", "esri/layers/TiledMapServiceLayer" ,"esri/SpatialReference","esri/geometry/Extent","esri/layers/TileInfo"], function(declare,
                                                                                                                                                  Dialog, _WidgetBase, _TemplatedMixin, TiledMapServiceLayer,SpatialReference,Extent,TileInfo) {
    return declare("BaiduLayer", esri.layers.TiledMapServiceLayer, { // create WMTSLayer by extending esri.layers.TiledMapServiceLayer

        type: "baidumap",

        constructor: function(){
            this.spatialReference = new esri.SpatialReference({
                wkid: 102113
            });
            this.initialExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            this.fullExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            //
            this.tileInfo = new esri.layers.TileInfo({
                "rows" : 256,
                "cols" : 256,
                "compressionQuality" : 0,
                "origin" : {
                    "x" : -20037508.342787,
                    "y" : 20037508.342787
                },
                "spatialReference" : {
                    "wkid" : 102113
                },

                "lods" : [{
                    "level" : 0,
                    "resolution" : 156543.033928,
                    "scale" : 591657527.591555
                }, {
                    "level" : 1,
                    "resolution" : 78271.5169639999,
                    "scale" : 295828763.795777
                }, {
                    "level" : 2,
                    "resolution" : 39135.7584820001,
                    "scale" : 147914381.897889
                }, {
                    "level" : 3,
                    "resolution" : 19567.8792409999,
                    "scale" : 73957190.948944
                }, {
                    "level" : 4,
                    "resolution" : 9783.93962049996,
                    "scale" : 36978595.474472
                }, {
                    "level" : 5,
                    "resolution" : 4891.96981024998,
                    "scale" : 18489297.737236
                }, {
                    "level" : 6,
                    "resolution" : 2445.98490512499,
                    "scale" : 9244648.868618
                }, {
                    "level" : 7,
                    "resolution" : 1222.99245256249,
                    "scale" : 4622324.434309
                }, {
                    "level" : 8,
                    "resolution" : 611.49622628138,
                    "scale" : 2311162.217155
                }, {
                    "level" : 9,
                    "resolution" : 305.748113140558,
                    "scale" : 1155581.108577
                }, {
                    "level" : 10,
                    "resolution" : 152.874056570411,
                    "scale" : 577790.554289
                }, {
                    "level" : 11,
                    "resolution" : 76.4370282850732,
                    "scale" : 288895.277144
                }, {
                    "level" : 12,
                    "resolution" : 38.2185141425366,
                    "scale" : 144447.638572
                }, {
                    "level" : 13,
                    "resolution" : 19.1092570712683,
                    "scale" : 72223.819286
                }, {
                    "level" : 14,
                    "resolution" : 9.55462853563415,
                    "scale" : 36111.909643
                }, {
                    "level" : 15,
                    "resolution" : 4.77731426794937,
                    "scale" : 18055.954822
                }, {
                    "level" : 16,
                    "resolution" : 2.38865713397468,
                    "scale" : 9027.977411
                }, {
                    "level" : 17,
                    "resolution" : 1.19432856685505,
                    "scale" : 4513.988705
                }, {
                    "level" : 18,
                    "resolution" : 0.597164283559817,
                    "scale" : 2256.994353
                }, {
                    "level" : 19,
                    "resolution" : 0.298582141647617,
                    "scale" : 1128.497176
                }]
            });

            this.loaded = true;
            this.onLoad(this);
        },
        getTileUrl: function(level, row, col){
            var zoom = level - 1;
            var offsetX = Math.pow(2, zoom);
            var offsetY = offsetX - 1;
            var numX = col - offsetX;
            var numY = (-row) + offsetY;
            zoom = level + 1;
            var num = (col + row) % 8 + 1;

            if (this.type=="baidumap")
            {
                return "http://online3.map.bdimg.com/tile/?qt=tile&x="+ numX +"&y=" + numY +"&z="+ zoom + "&styles=pl";
            }
            else if(this.type=="baiduimage")
            {
                return "http://shangetu2.map.bdimg.com/it/u=x="+ numX +";y=" + numY +";z="+ zoom + ";v=009;type=sate&fm=46";
            }
            else if (this.type == "baidutrain")
            {
                return " ";
            }
            else if (this.type == "baidupoi")
            {
                return "http://online1.map.bdimg.com/tile/?qt=tile&x="+ numX +"&y=" + numY +"&z="+ zoom + "&styles=sl";
            }

        },
        setType: function (type) {


        }
    });
});