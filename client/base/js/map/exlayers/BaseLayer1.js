define([
    'dojo/_base/lang',
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/Color",
    "dojo/_base/connect",
    'dojo/topic',
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    'esri/symbols/SimpleLineSymbol',
    "esri/symbols/TextSymbol",

    "esri/dijit/PopupTemplate",
    "esri/layers/GraphicsLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/PictureMarkerSymbol", 
    "esri/geometry/webMercatorUtils",
    "dijit/Tooltip",
    
    "base/Library",
    "base/utils/commonUtils",
    'base/widget/Popup',
    'base/widget/PopupMobile',
    "esri/geometry/ScreenPoint"

], function (
        lang,
        declare,
        arrayUtils,
        Color,
        connect,
        topic,
        SpatialReference,
        Point,
        Extent,
        Graphic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        TextSymbol,
        PopupTemplate,
        GraphicsLayer,
        ClassBreaksRenderer,
        PictureMarkerSymbol,
      
        webMercatorUtils,
        Tooltip,
        
        Library,
        commonUtils,
        Popup,
        PopupMobile,
        ScreenPoint
) {
    return declare("base.map.exlayers.BaseLayer1", GraphicsLayer, {
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
         isClusters:true,
         _isclusterNow:true,
        constructor: function (options) {
        	
        	   this._library = new Library();

               declare.safeMixin(this, options);
               
            var options = {};
            this._isclusterNow = this.parameters.now || this._isclusterNow;
            this._clusterTolerance = this.parameters.distance || 100;
//            this._clusterData = this.getNewList((options.data || []));
            this._clusters = [];
            this._clusterLabelColor = this.parameters.labelColor || "#000";
            // labelOffset can be zero so handle it differently
            this._clusterLabelOffset = (this.parameters.hasOwnProperty("labelOffset")) ? this.parameters.labelOffset : -5;
            // graphics that represent a single point
            this._singles = []; // populated when a graphic is clicked
            this._showSingles = this.parameters.hasOwnProperty("showSingles") ? this.parameters.showSingles : false;
            // symbol for single graphics
            var SMS = SimpleMarkerSymbol;
            this._singleSym = this.parameters.singleSymbol || new SMS("circle", 6, null, new Color("#888"));
            this._singleTemplate = this.parameters.singleTemplate || new PopupTemplate({"title": "", "description": "{*}"});
            this._maxSingles = this.parameters.maxSingles || 1000;

            this._webmap = this.parameters.hasOwnProperty("webmap") ? othis.parameters.webmap : false;

            this._sr = this.parameters.spatialReference || new SpatialReference({"wkid": 102100});

            this._zoomEnd = null;
            var tStr = 'layer/' + this.parameters.catalog + "/";
            this.catalog = this.parameters.catalog;
            this.id = this.parameters.name;//为以后获取图例名称准备
            
            //监听数据刷新
            topic.subscribe(tStr + "data", lang.hitch(this, this.showSymbol));
            //弹出框展示
            topic.subscribe(tStr + "window", lang.hitch(this, this.openWindowPanel));
             
            topic.subscribe(tStr + "size", lang.hitch(this, this.changeSize));
            
            topic.subscribe(this.catalog+"/layer/cluster", lang.hitch(this, this.setClusterIsOk));
            
            //控制可见
            topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
            //label控制可见
            topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis));
 
            //鼠标移入
            this.on("mouse-over", lang.hitch(this, this.mouseOverHandler));
            //鼠标移出
            this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
            //鼠标点击
//            this.on("click", lang.hitch(this, this.clickHandler));

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
        //可以重写这个方法
        mouseOverHandler: function (evt) {
            this._map.setMapCursor("pointer");
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
//        clickHandler: function (evt) {
//            var selected = evt.graphic;
//            var item = selected.attributes;
//            this.openWindow(item);
//        },
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

        _unsetMap: function () {
            this.inherited(arguments);
            connect.disconnect(this._zoomEnd);
        },

        add: function (p) {
            if (p.declaredClass) {
                this.inherited(arguments);
                return;
            }

            this._clusterData.push(p);
            var clustered = false;
            for (var i = 0; i < this._clusters.length; i++) {
                var c = this._clusters[i];
                if (this._clusterTest(p, c)) {
                    this._clusterAddPoint(p, c);
                    this._updateClusterGeometry(c);
                    this._updateLabel(c);
                    clustered = true;
                    break;
                }
            }

            if (!clustered) {
                this._clusterCreate(p);
                p.attributes.clusterCount = 1;
                this._showCluster(p);
            }
        },

        clear: function () {
            this.inherited(arguments);
            this._clusters.length = 0;
            try{
            	this._map.infoWindow.hide();
            	topic.publish("base/layout/floatLayout/panelBottomContainer/close");
            }catch(e){}
        	
        },

        clearSingles: function (singles) {
            var s = singles || this._singles;
            arrayUtils.forEach(s, function (g) {
                this.remove(g);
            }, this);
            this._singles.length = 0;
        },

        onClick: function (e) {
            this.clearSingles(this._singles);

            var singles = [];
            for (var i = 0, il = this._clusterData.length; i < il; i++) {
                if (e.graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId) {
                    singles.push(this._clusterData[i]);
                }
            }
            if (singles.length > this._maxSingles) {
                alert("Sorry, that cluster contains more than " + this._maxSingles + " points. Zoom in for more detail.");
                return;
            } else {
                e.stopPropagation();
                if(singles.length<=1){
                    //直接弹出对应的window
                    var selected = e.graphic;
                    var item = selected.attributes;

                    this.openWindow(item.data);
                }
                else{

                    var extent = this.getSinglesExtent(singles);
                    this._map.setExtent(extent.expand(2));
                }
            }
        },

        _clusterGraphics: function () {
            for (var j = 0, jl = this._clusterData.length; j < jl; j++) {
                var point = this._clusterData[j];
                var clustered = false;
                var numClusters = this._clusters.length;
                for (var i = 0; i < this._clusters.length; i++) {
                    var c = this._clusters[i];
                    if (this._clusterTest(point, c)) {
                        this._clusterAddPoint(point, c);
                        clustered = true;
                        break;
                    }
                }

                if (!clustered) {
                    this._clusterCreate(point);
                }
            }
            this._showAllClusters();
        },

        _clusterTest: function (p, cluster) {
            if (this._isclusterNow) {
                var distance = (
                Math.sqrt(
                    Math.pow((cluster.x - p.x), 2) + Math.pow((cluster.y - p.y), 2)
                ) / this._clusterResolution
                );
                return (distance <= this._clusterTolerance);
            } else {
                return false;
            }

        },
 
        _clusterAddPoint: function (p, cluster) {
            var count, x, y;
            count = cluster.attributes.clusterCount;
            x = (p.x + (cluster.x * count)) / (count + 1);
            y = (p.y + (cluster.y * count)) / (count + 1);
            cluster.x = x;
            cluster.y = y;

            if (p.x < cluster.attributes.extent[0]) {
                cluster.attributes.extent[0] = p.x;
            } else if (p.x > cluster.attributes.extent[2]) {
                cluster.attributes.extent[2] = p.x;
            }
            if (p.y < cluster.attributes.extent[1]) {
                cluster.attributes.extent[1] = p.y;
            } else if (p.y > cluster.attributes.extent[3]) {
                cluster.attributes.extent[3] = p.y;
            }

            cluster.attributes.clusterCount++;
            if (!p.hasOwnProperty("attributes")) {
                p.attributes = {};
            }
            p.attributes.clusterId = cluster.attributes.clusterId;
        },

        _clusterCreate: function (p) {
            var clusterId = this._clusters.length + 1;
            if (!p.attributes) {
                p.attributes = {};
            }
            p.attributes.clusterId = clusterId;
            var cluster = {
                "x": p.x,
                "y": p.y,
                "data":p,
                "attributes": {
                    "clusterCount": 1,
                    "clusterId": clusterId,
                    "extent": [p.x, p.y, p.x, p.y]
                }
            };
            this._clusters.push(cluster);
        },

        _showAllClusters: function () {
            for (var i = 0, il = this._clusters.length; i < il; i++) {
                var c = this._clusters[i];
                this._showCluster(c);
            }
        },
        getIconBySttp: function (item) { 
          if (item.isWarn) {
          	 return APP_ROOT+ "base/images/station_icons/14/" + item.sttp + "_2.png";						
			} else {
				 return APP_ROOT+ "base/images/station_icons/14/" + item.sttp + "_1.png";
			} 
      },
        _showCluster: function (c) {
            var point = new Point(c.x, c.y,this._sr);
            var iconSymbol = new PictureMarkerSymbol(this.getIconBySttp(c.data),  this.size, this.size);
            var symbol2 = iconSymbol;// this.getSymbolBySttp(c.data);
            var symbol = new PictureMarkerSymbol("base/images/map/icon_cluster.png", 24, 24);
 
            if (c.attributes.clusterCount == 1) {
                this.add(
                    new Graphic(
                        point,
                        symbol2,
                        c
                    )
                );
                return;
            }else{
                //判断下里面有没有预警的
                var newsymbol = this._getStatusSymbol(c.attributes.clusterId);
                this.add(
                    new Graphic(
                        point,
                        newsymbol,
                        c.attributes
                    )
                );
            }
 
            var label = new TextSymbol(c.attributes.clusterCount)
                .setColor(new Color(this._clusterLabelColor))
                .setOffset(0, this._clusterLabelOffset);
            this.add(
                new Graphic(
                    point,
                    label,
                    c.attributes
                )
            );
        },
        _getStatusSymbol:function(clusterId){
            var warn = false;
            var status  = false;
            var item;
            for (var i = 0, il = this._clusterData.length; i < il; i++) {
                if (clusterId == this._clusterData[i].attributes.clusterId) {
                    item = this._clusterData[i];
                    break;
                }
            }

            var symbol = new PictureMarkerSymbol(this._getStationIcon(item), 24, 24);

            return symbol;
        },
        _getStationIcon:function (item){
            //先判断是否预警,icon分类啊，1，0，2,正常，异常，预警
            if(item.isWarn){//如果预警了
//                return "images/32/32-6.png";
                return APP_ROOT+ "base/images/map/32/32-6.png";		
            }else{ 
//                return "images/32/32-2.png"; 
                return APP_ROOT+ "base/images/map/32/32-2.png";
            }
            return  "base/images/map/icon_cluster.png";
        },

        _addSingles: function (singles) {
            arrayUtils.forEach(singles, function (p) {
                var g = new Graphic(
                    new Point(p.x, p.y, this._sr),
                    this._singleSym,
                    p.attributes,
                    this._singleTemplate
                );
                this._singles.push(g);
                if (this._showSingles) {
                    this.add(g);
                }
            }, this);
            this._map.infoWindow.setFeatures(this._singles);
        },

        _updateClusterGeometry: function (c) {
            var cg = arrayUtils.filter(this.graphics, function (g) {
                return !g.symbol &&
                    g.attributes.clusterId == c.attributes.clusterId;
            });
            if (cg.length == 1) {
                cg[0].geometry.update(c.x, c.y);
            } else {
                Logger.log("didn't find exactly one cluster geometry to update: ", cg);
            }
        },

        _updateLabel: function (c) {
            var label = arrayUtils.filter(this.graphics, function (g) {
                return g.symbol &&
                    g.symbol.declaredClass == "esri.symbol.TextSymbol" &&
                    g.attributes.clusterId == c.attributes.clusterId;
            });
            if (label.length == 1) {
                this.remove(label[0]);
                var newLabel = new TextSymbol(c.attributes.clusterCount)
                    .setColor(new Color(this._clusterLabelColor))
                    .setOffset(0, this._clusterLabelOffset);
                this.add(
                    new Graphic(
                        new Point(c.x, c.y,this._sr),
                        newLabel,
                        c.attributes
                    )
                );
            } else {
                Logger.log("didn't find exactly one label: ", label);
            }
        },

        _clusterMeta: function () {
            Logger.log("Total:  ", this._clusterData.length);

            var count = 0;
            arrayUtils.forEach(this._clusters, function (c) {
                count += c.attributes.clusterCount;
            });
            Logger.log("In clusters:  ", count);
        },
        //////
        //获取这个集合的extent，定位
        getSinglesExtent:function (singles){

            var xmin;
            var ymin;
            var xmax;
            var ymax;
            var lg =singles.length;

            var x=[];
            var y=[];
            //alert(Math.max.apply(null, x));//最大值
            //alert(Math.min.apply(null, x));//最小值
            //
            for(var i=0;i<lg;i++){
                x.push(singles[i].x);
                y.push(singles[i].y);
            }

            xmin = Math.min.apply(null, x);
            ymin = Math.min.apply(null, y);
            xmax = Math.max.apply(null, x);
            ymax = Math.max.apply(null, y);

            return new Extent(xmin,ymin,xmax,ymax,this._sr);

        },
        
        size:14,//图片大小
       
        getOffSet:function(pt){
        	
        	var s =  this.getMap().toScreen(pt);
        	var ss = new ScreenPoint(s.x,s.y+(s.y/2-20));
        	return  this.getMap().toMap(ss);
        	
        },
        currentPoint: null,
        openWindowPanel: function (stcd) {
 
            var list = this._clusterData;
            var length = list.length;
            for(var i=0;i<length;i++){
                if(this._clusterData[i]["stcd"]==stcd){
                   
                    item = this._clusterData[i];
                    break;
                }
            }
            
             // 如果地图上不存在测站，返回
            if (!item) return;
//            this.getMap().centerAt(new Point(item.lgtd,item.lttd)).then(lang.hitch(this,function(){
//                this.openWindow(item);
//            }));
            
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
        
        changeSize:function(size){//1，2，3 大中小

            this.size = size;
            this.showSymbol(this._clusterData);
        },
        type:"",
        firstLoad:true,
        currentList:[],
        showSymbol: function (list) {
        	
        	this._sr = this._map.spatialReference;
            this._clusterTolerance =  (this._map.spatialReference.wkid==4326?100:100);
            this._clusterData = this.getNewList(list);
            if (this.firstLoad) {
            	 this._clusterResolution = this._map.extent.getWidth() / this._map.width; // probably a bad default...
                 this._clusterGraphics();

                 this._zoomEnd = connect.connect(this._map, "onZoomEnd", this, function () {
                     if(this.type == "common")return;
                     this._clusterResolution = this._map.extent.getWidth() / this._map.width;
                     this.clear();
                     this._clusterGraphics();
                 });
                 
                this.firstLoad = false;
         
            }
            //重新计算数据
            this._clusterResolution = this._map.extent.getWidth() / this.getMap().width;
            this.clear();
            this._clusterGraphics();
        },

        setClusterIsOk: function (now) {//设置是否聚合

            if(this._isclusterNow == now){
                //判断下当前的
                return;
            }else{
                this._isclusterNow = now;

                this._clusterResolution = this._map.extent.getWidth() / this._map.width;
                this.clear();
                this._clusterGraphics();
            }
        },
        getNewList:function(list){
            var newList = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].lttd != "" && list[i].lttd != "--" && Number(list[i].lttd) > 0) {

                    if(this._map.spatialReference.wkid==102100){
                      var pt = webMercatorUtils.geographicToWebMercator(new Point(Number(list[i].lgtd), Number(list[i].lttd)));

                      list[i]["x"] = pt.x;
                      list[i]["y"] = pt.y; 
                	}else{
                		list[i]["x"] = Number(list[i].lgtd);
                        list[i]["y"] =  Number(list[i].lttd);
                	} 
                    newList.push(list[i]);
                }
            } 
            return newList;
        } ,
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