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
        'base/widget/PopupMobile',
        
        "esri/symbols/Font",
        "esri/symbols/TextSymbol",
        'dijit/layout/ContentPane',
        './RainChartPanel',
        'esri/symbols/PictureMarkerSymbol',
        "dijit/Menu",
        "dijit/MenuItem",
        "dijit/MenuSeparator",
        "base/Library",
        "dojo/promise/all",
        "dojo/Deferred",
        "base/utils/commonUtils",
        "esri/geometry/ScreenPoint"
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
              PopupMobile,
              Font,
              TextSymbol,
              ContentPane,
              RainChartPanel,
              PictureMarkerSymbol,
              Menu,
              MenuItem,
              MenuSeparator,
              Library,
              all,
              Deferred,
              commonUtils,
              ScreenPoint
              ) {
        return declare("base.map.exlayers.BaseLayer1", GraphicsLayer, { // 基础图层

            name: "BaseLayer",
            labelLayer: null,
            selected: null,
            url: window.APP_ROOT+"/base/api/asset/${solutionId}/model/${modelId}/assetType/${assetTypeId}/assetInstance",
            _library: null,
            previewcard: null,
            previewcardWidget: null,
            windowLayout: null,
            windowLayoutWidget: null,
            widget_id:null,
            catalog:null,
            /**
             * 构造方法
             * @param args
             */
            constructor: function (args) {
                this._library = new Library();

                declare.safeMixin(this, args);
                //传过来的参数
                // {id:"RainLayer",'name':"雨量站图层","icon":"base/images/sop_icons/stDND.png",displayName:"stnm","displayValue":"drp"}
                //接受外部数据地图刷新数据
                var tStr = 'layer/' + this.parameters.catalog + "/";
                this.catalog = this.parameters.catalog;
                topic.subscribe(tStr + "data", lang.hitch(this, this.getData));
                //弹出框展示
                topic.subscribe(tStr + "window", lang.hitch(this, this.openWindowPanel));
                //控制可见
                topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
                //label控制可见
                topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis));
                //动态添加点
                topic.subscribe(tStr + "addpoint", lang.hitch(this, this.addPoint));
                //更新参数
                topic.subscribe(tStr + "updateParameters", lang.hitch(this, this.setUpdateParameters));

                this.labelLayer = new GraphicsLayer();
                //this.labelLayer.id = this.parameters.name+"标注";
                //this.widget_id = lang.clone(this, this.id);;
                this.id = this.parameters.name;//为以后获取图例名称准备

                //鼠标移入
                this.on("mouse-over", lang.hitch(this, this.mouseOverHandler));
                //鼠标移出
                this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
                //鼠标点击
                this.on("click", lang.hitch(this, this.clickHandler));

                //做一些初始化的方法
                this.previewcard = null;
                this.previewcardWidget = null;

                this.windowLayout = null;
                this.windowLayoutWidget = null;

                this.getWidgetx();
            },
            //初始化弹出框，布局，以及其的widget
            getWidgetx: function () {
                //获取左侧的panel
                var list = window.currentPageWidgets;
                var containerId = this.widget_id;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    if (item.container == containerId && item.parameters.region == "window") {
                        this.previewcard = item;//这个暂时没用到，逻辑上要有
                        //去找他的布局
                        containerId=item.id;
                        break;
                    }
                }

                for (var j = 0; j < list.length; j++) {
                    var item = list[j];
                    if (item.container == containerId && item.parameters.region == "layout") {
                        this.windowLayout = item;
                        //去找他的子widget
                        containerId = item.id;
                        break;
                    }
                }
                //获取windowLayout 的class
                this._library.loadModule1(this.windowLayout.module).then(dojo.hitch(this, function (Module) {
                    this.windowLayoutWidget = Module;
                }));
                
               try{
            	   //获取移动端弹出来的窗口
                   this._library.loadModule1("data_monitor/previewCard/PreviewCardMobile").then(dojo.hitch(this, function (Module) {
                       this.mobileWidget = Module;
                   })); 
               }catch(e){
            	   
               }
                	 

            },
            setUpdateParameters: function (args) {
                declare.safeMixin(this, args);
            },
            //可以重写这个方法
            mouseOverHandler: function (evt) {
                this.getMap().setMapCursor("pointer");
                //根据需求，鼠标移动不弹出previewcard 2015/7/14
                /*
                 this.selected = evt.graphic;
                 var item =  this.selected.attributes;
                 var templateContent =
                 "<b>时间: </b>" + (item.tm_mdh) + "<br/>" +
                 "<b>水系: </b>" + item.rvnm + "<br/>" +
                 "<b>来源: </b>" + item.locality + "<br/>" +
                 "<b>站址: </b>" + item.stlc + "<br/><br/>" +
                 "<b>点击显示降雨过程</b> <br/>";

                 this.getMap().infoWindow.setTitle(item.stnm);
                 this.getMap().infoWindow.setContent(templateContent);
                 this.getMap().infoWindow.show( this.selected.geometry);
                 */
            },
            mouseOutHandler: function (evt) {
                this.getMap().setMapCursor("default");
                //根据需求，鼠标移动不弹出previewcard 2015/7/14                
                //this.getMap().infoWindow.hide();
            },
            clickHandler: function (evt) {
                var selected = evt.graphic;
                var item = selected.attributes;
                this.openWindow(item);
            },
            openWindow: function (itemData) {
            	 var currentLayout;
                if (this.windowLayoutWidget) {
               	
                    if (this.previewcard.parameters.showType == "infoWindow"&&!commonUtils.isMobile()) {
                    
                         try {
                             //判断是否有shareData的属性,会给子widget传值
                             this.windowLayout.parameters["shareData"] = itemData;
                             currentLayout = new this.windowLayoutWidget({
                                 isResize:true,
                                 widget_id: this.windowLayout.id,
                                 style: "width:100%;height:100%",
                                 parameters: this.windowLayout.parameters
                             });

                             if (currentLayout.startup) {
                                 currentLayout.startup();
                             }
                         } catch (error) {
                             throw "Error create instance:" + this.windowLayout.id + ". " + error;
                         }
//                        this.getMap().infoWindow.setTitle(itemData.nm);
                        this.getMap().infoWindow.setContent(currentLayout.domNode);

                        this.getMap().infoWindow.show(new Point(itemData.lgtd, itemData.lttd));
                        this.getMap().infoWindow.resize(395, 265);
                    } else {
                    
                    	try{
                    		 //判断是否有shareData的属性,会给子widget传值 
                            var widget = new this.mobileWidget({ 
                                style: "width:100%;height:100%",
                                parameters: {"data":itemData}
                            });

                            if (widget.startup) {
                            	widget.startup();
                            }
                            
                            var pop = new PopupMobile({
                                content: widget,
                                container: "main-page",
                                titleLabel: itemData.stnm,
                                width: this.getMap().width,
                                height: this.getMap().height,
                                buttons: []
                            });
                    	}catch(e){
                    		Logger.log("sorry,dev not complte");
                    	}
                    	 
                        
                    }
                    if (currentLayout.resize) {
                        currentLayout.resize();
                    }
                    //topic.publish("base/layout/floatLayout/panelBottomContainer/show", itemData);

                } else {
                    //这个也是配置出来的应该，弹出框
                    var nowDate = new Date();
                    var startTm = new Date();
                    startTm.setDate(nowDate.getDate() - 15);

                    var stm = dojo.date.locale.format(nowDate, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                    var etm = dojo.date.locale.format(startTm, {datePattern: "yyyy-MM-dd HH:mm", selector: "date"});
                    var panel = new RainChartPanel({
                        img: require.toUrl('jimu') + "/richway/images/thumbnail_default.png",
                        label: itemData.nm,
                        data: item
                    });

                    var pop = new Popup({
                        content: panel,
                        container: "main-page",
                        titleLabel: itemData.nm,
                        width: 500,
                        height: 350,
                        buttons: []
                    });
                }
            },
            currentPoint: null,
            openWindowPanel: function (stcd) {

                var graphics = this.graphics;
                var item;
                for (var i = 0; i < graphics.length; i++) {
                    if (graphics[i].attributes.stcd == stcd) {
                        item = graphics[i].attributes;
                        break;
                    }
                }
                 // 如果地图上不存在测站，返回
                if (!item) return;
//                this.getMap().centerAt(new Point(item.lgtd,item.lttd)).then(lang.hitch(this,function(){
//                    this.openWindow(item);
//                }));
                
                //获取新的点，做偏移位置
                var pt =new Point(item.lgtd,item.lttd);
              
                if(commonUtils.isMobile()){
                	//关闭左侧列表
                	topic.publish("base/layout/tabPanel/hideTab");
                	this.getMap().setLevel(13).then(lang.hitch(this,function(){
                        this.getMap().centerAt(pt).then(lang.hitch(this,function(){ 
                        	   topic.publish("gis/map/setCenter",item);
                        }));
                     }));
                }else{
                	 this.getMap().setLevel(13).then(lang.hitch(this,function(){
                         this.getMap().centerAt(pt).then(lang.hitch(this,function(){
                         	   var spt = this.getOffSet(pt);
                             this.getMap().centerAt(spt).then(lang.hitch(this,function(){
                                   this.getMap().setLevel(13).then(lang.hitch(this,function(){
            	                        setTimeout(lang.hitch(this,function(){
            	                        	  this.openWindow(item);
            	                        },500)) 
            	                    }));
                              }));
                         }));
                      }));
                }
               
                 
                
            },
            getOffSet:function(pt){
            	
            	var s =  this.getMap().toScreen(pt);
            	var ss = new ScreenPoint(s.x,s.y+(s.y/2-20));
            	return  this.getMap().toMap(ss);
            	
            },
            firstLoad: true,
            allList: [],
            getData: function (list) {
                if (this.firstLoad) {
                    this.getMap().addLayer(this.labelLayer);
                    this.getMap().on("zoom-end", lang.hitch(this, this.changeGraphicState));
                    this.firstLoad = false;
                }
                this.allList = list;
                //清除之前的
                this.clear();
                this.labelLayer.clear();

                var count = 0;
                for (var i = 0; i < list.length; i++) {

                    var pt = new Point(list[i].lgtd, list[i].lttd);
                    //属性信息
                    var attr = list[i];
                    //符号颜色 点符号
                    var font = new Font("12px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    var textSymbol = new TextSymbol(attr[this.parameters.showType.displayValue], font, new Color([255, 0, 0]));
                    textSymbol.setOffset(0, 5);
                    var labelPointGraphic = new Graphic(pt, textSymbol, attr);
                    this.labelLayer.add(labelPointGraphic);
                    //搞成icon
                    // var iconSymbol = new PictureMarkerSymbol(this.getIcon(attr[this.showType.displayValue]), 16, 16);
                    var iconSymbol = new PictureMarkerSymbol(this.getIconBySttp(attr), 14, 14);
                    //var PointSymbol = new SimpleMarkerSymbol();
                    //PointSymbol.setOutline(new SimpleLineSymbol(
                    //    SimpleLineSymbol.STYLE_SOLID,
                    //    new Color([0,0,0,0.5]),
                    //   1
                    //));
                    //PointSymbol.style = SimpleMarkerSymbol.STYLE_CIRCLE;//圆点
                    //PointSymbol.setSize(7);
                    //PointSymbol.setColor(this.getColorByDrp(this.displayValue));

                    var gra = new Graphic(pt, iconSymbol, attr);//不给符号的话，没有符号显示，必须赋符号
                    this.add(gra);
                }
                //判断下级别
                this.changeLabelVis();
                this.redraw();//还必须要刷新下有时候
            },
            getIcon: function (value) {
                var iconStr = "";
                switch (this.parameters.showType.name) {
                    case "single":
                        iconStr = this.parameters.showType.icon;
                        break;
                    case "class":
                        iconStr = this.getIconByClass(value);
                        break;
                }

                return iconStr;
            },
            getIconByClass: function (value) {
                var items = this.parameters.showType.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.start <= value && value < item.end) {
                        return item.icon;
                    }
                }
            },
            getIconBySttp: function (item) {
//                if (item.sttp) {
//                    return APP_ROOT+"base/images/station_icons/14/" + item.sttp + "_1.png";
//                } else {
//                    return APP_ROOT+"base/images/marker/marker_blue.png";
//                }
                
                if (item.isWarn) {
                	 return APP_ROOT+ "base/images/station_icons/14/" + item.sttp + "_2.png";						
				} else {
					 return APP_ROOT+ "base/images/station_icons/14/" + item.sttp + "_1.png";
				}
                
                
            },

            levelNum: 10,
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