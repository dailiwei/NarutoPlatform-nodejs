define(['dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/_base/Color',
        'dojo/_base/array',
        'dojo/_base/html',
        'dojo/topic',

        'esri/layers/GraphicsLayer',
        'esri/graphic',
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/PictureMarkerSymbol',
        'esri/geometry/Polyline',
        'esri/symbols/SimpleLineSymbol',
        'esri/geometry/Polygon',
        'esri/symbols/SimpleFillSymbol',
        "esri/layers/MapImage",
        "esri/layers/MapImageLayer"
    ],
    function (lang,
              declare,
              Color,
              array,
              html,
              topic,

              GraphicsLayer,
              Graphic,
              Point,
              SimpleMarkerSymbol,
              PictureMarkerSymbol,
              Polyline,
              SimpleLineSymbol,
              Polygon,
              SimpleFillSymbol,
              MapImage,
              MapImageLayer) {

        return declare("base.map.exlayers.CloudLayer", GraphicsLayer, {


            layer1: null,
            layer2: null,
            layer3: null,
            image1: null,
            image2: null,
            image3: null,
            picpath: "",
            ImageListAcc: [],
            _layers: [],
            isplay: false,

            imageType: "test",//图像的类别
            catalog:"",

            constructor: function (args) {

                this.ImageListAcc = [];
                this._layers = [];
                this.handlers = [];
                //图层控制读取这个id作为
                this.id = args.parameters.layerName;
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = args.parameters.catalog;


                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/visible", lang.hitch(this, this.setVis)));
                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/play", lang.hitch(this, this._play)));
                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/stop", lang.hitch(this, this.stopplay)));
                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/data", lang.hitch(this, this.getData)));
                this.handlers.push(topic.subscribe("layer/"+this.catalog+"/oneImage", lang.hitch(this, this.addImageLayer)));

            },
            destroy:function(){
                //移除监听
                var list = this.handlers;
                for (var i = 0, max = list.length; i < max; i++) {
                     var item = list[i];
                     item.remove();
                }

                //删除图层
                var list1 = this._layers;
                for (var i = 0, max1 = list1.length; i < max1; i++) {
                     var item1 = list1[i];
                     item1.removeAllImages();
                     this.getMap().removeLayer(item1);
                }
                this.ImageListAcc = null;
            },

            getPicPath: function (type) {
                var strpicPath = "";
                switch (type)//修改成下拉框的值
                {
                    case "红外卫星云图":
                    {
                        strpicPath = "fy2cd_eir_achn_webMercator/";
                        break;
                    }
                    case "雷达回波拼图":
                    {
                        strpicPath = "radar_cref_webMercator/";
                        break;
                    }
                    case "test":
                    {
                        strpicPath = "simple/images/clouds/";
                        break;
                    }
                }
                //this.picpath = APP_ROOT + strpicPath;
                this.picpath =  strpicPath;
            },

            _setMap: function(){

                //测试后台返回一组数据
                //this.getTestData();
                //测试叠加一个的

                //setTimeout(lang.hitch(this,function(){
                //    this.initLayer(); //
                //    //var data = {
                //    //    "xmin":61.5,
                //    //    "ymin":6,
                //    //    "xmax":145,
                //    //    "ymax":60,
                //    //    "url":"http://typhoon.weather.com.cn/data/fy2cd_eir_achn_webMercator/2014/12/13/20141213020000.PNG"
                //    //};
                //    var data = {
                //        "xmin":65.525940,
                //        "ymin": 16.092779,
                //        "xmax":141.907264,
                //        "ymax":  55.30379,
                //        "url":"simple/images/cloud.png"
                //    };
                //    topic.publish("layer/"+this.catalog+"/oneImage",data);
                //}),5000);
                return this.inherited(arguments);
            },

            setVis: function (vis) {
                if (vis) {
                    this.layer1.setVisibility(true);
                    this.layer2.setVisibility(false);
                    this.layer3.setVisibility(false);
                } else {
                    this.layer1.setVisibility(false);
                    this.layer2.setVisibility(false);
                    this.layer3.setVisibility(false);
                }

            },
            firstLoad: true,
            getTestData: function () {

                var url = "simple/temp/clouds.json";
                var der = dojo.xhrPost({
                    url: url,
                    handleAs: "json",
                    content: {}
                });
                der.then(lang.hitch(this, function (json) {
                    //var json = dojo.fromJson(this.testStr);
                    if (json.success == true) {//成功返回

                        if(this.firstLoad){
                            this.getPicPath(this.imageType);
                            this.initLayer();
                            this.firstLoad = true;
                        }
                        topic.publish("layer/"+this.catalog+"/data",json.data);

                    } else {
                        Logger.log("云图查询报错!!!");
                    }
                }));
            },
            getData:function(data){
                this.ImageListAcc = data;
                //加载第一张
                if (this.ImageListAcc.length > 0) {
                    this.ShowOneImage(this.ImageListAcc[0].name);

                    this._play();
                }
            },
            addImageLayer:function(data){

                if(this.firstLoad){
                    this.initLayer();
                    this.firstLoad = true;
                }
                this.layer1.removeAllImages();
                var mi = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                    'extent': {'xmin': data.xmin, 'ymin': data.ymin, 'xmax': data.xmax, 'ymax': data.ymax, 'spatialReference': {'wkid': 4326}},
                    'href': data.url
                });
                this.layer1.addImage(mi);
                this.layerVisBack();
            },

            initLayer: function () {
                //初始化图层
                this.layer1 = new MapImageLayer();
                //this.layer1.id = "云图图层_1";
                this.getMap().addLayer(this.layer1);
                this.layer2 = new MapImageLayer();
                //this.layer2.id = "云图图层_2";
                this.getMap().addLayer(this.layer2);
                this.layer3 = new MapImageLayer();
                //this.layer3.id = "云图图层_3";
                this.getMap().addLayer(this.layer3);

                this._layers.concat([this.layer1,this.layer2,this.layer3]);
            },

            _play: function () {
                this.startplay();
            },
            _update: function () {
            },

            ShowOneImage: function (url) {
                this.stopplay();
                //加载第一个image到image1
                this.layer1.removeAllImages();
                this.image1 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                    'extent': {'xmin': 61.5, 'ymin': 6, 'xmax': 145, 'ymax': 60, 'spatialReference': {'wkid': 4326}},
                    'href': this.picpath + url +".png"
                });
                this.layer1.addImage(this.image1);
                this.layerVisBack();
            },
            stopplay: function () {
                this.isplay = false;
            },
            layerVisBack: function () {
                this.layer1.setVisibility(true);
                this.layer2.setVisibility(false);
                this.layer3.setVisibility(false);
            },
            startplay: function () {
                this.layerVisBack();

                this.isplay = !this.isplay;
                if (this.isplay) {
                    var endIndex = 0;
                    var startIndex = 0;
                    startIndex = this.ImageListAcc.length - 1;
                    this.image1 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                        'extent': {
                            'xmin': 61.5,
                            'ymin': 6,
                            'xmax': 145,
                            'ymax': 60,
                            'spatialReference': {'wkid': 4326}
                        },
                        'href': this.picpath + this.ImageListAcc[startIndex].name+".png"
                    });
                    this.layer1.removeAllImages();
                    this.layer1.addImage(this.image1);
                    this.image2 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                        'extent': {
                            'xmin': 61.5,
                            'ymin': 6,
                            'xmax': 145,
                            'ymax': 60,
                            'spatialReference': {'wkid': 4326}
                        },
                        'href': this.picpath + this.ImageListAcc[startIndex - 1].name+".png"
                    });
                    this.layer2.removeAllImages();
                    this.layer2.addImage(this.image2);
                    this.image3 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                        'extent': {
                            'xmin': 61.5,
                            'ymin': 6,
                            'xmax': 145,
                            'ymax': 60,
                            'spatialReference': {'wkid': 4326}
                        },
                        'href': this.picpath + this.ImageListAcc[startIndex - 2].name+".png"
                    });
                    this.layer3.removeAllImages();
                    this.layer3.addImage(this.image3);

                    setTimeout(lang.hitch(this, function () {
                        this.playimg(startIndex - 2, endIndex);
                    }), 1000);
                }
            },
            tag: 0,
            sliderValue: 300,
            playimg: function (startIndex, endIndex) {
                //Logger.log("----------------");
                if (this.isplay) {
                    if (startIndex > endIndex) {
                        //imagelist.selectedIndex=startIndex + 1;//改变列表的选中项目
                        this.swapView();
                        if (this.tag == 0) {
                            this.image1 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                                'extent': {
                                    'xmin': 61.5,
                                    'ymin': 6,
                                    'xmax': 145,
                                    'ymax': 60,
                                    'spatialReference': {'wkid': 4326}
                                },
                                'href': this.picpath + this.ImageListAcc[startIndex - 1].name+".png"
                            });
                            this.layer1.removeAllImages();
                            this.layer1.addImage(this.image1);

                            startIndex--;
                            setTimeout(lang.hitch(this, function () {
                                this.playimg(startIndex, endIndex);
                            }), this.sliderValue);
                            this.tag = 1;
                        }
                        else if (this.tag == 1) {
                            this.image2 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                                'extent': {
                                    'xmin': 61.5,
                                    'ymin': 6,
                                    'xmax': 145,
                                    'ymax': 60,
                                    'spatialReference': {'wkid': 4326}
                                },
                                'href': this.picpath + this.ImageListAcc[startIndex - 1].name+".png"
                            });
                            this.layer2.removeAllImages();
                            this.layer2.addImage(this.image2);

                            startIndex--;
                            setTimeout(lang.hitch(this, function () {
                                this.playimg(startIndex, endIndex);
                            }), this.sliderValue);
                            this.tag = 2;
                        }
                        else {
                            this.image3 = new MapImage({//xmin="61.5" ymin="6" xmax="145" ymax="60"
                                'extent': {
                                    'xmin': 61.5,
                                    'ymin': 6,
                                    'xmax': 145,
                                    'ymax': 60,
                                    'spatialReference': {'wkid': 4326}
                                },
                                'href': this.picpath + this.ImageListAcc[startIndex - 1].name+".png"
                            });
                            this.layer3.removeAllImages();
                            this.layer3.addImage(this.image3);
                            startIndex--;
                            setTimeout(lang.hitch(this, function () {
                                this.playimg(startIndex, endIndex);
                            }), this.sliderValue);
                            this.tag = 0;
                        }
                    }
                    else if (startIndex <= endIndex && startIndex > endIndex - 2) {
                        //imagelist.selectedIndex=startIndex + 1;
                        this.swapView();
                        startIndex--;
                        setTimeout(lang.hitch(this, function () {
                            this.playimg(startIndex, endIndex);
                        }), this.sliderValue);

                    }
                    else {
                        this.tag = 0;
                        this.isplay = false;

                    }
                }
            },
            swapView: function () {
                if (this.layer1.visible) {
                    this.layer2.setVisibility(true);
                    this.layer1.setVisibility(false);
                    this.layer3.setVisibility(false);
                }
                else if (this.layer2.visible) {
                    this.layer2.setVisibility(false);
                    this.layer1.setVisibility(false);
                    this.layer3.setVisibility(true);
                }
                else if (this.layer3.visible) {
                    this.layer2.setVisibility(false);
                    this.layer1.setVisibility(true);
                    this.layer3.setVisibility(false);
                }
            }
        });
    });