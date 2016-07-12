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
		'esri/symbols/SimpleFillSymbol',
        'esri/graphic',
        'esri/geometry/Point',
        'esri/geometry/Polygon',
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
              SimpleFillSymbol,
              Graphic,
              Point,
              Polygon,
              GraphicsLayer,
              Popup,   
              Library,
              RainChartPanel
    ) {
        return declare("base.map.exlayers.SimplePolygonLayer", GraphicsLayer, { // 面图层
 
            labelLayer: null,
            selected:null,
            catalog:null,
            showType:"infoWindow",//弹框的方式
            constructor: function (args) {
        
                this._library = new Library();
                declare.safeMixin(this, args);

                var tStr = 'layer/' + "adcdPolygon" + "/";
                //图层控制读取这个id作为
                this.id = "政区面图层";
                //这个属性必须有，图层的通用显示控制需要
                this.catalog = "adcdPolygon"; 
                //接收服务端的数据
                topic.subscribe(tStr + "data", lang.hitch(this, this.getData)); 
                
                topic.subscribe(tStr + "locate", lang.hitch(this, this.getLocate)); 
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
            getLocate:function(stcd){
            	 var graphics = this.graphics;
                 var graphic;
                 for (var i = 0; i < graphics.length; i++) {
                     if (graphics[i].attributes.stcd == stcd) {
                    	 graphic = graphics[i];
                         break;
                     }
                 }
             	this.getMap().setExtent(graphic.geometry.getExtent().expand(1.1));
            },
            oldSymbol:null,
            hightlightSymbol:new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([0, 255, 255]),2),new Color([255, 255, 255, 0.45])),
            setHighlightSymbol:function(){
            	 
            },
             
            mouseOverHandler: function (evt) {
                this.getMap().setMapCursor("pointer");  
            },
            mouseOutHandler: function (evt) {
                this.getMap().setMapCursor("default");  
            },
            clickHandler: function (evt) {
            	Logger.log(this.getMap().getLevel());
                var selected = evt.graphic;
                var item = selected.attributes;
                this.openWindow(item,evt.mapPoint);
            },
            openWindow: function (item,mapPoint) { 
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

                    var pt = mapPoint;
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
 
                    //属性信息
                    var attr = list[i];
                    
                    var arrays = attr.geoStr.split(";");
    				var polyGon = new Polygon();
    				var ringsArray = new Array();
    				var graphic = new Graphic();
    				array.forEach(arrays, function (item) {

    					var array2 = item.split(",");
    					var mp = new Point(array2[0], array2[1]);
    					ringsArray.push(mp);

    				}, this);
    				polyGon.addRing(ringsArray);
    				graphic.geometry = polyGon;
    				graphic.attributes = attr;
    				
//    				  var startColor = new Color("#0000FF");
//    				  var endColor = new Color("#CA0013");
//    				  var blendedColor = Color.blendColors(startColor, endColor, 0.5);
    				  
    				graphic.symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID	, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([130, 4, 68, 0.5]), 2), new dojo.Color([130, 4, 68, 0.5]));
    				this.add(graphic);
    				var ex = polyGon.getExtent();
    				var pt = ex.getCenter();
                    //文本符号颜色 点符号
                    var font = new Font("18px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var textSymbol = new TextSymbol(attr["stnm"], font, new Color([255, 255, 0]));
//                    var textSymbol = new TextSymbol("测试a", font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 0);
                    var labelPointGraphic = new Graphic(pt, textSymbol, attr);
                    this.labelLayer.add(labelPointGraphic);

                    
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
            levelNum: 9,//label的显示级别
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
                if (this.currentVis ) {
                	if(this.labelVis || (level > this.levelNum)){
                		 this.labelLayer.setVisibility(true);
                	}
                   
                } else {
                    this.labelLayer.setVisibility(false);
                }
            }

        });
    });