define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",
        'dojo/topic',
        "base/_BaseWidget",
        'base/widget/Popup'
    ],
    function (lang,
              array,
              declare,
              topic,
              _BaseWidget,
              Popup) {

        return declare("base.map.exlayers.CommonPointLayer3D", [_BaseWidget], { // 三维点图层

            map: null,

            labelLayer: null,
            selected: null,
            showType: "infoWindow",//弹框的方式
            defaultSymbolImage: "base/images/marker/marker_blue.png",
            catalog: "",
            layerName: "",
            showValue: "",
            showName: "adnm",//title显示字段
            idField: "adcd",
            show3DSymbol: false,
            constructor: function (args) {
                this.billboards = null;
                this.labels = null;

                declare.safeMixin(this, args);

                var tStr = 'layer/' + args.parameters.catalog + "/";
                //图层控制读取这个id作为
                this.id = args.parameters.layerName;
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = args.parameters.catalog;
                this.showType = args.parameters.showType;
                this.showValue = args.parameters.showValue;
                this.showName = args.parameters.showName;
                this.popModule = args.parameters.popModule ? args.parameters.popModule : null;
                this.show3DSymbol = args.parameters.show3DSymbol ? args.parameters.show3DSymbol : this.show3DSymbol;
                this.showChildOne = args.parameters.showChildOne?args.parameters.showChildOne:false;
                this.showChildTwo = args.parameters.showChildTwo?args.parameters.showChildTwo:false;

                this.pop = args.parameters.pop ? args.parameters.pop : null;
                this.showImage = args.parameters.showImage ? args.parameters.showImage : null;//数据库中显示地图点的图片
                this.defaultSymbolImage = args.parameters.defaultSymbolImage ? args.parameters.defaultSymbolImage : null;//数据库中显示地图点的默认图片

                //接收服务端的数据
                this.own(topic.subscribe(tStr + "data", lang.hitch(this, this.getData)));
                //控制可见
                this.own(topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis)));
                //label控制可见(附加的文字)
                this.own(topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis)));

                if (this.pop) {
                    require([this.pop.popModule], lang.hitch(this, function (Module) {
                        this.PopClass = Module;//类声明
                    }));
                    this.popParameters = this.pop.parameters;
                } else {
                    require([this.popModule], lang.hitch(this, function (Module) {
                        this.PopClass = Module;//类声明
                    }));
                }

            },

            destroy: function () {
                if (this.show3DSymbol) {
                    for (var i = 0, max = this.labels.length; i < max; i++) {
                        var item = this.labels[i];
                        this.map.entities.remove(item);

                    }
                    for (var i = 0, max = this.billboards.length; i < max; i++) {
                        var item = this.billboards[i];
                        this.map.entities.remove(item);
                    }
                } else {
                    this.billboards.removeAll();
                    this.labels.removeAll();
                }
                this.labels = null;
                this.billboards = null;

                this.inherited(arguments);
            },
            getImageBySTTP: function (item) {
                var image = this.defaultSymbolImage;
                if (image.sttp) {
                    if (item.sttp == "RR") {//水库
                        image = "";
                    } else if (item.sttp == "ZZ" || item.sttp == "ZQ") {//ZZ河道水位站，ZQ河道水文站
                        image = "";
                    } else if (item.sttp == "PP") {
                        image = "";
                    }
                }
                return image;
            },
            setMap: function (map) {
                this.map = map;
            },
            firstLoad: true,
            billboards: null,
            labels: null,
            getData: function (list) {
                //判断下
                if (!lang.isArray(list)) {
                    var ls = list.data;
                    this.filterData = list.filterData;
                    list = ls;
                }

                var newList1 = [];
                var newList2 = [];
                if(this.showChildOne){
                    for (var j = 0, max = list.length; j < max; j++) {
                        var item = list[j];
                        if(item.children&&item.children.length>0){
                            newList1 = newList1.concat(item.children);
                            if(this.showChildTwo){
                                for(var k=0;k<item.children.length;k++){
                                    var item2 = item.children[k];
                                    if(item2.children&&item2.children.length>0){
                                        newList2 = newList2.concat(item2.children);
                                    }
                                }
                            }
                        }
                    }
                }
                list = list.concat(newList1).concat(newList2);

                if (this.show3DSymbol) {
                    if (this.firstLoad) {
                        this.labels = [];
                        this.billboards = [];

                        this.moveHandler();
                        this.firstLoad = false;
                    } else {
                        for (var i = 0, max = this.labels.length; i < max; i++) {
                            var item = this.labels[i];
                            this.map.entities.remove(item);

                        }
                        for (var i = 0, max = this.billboards.length; i < max; i++) {
                            var item = this.billboards[i];
                            this.map.entities.remove(item);
                        }
                        this.labels = [];
                        this.billboards = [];
                    }
                    this.datas = {};


                    var numbers = [];
                    //计算下比例
                    for (var i = 0, max = list.length; i < max; i++) {
                        numbers.push(list[i][this.showValue]);
                    }
                    var maxNum = 500000.0;
                    var maxInNumbers = Math.max.apply(Math, numbers);
                    var minInNumbers = Math.min.apply(Math, numbers);
                    var scale = maxNum / (maxInNumbers - minInNumbers);


                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        var lgtd = item.lgtd;
                        var lttd = item.lttd;

                        var label = this.map.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(lgtd, lttd),
                            text: item[this.showName],
                            font: '12px sans-serif',
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(15, 15),
                            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5)
                        });

                        this.labels.push(label);

                        var ent = this.map.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(lgtd, lttd, 0.0),
                            id: item[this.idField],
                            ellipse: {
                                id: item[this.idField],
                                semiMinorAxis: 30000.0,
                                semiMajorAxis: 30000.0,
                                extrudedHeight: item[this.showValue] * scale,
                                material: Cesium.Color.GREEN.withAlpha(0.9),
                                outline: false
                            }
                        });

                        this.billboards.push(ent);
                        this.datas[item[this.idField]] = item;
                    }
                }
                else {
                    if (this.firstLoad) {
                        this.labels = this.map.scene.primitives.add(new Cesium.LabelCollection());
                        this.billboards = this.map.scene.primitives.add(new Cesium.BillboardCollection());

                        this.moveHandler();
                        this.firstLoad = false;
                    } else {
                        this.billboards.removeAll();
                        this.labels.removeAll();
                    }
                    this.datas = {};

                    for (var i = 0; i < list.length; i++) {
                        var lgtd = list[i].lgtd;
                        var lttd = list[i].lttd;
                        this.labels.add({
                            position: Cesium.Cartesian3.fromDegrees(lgtd, lttd),
                            text: list[i][this.showName],
                            font: '12px sans-serif',
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(15, 15),
                            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5)
                        });
                        this.billboards.add({
                            image: "base/images/marker/marker_blue.png",
                            position: Cesium.Cartesian3.fromDegrees(lgtd, lttd),
                            id: list[i][this.idField],
                            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),//根据距离放大
                            translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.2)//根据距离模糊

                        });
                        this.datas[list[i][this.idField]] = list[i];
                    }
                }

                this.setVis(this.currentVis);

            },

            setVisible: function (vis) {//设置可见不可见
                if (this.show3DSymbol) {
                    if (this.billboards) {
                        var len = this.billboards.length;
                        for (var i = 0; i < len; ++i) {
                            var b = this.billboards[i];
                            b.show = vis;
                        }
                        var len = this.labels.length;
                        for (var i = 0; i < len; ++i) {
                            var b = this.labels[i];
                            b.show = vis;
                        }
                    }
                } else {
                    if (this.billboards) {
                        var len = this.billboards.length;
                        for (var i = 0; i < len; ++i) {
                            var b = this.billboards.get(i);
                            b.show = vis;
                        }
                        var len = this.labels.length;
                        for (var i = 0; i < len; ++i) {
                            var b = this.labels.get(i);
                            b.show = vis;
                        }
                    }
                }

            },
            moveHandler: function () {
                var handler = new Cesium.ScreenSpaceEventHandler(this.map.scene.canvas);
                handler.setInputAction(lang.hitch(this, this.clickHandler), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            clickHandler: function (movement) {
                var pickedObjects = this.map.scene.drillPick(movement.position);
                if (Cesium.defined(pickedObjects)) {
                    if (this.show3DSymbol) {
                        for (var i = 0; i < pickedObjects.length; ++i) {
                            var obj = pickedObjects[i].id;
                            if (this.datas.hasOwnProperty(obj._id)) {
                                this.openWindow(this.datas[obj._id]);
                                break;
                            }
                        }
                    } else {
                        for (var i = 0; i < pickedObjects.length; ++i) {
                            var obj = pickedObjects[i].primitive;
                            if (this.datas.hasOwnProperty(obj.id)) {
                                this.openWindow(this.datas[obj.id]);
                                break;
                            }
                        }
                    }

                }
            },
            openWindow: function (item) {
                //点击测站的弹出框的内容，面板，单独的widget 可传参数
                var panel = new this.PopClass({
                    data: item,
                    parameters: this.popParameters ? this.popParameters : {},
                    filterData: this.filterData ? this.filterData : null
                });

                //if (this.showType == "infoWindow") {
                //    this.getMap().infoWindow.setTitle(item[this.showName]);
                //    this.getMap().infoWindow.setContent(panel.domNode);
                //
                //    var pt = new Point(item.lgtd, item.lttd);
                //    this.getMap().infoWindow.show(pt);
                //    this.getMap().infoWindow.resize(panel.width, 345);//设置大小 里面的widget也设置需要
                //} else {
                var pop = new Popup({
                    content: panel,
                    container: "main-page",
                    titleLabel: item[this.showName],
                    width: 505,
                    height: 345 + 30,
                    buttons: []
                });
                panel.startup();
                //}
            },
            createPopWindow: function (item) {//弹出对应的面板
                var panel;
                switch (item.sttp) {
                    case "PP"://雨量站
                    case "ZP"://同位站
                    case "RP"://同位站
                    case "RR"://水库站
                    case "ZZ"://河道站
                    case "VV"://视频站
                    case "SS"://墒情站
                    case "II"://图像站
                    case "DR"://排水站
                    case "MM"://气象站
                    case "BB"://蒸发站
                    case "DD"://堰闸
                        return;
                    default:
                        return;
                }
            },
            levelNum: 10,//label的显示级别
            changeGraphicState: function (evt) {
                if (!this.currentVis)return;
                this.changeLabelVis();
            },

            currentVis: true,
            labelVis: false,
            setVis: function (vis) {
                this.currentVis = vis;
//                this.setVisibility(vis);
                this.setVisible(vis);
            }


        });
    });