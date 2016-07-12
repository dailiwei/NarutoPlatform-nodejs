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

        return declare("base.map.exlayers.CloudLayer3D", GraphicsLayer, {


            picpath: "",
            ImageListAcc: [],
            _layers: [],
            isplay: false,

            imageType: "test",//图像的类别
            catalog:"",
            map:null,
            constructor: function (args) {
                declare.safeMixin(this, args);

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

                //this._setMap();
                this.getPicPath(this.imageType);
            },
            destroy:function(){
                //移除监听
                var list = this.handlers;
                for (var i = 0, max = list.length; i < max; i++) {
                     var item = list[i];
                     item.remove();
                }

                var layers = this.map.imageryLayers;
                if(this.cloudLayers&&this.cloudLayers.length>0){

                    for(var i=0;i<this.cloudLayers.length;i++){
                        try{
                            layers.remove(this.cloudLayers[i], true);
                        }catch(e){

                            Logger.log("wrong");
                        }
                    }
                }

                this.cloudLayers = [];
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
            setMap: function (map) {
                this.map = map;
            },
            _setMap: function(){

                alert(1);
                //测试后台返回一组数据
                this.getTestData();
                //测试叠加一个的

                //setTimeout(lang.hitch(this,function(){
                //    this.initLayer();
                //    var data = {
                //        "xmin":61.5,
                //        "ymin":6,
                //        "xmax":145,
                //        "ymax":60,
                //        "url":"http://typhoon.weather.com.cn/data/fy2cd_eir_achn_webMercator/2014/12/13/20141213020000.PNG"
                //    };
                //    topic.publish("layer/"+this.catalog+"/oneImage",data);
                //}),5000);

                return this.inherited(arguments);
            },

            setVis: function (vis) {
                if (vis) {
                } else {
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
            },

            initLayer: function () {
            },

            _play: function () {
                this.startplay();
            },

            startplay:function(){
                //加载淹没数据
                var layers = this.map.imageryLayers;

                this.cloudLayers = [];
                var cloudsPromise = [];

                var datas = this.ImageListAcc;
                for(var i=0;i<datas.length;i++){
                    var lyr = new Cesium.SingleTileImageryProvider({
                        url : this.picpath+datas[i].name+'.png',
                        rectangle : Cesium.Rectangle.fromDegrees(61.5,6,145,60)
                        //经纬度就是对角线的经纬度，每个TIF的范围可能都不一样
                    });

                    var lyr1 = layers.addImageryProvider(lyr);
                    lyr1.show =true;
                    lyr1.alpha =0.0;
                    this.cloudLayers.push(lyr1);
                    cloudsPromise.push(lyr.readyPromise);
                }
                //image加载完了之后执行
                Cesium.when.all(cloudsPromise).then(lang.hitch(this,function(){
                    alert("演进图片加载完成!!!");
                    var index = 0;
                    var max = this.cloudLayers.length-1;
                    var showAlpha = 0.7;
                    var self = this;
                    var st =  window.setInterval(function(){
                        if(index ==0){
                            self.cloudLayers[index].alpha = showAlpha;
                        }else{
                            self.cloudLayers[index-1].alpha = 0.0;
                            self.cloudLayers[index].alpha = showAlpha;
                        }

                        index++;
                        if(index==max){
                            clearInterval(st);
                        }

                    }, 300);//演进速度
                }));
            },
            _update: function () {
            },

            ShowOneImage: function (url) {
                this.stopplay();

            },
            stopplay: function () {
                this.isplay = false;
            }

        });
    });