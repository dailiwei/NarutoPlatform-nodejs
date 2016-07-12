/**
 * Created by dailiwei on 16/4/11.
 * 业务图层的基础类，封装通用的接口
 */

define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",
        'dojo/_base/Color',
        'dojo/topic',
        'esri/graphic',
        'esri/geometry/Point',
        "esri/symbols/Font",
        "esri/symbols/TextSymbol",
        'esri/symbols/PictureMarkerSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'esri/geometry/Extent',
        "esri/layers/GraphicsLayer",

        'base/widget/Popup',
        "base/Library"
    ],
    function (lang,
              array,
              declare,
              Color,
              topic,
              Graphic,
              Point,
              Font,
              TextSymbol,
              PictureMarkerSymbol,
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              Extent,
              GraphicsLayer,

              Popup,
              Library
    ) {
        return declare("base.map.exlayers.BaseGraphicsLayer", GraphicsLayer, {
            labelLayer: null,
            selected:null,

            showType:"infoWindow",//弹框的方式

            defaultSymbolImage:{
                "url":"base/images/marker/marker_blue.png",
                "width":"15",
                "height":"15"
            },

            catalog:"",
            layerName:"",

            showValue:"",

            showName:"adnm",//title显示字段
            constructor: function (args) {

                this._library = new Library();
                declare.safeMixin(this, args);

                var tStr = 'layer/' + args.parameters.catalog + "/";
                //图层控制读取这个id作为
                this.id = args.parameters.layerName;
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = args.parameters.catalog;
                this.showType = args.parameters.showType;
                this.showValue = args.parameters.showValue;
                this.showName = args.parameters.showName;
                this.popModule = args.parameters.popModule?args.parameters.popModule:null;

                this.pop = args.parameters.pop?args.parameters.pop:null;
                this.showImage=args.parameters.showImage?args.parameters.showImage:null;//数据库中显示地图点的图片
                this.defaultSymbolImage=args.parameters.defaultSymbolImage?args.parameters.defaultSymbolImage:this.defaultSymbolImage;//数据库中显示地图点的默认图片

                //接收服务端的数据
                topic.subscribe(tStr + "data", lang.hitch(this, this.getData));
                //控制可见
                topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
                //label控制可见(附加的文字)
                topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis));

                this.labelLayer = new GraphicsLayer();

                //鼠标移入 可以做一些显示
                this.on("mouse-over", lang.hitch(this, this.mouseOverHandler));
                //鼠标移出 还原一些配置
                this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
                //鼠标点击 弹框
                this.on("click", lang.hitch(this, this.clickHandler));

                if(this.pop){
                    require([this.pop.popModule], lang.hitch(this, function(Module) {
                        this.PopClass = Module;//类声明
                    }));
                    this.popParameters = this.pop.parameters;
                }else{
                    require([this.popModule], lang.hitch(this, function(Module) {
                        this.PopClass = Module;//类声明
                    }));
                }
            },

            mouseOverHandler: function (evt) {
            },
            mouseOutHandler: function (evt) {
            },
            clickHandler: function (evt) {
                var selected = evt.graphic;
                var item = selected.attributes;
                this.openWindow(item);
            },
            openWindow: function (item) {
                //这个也是配置出来的应该，弹出框
                var nowDate = new Date();
                var startTm = new Date();
                startTm.setDate(nowDate.getDate() - 15);

                var stm = dojo.date.locale.format(nowDate, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                var etm = dojo.date.locale.format(startTm, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                //点击测站的弹出框的内容，面板，单独的widget 可传参数
                var panel = new this.PopClass({
                    data: item,
                    parameters:this.popParameters?this.popParameters:{},
                    filterData:this.filterData?this.filterData:null
                });

                if (this.showType == "infoWindow") {
                    this.getMap().infoWindow.setTitle(item[this.showName]);
                    this.getMap().infoWindow.setContent(panel.domNode);

                    var pt = new Point(item.lgtd, item.lttd);
                    this.getMap().infoWindow.show(pt);
                    this.getMap().infoWindow.resize(panel.width, 345);//设置大小 里面的widget也设置需要
                } else {
                    var pop = new Popup({
                        content: panel,
                        container: "main-page",
                        titleLabel: item[this.showName],
                        width: 505,
                        height: 345+30,
                        buttons: []
                    });
                }
            },

            firstLoad: true,
            getData: function (list) {
                //判断下
                if(!lang.isArray(list)){
                    var ls = list.data;
                    this.filterData = list.filterData;
                    list = ls;
                }
                if (this.firstLoad) {
                    this.getMap().addLayer(this.labelLayer);
                    this.getMap().on("zoom-end", lang.hitch(this, this.changeGraphicState));
                    this.firstLoad = false;
                }
                //清除之前的
                this.clear();
                this.labelLayer.clear();

                for (var i = 0; i < list.length; i++) {

                    var pt = new Point(list[i].lgtd, list[i].lttd);
                    //属性信息
                    var attr = list[i];
                    //文本符号颜色 点符号
                    var font = new Font("12px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var textSymbol = new TextSymbol(attr[this.showName], font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 5);
                    var labelPointGraphic = new Graphic(pt, textSymbol, attr);
                    this.labelLayer.add(labelPointGraphic);
                    //判断地图上点的显示样式
                    var PointSymbol;
                    if(this.showImage==null){
                        //第一种，动态绘制 根据sttp
                        if(attr.sttp){
                            PointSymbol = this.getSymbolBySTTP(attr);
                        }else{
                            //直接默认图片
                            PointSymbol = new PictureMarkerSymbol(this.defaultSymbolImage);
                        }
                    }else{
                        //第二种 直接用图片代替
                        PointSymbol = new PictureMarkerSymbol(this.showImage);
                    }

                    var gra = new Graphic(pt, PointSymbol, attr);//不给符号的话，没有符号显示，必须赋符号
                    this.add(gra);
                }
                //判断下级别
                this.changeLabelVis();
                this.redraw();//还必须要刷新下有时候
            },
            getSymbolBySTTP:function(item){
                var PointSymbol = new SimpleMarkerSymbol();


                if( item.sttp=="RR"){//水库
                    //PointSymbol.style = SimpleMarkerSymbol.STYLE_SQUARE;//正方形
                    PointSymbol.setPath("M 100 100 L 100 200 L 200 200 L 200 100");//正方形
                    PointSymbol.setColor(this.getColorByDrp(item[this.showValue]));
                }else if( item.sttp=="ZZ"||item.sttp=="ZQ"){//ZZ河道水位站，ZQ河道水文站
                    PointSymbol.setPath("M 100 100 L 300 100 L 200 -100 z");//正三角
                    PointSymbol.setColor(this.getColorByDrp(item[this.showValue]));
                }else if(item.sttp=="PP"){
                    PointSymbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;
                    PointSymbol.setColor(this.getColorByDrp(item[this.showValue]));//设置颜色 雨量是根据级别显示不同的
                }
                PointSymbol.setOutline(new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
//                        new Color([0,0,0,1]),
                    new Color([0,0,0]),
                    1
                ));
                PointSymbol.setSize(8);//设置符合的大小

                return PointSymbol;
            },
            getColorByDrp :function (dropRain) {//雨量点颜色分级
                var colorStr = "#FFFFFF";
                if (dropRain == 0)
                {
                    colorStr="#FFFFFF";
                }
                else if ((dropRain > 0 && dropRain < 10) || dropRain == 10)
                {
                    colorStr="#3FC916";
                }
                else if ((dropRain > 10 && dropRain < 25) || dropRain == 25)
                {
                    colorStr="#1016FF";
                }
                else if ((dropRain > 25 && dropRain < 50) || dropRain == 50)
                {
                    colorStr="#FBE805";
                }
                else if ((dropRain > 50 && dropRain < 100) || dropRain == 100)
                {
                    colorStr="#FF871C";
                }
                else if ((dropRain > 100 && dropRain < 200) || dropRain == 200)
                {
                    colorStr="#EC26A5";
                }
                else
                {
                    colorStr="#3FC916";
                }
                return new dojo.Color("3FC916");
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
                this.setVisibility(vis);

                this.changeLabelVis();
            },
            setLabelVis: function (vis) {
                this.labelVis = vis;
                this.changeLabelVis();
            },
            changeLabelVis: function () {
                var level = this.getMap().getLevel();
                if (this.currentVis && this.labelVis || (level > this.levelNum)) {
                    this.labelLayer.setVisibility(true);
                } else {
                    this.labelLayer.setVisibility(false);
                }
            }
        });
    });