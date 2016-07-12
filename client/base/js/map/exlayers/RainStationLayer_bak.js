define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",
        "dijit/Dialog",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "esri/layers/GraphicsLayer",
        'dojo/topic',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'dojo/_base/Color',
        'esri/graphic',
        'esri/geometry/Point',
        'base/widget/Popup',
        'esri/renderers/HeatmapRenderer',
        "esri/symbols/Font",
        "esri/symbols/TextSymbol",
        'dijit/layout/ContentPane',
        './RainChartPanel',
        'esri/symbols/PictureMarkerSymbol',
        "dijit/Menu",
        "dijit/MenuItem",
        "dijit/MenuSeparator"
    ],
    function (lang,
              array,
              declare,
              Dialog,
              _WidgetBase,
              _TemplatedMixin,
              GraphicsLayer,
              topic,
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              Color,
              Graphic,
              Point,
              Popup,
              HeatmapRenderer,
              Font,
              TextSymbol,
              ContentPane,
              RainChartPanel,
              PictureMarkerSymbol,
              Menu,
              MenuItem,
              MenuSeparator
    ) {
        return declare("base.map.exlayers.RainStationLayer", GraphicsLayer, { // 雨情图层

            name: "RainStationLayer",
            labelLayer: null,
            selected:null,
            constructor: function () {

                var tStr = 'layer/' + "rainStation" + "/";
                topic.subscribe(tStr + "data", lang.hitch(this, this.getData));
                //弹出框展示
                topic.subscribe(tStr + "window", lang.hitch(this, this.openWindowPanel));
                //控制可见
                topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
                //label控制可见
                topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis));
                //动态添加点
                topic.subscribe(tStr + "addpoint", lang.hitch(this, this.addPoint));

                this.labelLayer = new GraphicsLayer();
                this.id = "雨情监视图层";

                topic.subscribe(tStr + "updateParameters", lang.hitch(this, this.setUpdateParameters));

                //做一些初始化的方法
                this.previewcard = null;
                this.previewcardWidget = null;

                this.windowLayout = null;
                this.windowLayoutWidget = null;

                this.getWidgetx();

            },
            openWindow:function(item){

                var nowDate = new Date();
                var startTm = new Date();
                startTm.setDate(nowDate.getDate()-15);

                var stm = dojo.date.locale.format(nowDate, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                var etm = dojo.date.locale.format(startTm, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                var panel = new RainChartPanel({
                    img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                    label: "雨情站:",
                    data: item
                });
                var pop = new Popup({
                    content: panel,
                    container: "main-page",
                    titleLabel: "雨情站:",
                    width: 600,
                    height: 380,
                    buttons: []
                });
            },

            currentPoint:null,
            addPoint:function(stcd){
                for(var i=0;i<this.allList.length;i++){
                    if(this.allList[i].stcd == stcd){
                        var attr = this.allList[i];
                        var pt = new Point(attr.lgtd, attr.lttd);
                        //叠加点
                        var PointSymbol = new SimpleMarkerSymbol();
                        PointSymbol.setOutline(new SimpleLineSymbol(
                            SimpleLineSymbol.STYLE_SOLID,
                            new Color([0,0,0,0.5]),
                            1
                        ));
                        PointSymbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;//圆点
                        PointSymbol.setSize(7);
                        PointSymbol.setColor(this.getColorByDrp(attr.dyp));

                        if(this.currentPoint){
                            this.remove(this.currentPoint);
                        }
                        this.currentPoint = new Graphic(pt, PointSymbol, attr);//不给符号的话，没有符号显示，必须赋符号
                        this.add(this.currentPoint);
                        break;
                    }
                }
            },
            openRainChartPanel:function(stcd){

                var graphics = this.graphics;
                var item;
                for(var i=0;i<graphics.length;i++){
                    if(graphics[i].attributes.stcd ==stcd){
                        item = graphics[i].attributes;
                        break;
                    }
                }
                this.openWindow(item);

                //var panel = new RainChartPanel({
                //    img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                //    label: "雨量站",
                //    data: {'stcd':stcd,'stnm':""}
                //});
                //var pop = new Popup({
                //    content: panel,
                //    container: "main-page",
                //    titleLabel: "雨量站:",
                //    width: 540,
                //    height: 380,
                //    buttons: []
                //});
            },
            firstLoad:true,
            allList:[],
            showSymbol: function (object) {

                var isOwn = false;
                if(this.name = object.name){
                    isOwn = true;
                }
                if(!isOwn)return;
                if (this.firstLoad) {
                    this.getMap().addLayer(this.labelLayer);
                    this.getMap().on("zoom-end", lang.hitch(this, this.changeGraphicState));
                    this.firstLoad = false;
                }

                var list = object.data;

                this.allList =list;
                this.clear();
                this.labelLayer.clear();

                var count = 0;
                for (var i = 0; i < list.length; i++) {

                    var pt = new Point(list[i].lgtd, list[i].lttd);
                    //属性信息
                    var attr = list[i];
                    if(Number(attr.dyp)<20){//小于50的不显示
                        continue;
                    }

                    //符号颜色 点符号
                    var font = new Font("10px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var textSymbol = new TextSymbol(attr.stnm, font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 5);
                    var labelPointGraphic = new Graphic(pt, textSymbol,attr);
                    this.labelLayer.add(labelPointGraphic);

                    var PointSymbol = new SimpleMarkerSymbol();
                    PointSymbol.setOutline(new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([0,0,0,0.5]),
                       1
                    ));
                    PointSymbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;//圆点
                    PointSymbol.setSize(7);
                    PointSymbol.setColor(this.getColorByDrp(attr.dyp));

                    var gra = new Graphic(pt, PointSymbol, attr);//不给符号的话，没有符号显示，必须赋符号
                    this.add(gra);
                }
                //判断下级别
                if(this.getMap().getLevel()>this.levelNum){
                    this.labelLayer.setVisibility(true);
                }else{
                    this.labelLayer.setVisibility(false);
                }

                this.redraw();//还必须要刷新下有时候

            } ,
            levelNum:10,
            changeGraphicState: function (evt) {
                if(!this.currentVis)return;
                var level = this.getMap().getLevel();
                if (level >this.levelNum) {
                    this.labelLayer.setVisibility(true);
                }else{
                    this.labelLayer.setVisibility(false);
                }
            },
            getColorByDrp :function (dropRain) {//颜色分级
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
                    colorStr="#E8343B";
                }
                return new dojo.Color(colorStr);
            },
            currentVis:true,
            setVis:function(vis){
                this.currentVis = vis;
                this.setVisibility(vis);
                this.labelLayer.setVisibility(vis);
            }

        });
    });