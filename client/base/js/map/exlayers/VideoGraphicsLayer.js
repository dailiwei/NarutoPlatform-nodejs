define(['dojo/_base/lang', 'dojo/_base/array', "dojo/_base/declare", "dijit/Dialog", "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/topic', 'dojo/_base/Color',
        'base/widget/Popup',
        './RainChartPanel'
        ],
    function (lang, array, declare,
              Dialog, _WidgetBase, _TemplatedMixin, topic, Color,
              Popup,RainChartPanel ) {
        return declare("base.map.exlayers.VideoGraphicsLayer",[_WidgetBase], { // 视频图层

            type: "video",
            map: null,
            constructor: function () {
            	 
                topic.subscribe("gis/layer/data", lang.hitch(this, this.showSymbol));
                topic.subscribe("layer/Rain/data", lang.hitch(this, this.showSymbol));


                //this.on("mouse-over", function (evt) {
                //    this.getMap().setMapCursor("pointer");
                //});
                //
                //this.on("mouse-out", function (evt) {
                //    this.getMap().setMapCursor("default");
                //    this.getMap().infoWindow.hide();
                //
                //});
                //this.on("click", function (evt) {
                //    var selected = evt.graphic;
                //    var item = selected.attributes;
                //
                //    var panel = new VideoPanel({
                //        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                //        label: "视频站:"+item.stnm,
                //        stcd: item.stcd
                //    });
                //    var pop = new MyPopup({
                //        content: panel,
                //        container: "main-page",
                //        titleLabel: "视频站:"+item.stnm,
                //        width: 600,
                //        height: 460,
                //        buttons: []
                //    });
                //});
            },
            firstLoad: true,
            billboards: null,
            labels:null,
            showSymbol: function (list) {

                if (this.firstLoad) {
                    this.labels = this.map.scene.primitives.add(new Cesium.LabelCollection());
                    this.billboards = this.map.scene.primitives.add(new Cesium.BillboardCollection());

                    this.moveHandler();
                    this.firstLoad = false;
                } else {
                    this.billboards.removeAll();
                    this.labels.removeAll();
                }
                list = list.data?list.data:list;
                for (var i = 0; i < list.length; i++) {
                    var lgtd = list[i].lgtd;
                    var lttd = list[i].lttd;
                    this.labels.add({
                        position : Cesium.Cartesian3.fromDegrees(lgtd,lttd),
                        text     : list[i].stnm,
                        font : '12px sans-serif',
                        horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                        pixelOffset : new Cesium.Cartesian2(15, 15),
                        id:list[i]
                        // pixelOffsetScaleByDistance : new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5)
                    });
                    this.billboards.add({
                        image : this.getIconBySttp(list[i]),
                        position : Cesium.Cartesian3.fromDegrees(lgtd,lttd),
                        id:list[i]
                    });



                }
            },
            changeGraphicState: function (evt) {

            },
            setVisible:function (vis){//设置可见不可见
                var len = this.billboards.length;
                for (var i = 0; i < len; ++i) {
                    var b = this.billboards.get(i);
                    b.show = vis;
                }
            },
            moveHandler:function (){
                // If the mouse is over the billboard, change its scale and color
                var handler = new Cesium.ScreenSpaceEventHandler(this.map.scene.canvas);
                handler.setInputAction(lang.hitch(this,this.getObj),
                    Cesium.ScreenSpaceEventType.LEFT_CLICK
                );
            },
            getObj:function (movement){
                //// clear picked flags
                //var numberOfPrimitves = this.map.scene.primitives.length;
                //for (var i = 0; i < numberOfPrimitves; ++i) {
                //    var p = this.map.scene.primitives.get(i);
                //    p.processedPick = false;
                //}
                //
                //// get an array of all primitives at the mouse position
                //var pickedObjects = this.map.scene.drillPick(movement.endPosition);
                //if(Cesium.defined(pickedObjects)) {
                //    for( i=0; i<pickedObjects.length; ++i) {
                //        var polygon = pickedObjects[i].primitive;
                //
                //        //if(polygon.picked === false) {
                //
                //            polygon.scale = 2.0;
                //            polygon.color = Cesium.Color.YELLOW;
                //            polygon.picked = true;
                //        //}
                //
                //        polygon.processedPick = true;
                //    }
                //}
                //
                //// return unpicked primitives to their original color
                //for (i = 0; i < numberOfPrimitves; ++i) {
                //    var primitive = this.map.scene.primitives.get(i);
                //
                //    if(primitive.processedPick === false) {
                //        primitive.picked = false;
                //    }
                //}


                var pickedObjects = this.map.scene.drillPick(movement.position);
                if(Cesium.defined(pickedObjects)) {
                    for( i=0; i<pickedObjects.length; ++i) {
                        var obj = pickedObjects[i].primitive;
                        var panel = new RainChartPanel({
                            img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                            label: "视频站:",
                            data: obj.id
                        });
                        var pop = new Popup({
                            content: panel,
                            container: "main-page",
                            titleLabel: " ",
                            width: 600,
                            height: 460,
                            buttons: []
                        });

                        break;
                    }
                }
            },
            getIconBySttp:function(item){
                if(item.sttp){
                    return APP_ROOT+"base/images/station_icons/14/" + item.sttp + "_1.png";
                }else{
                    return APP_ROOT+"base/images/marker/marker_blue.png";
                }
            },
            addMoreShape: function () {
                this.billboards.add({
                    image: 'images/whiteShapes.png',
                    imageSubRegion: new Cesium.BoundingRectangle(61, 23, 18, 18),
                    position: Cesium.Cartesian3.fromDegrees(-84.0, 39.0),
                    color: new Cesium.Color(0, 0.5, 1.0, 1.0)
                });
                this.billboards.add({
                    image: 'images/whiteShapes.png',
                    imageSubRegion: new Cesium.BoundingRectangle(67, 80, 14, 14),
                    position: Cesium.Cartesian3.fromDegrees(-70.0, 41.0),
                    color: new Cesium.Color(0.5, 0.9, 1.0, 1.0)
                });
                this.billboards.add({
                    image: 'images/whiteShapes.png',
                    imageSubRegion: new Cesium.BoundingRectangle(27, 103, 22, 22),
                    position: Cesium.Cartesian3.fromDegrees(-73.0, 37.0),
                    color: Cesium.Color.RED
                });
                this.billboards.add({
                    image: 'images/whiteShapes.png',
                    imageSubRegion: new Cesium.BoundingRectangle(105, 105, 18, 18),
                    position: Cesium.Cartesian3.fromDegrees(-79.0, 35.0),
                    color: Cesium.Color.YELLOW
                });
            }
        });
    });