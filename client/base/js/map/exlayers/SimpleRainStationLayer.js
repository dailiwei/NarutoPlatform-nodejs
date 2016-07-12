define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",
        "dijit/Dialog",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/_base/Color',
        'dojo/topic',
        "esri/symbols/Font",
        "esri/symbols/TextSymbol", 
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'esri/symbols/PictureMarkerSymbol',  
        'esri/graphic',
        'esri/geometry/Point',
        "esri/layers/GraphicsLayer",
        'base/widget/Popup',  
      
        "base/Library",
        './RainChartPanel'
    ],
    function (lang,
              array,
              declare,
              Dialog,
              _WidgetBase,
              _TemplatedMixin,
              Color,
              topic,
              Font,
              TextSymbol, 
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              PictureMarkerSymbol,  
              Graphic,
              Point,
              GraphicsLayer,
              Popup,   
              Library,
              RainChartPanel
    ) {
        return declare("base.map.exlayers.SimpleRainStationLayer", GraphicsLayer, { // 雨情量站图层
 
            labelLayer: null,
            selected:null,
            catalog:null,
            showType:"infoWindow",//弹框的方式
            constructor: function (args) {
        
                this._library = new Library();
                declare.safeMixin(this, args);

                var tStr = 'layer/' + "rainStation" + "/";
                //图层控制读取这个id作为
                this.id = "雨情监视图层";
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = "rainStation"; 
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
            },
             
            mouseOverHandler: function (evt) {
                this.getMap().setMapCursor("pointer"); 
                /*
                 this.selected = evt.graphic;
                 var item =  this.selected.attributes;
                 var templateContent =
                 "<b>时间: </b>" + (item.tm_mdh) + "<br/>" + 
                 "<b>站址: </b>" + item.stlc + "<br/><br/>" +
                 "<b>点击显示降雨过程</b> <br/>";

                 this.getMap().infoWindow.setTitle(item.stnm);
                 this.getMap().infoWindow.setContent(templateContent);
                 this.getMap().infoWindow.show( this.selected.geometry);
                 */
            },
            mouseOutHandler: function (evt) {
                this.getMap().setMapCursor("default"); 
                //this.getMap().infoWindow.hide();
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
                var panel = new RainChartPanel({ 
                    label: item.stnm,
                    data: item
                });
                if (this.showType == "infoWindow") {
                    this.getMap().infoWindow.setTitle(item.stnm);
                    this.getMap().infoWindow.setContent(panel.domNode);

                    var pt = new Point(item.lgtd, item.lttd);
                    this.getMap().infoWindow.show(pt);
                    this.getMap().infoWindow.resize(505, 345);//设置大小 里面的widget也设置需要
                } else {
                    var pop = new Popup({
                        content: panel,
                        container: "main-page",
                        titleLabel: item.stnm,
                        width: 505,
                        height: 345+30,
                        buttons: []
                    });
                } 
                panel.startup();
            }, 
          
            firstLoad: true, 
            getData: function (list) { 
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
                    var textSymbol = new TextSymbol(attr["stnm"], font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 5);
                    var labelPointGraphic = new Graphic(pt, textSymbol, attr);
                    this.labelLayer.add(labelPointGraphic);

                    //第一种，动态绘制
                    var PointSymbol = new SimpleMarkerSymbol();
                    PointSymbol.setOutline(new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([0,0,0,0.5]),
                       1
                    ));
                    PointSymbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;//符号的样式 link:https://developers.arcgis.com/javascript/jsapi/simplemarkersymbol-amd.html
                    PointSymbol.setSize(7);//设置符合的大小
                    PointSymbol.setColor(this.getColorByDrp(attr["drp"]));//设置颜色 雨量是根据级别显示不同的
                    
//                  //第二种 直接用图片代替 
//                  var PointSymbol = new PictureMarkerSymbol({
//						  "url": "base/images/marker/marker_red.png",
//						  "height": 20,
//						  "width": 20
//					}); 

                    var gra = new Graphic(pt, PointSymbol, attr);//不给符号的话，没有符号显示，必须赋符号
                    this.add(gra);
                }
                //判断下级别
                this.changeLabelVis();
                this.redraw();//还必须要刷新下有时候
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
                    colorStr="#E8343B";
                }
                return new dojo.Color(colorStr);
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