define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare", 
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "esri/layers/GraphicsLayer",
        'dojo/topic',
        'esri/symbols/SimpleMarkerSymbol',
        "esri/symbols/SimpleLineSymbol",
        'dojo/_base/Color',
        'esri/graphic',
        'esri/geometry/Point',  
        "esri/symbols/Font",
        "esri/symbols/TextSymbol", 
        'esri/symbols/PictureMarkerSymbol',
        "esri/geometry/webMercatorUtils",
        "base/Library"
    ],
    function (lang,
              array,
              declare, 
              _WidgetBase,
              _TemplatedMixin,
              GraphicsLayer,
              topic,
              SimpleMarkerSymbol,
              SimpleLineSymbol,
              Color,
              Graphic,
              Point,  
              Font,
              TextSymbol, 
              PictureMarkerSymbol,
              webMercatorUtils,
              Library
    ) {
	var Chart = function Chart(data,k) {
        this.angles = [];
        this.base64data = "";
        this.data = data;
        this.k = k;
        this.canvas = document.createElement('canvas');
        this.height= k*data["drp"];
        this.width=10;
        this.canvas.height= 100;
        this.canvas.width = this.width;
        this.ctx = this.canvas.getContext('2d');

        this.draw(-1);
    }

    Chart.prototype.getImageData = function() {
        return this.canvas.toDataURL("image/png");
    }
    Chart.prototype.updateImageData = function(data) {

    }
    Chart.prototype.draw = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width,100);
        // 绿色矩形
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "white";
        ctx.rect(0, 0, this.width,  this.height);
        ctx.stroke();
 
        ctx.fillStyle = "blue";
        ctx.fillRect(0,0, this.width, this.height);//绘制矩形
    }
    Chart.prototype.drawselected = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, 100);
        // 绿色矩形
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "blue";
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();

        //ctx.fillRect(30, 30, 20, 50);//绘制矩形
        ctx.fillStyle = "red";
    }

    
        return declare("base.map.exlayers.AdcdStationLayer", GraphicsLayer, { // 政区图层

            //图层，业务稳定
            name: "AdcdStationLayer", 
            selected:null,
            catalog:null,
            constructor: function (args) {
                this._library = new Library();
                declare.safeMixin(this, args);
                
                this.data=args.data||[];
               
                this.useValue = "drp";

                var tStr = 'layer/' + "adcdStation" + "/";
                this.catalog = "adcdStation";
                topic.subscribe(tStr + "data", lang.hitch(this, this.getData)); 
                //控制可见
                topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
                //label控制可见
                topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis)); 
 
                this.id = "政区图层";

                topic.subscribe(tStr + "updateParameters", lang.hitch(this, this.setUpdateParameters));


//                //鼠标移入
//                this.on("mouse-over", lang.hitch(this, this.mouseOverHandler));
//                //鼠标移出
//                this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
                //鼠标点击
//                this.on("click", lang.hitch(this, this.clickHandler));

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
                if(this.windowLayout){
                    //获取windowLayout 的class
                    this._library.loadModule1(this.windowLayout.module).then(dojo.hitch(this, function (Module) {
                        this.windowLayoutWidget = Module;
                    }));
                }

            },
            setUpdateParameters: function (args) {
                declare.safeMixin(this, args);
            },
            //可以重写这个方法
            mouseOverHandler: function (evt) {
                this.getMap().setMapCursor("pointer");
           
            },
            mouseOutHandler: function (evt) {
                this.getMap().setMapCursor("default"); 
            },
            clickHandler: function (evt) {
                var selected = evt.graphic;
                var item = selected.attributes;
                this.openWindow(item);
            },
            openWindow: function (itemData) { 
                if (this.windowLayoutWidget) {
                    var currentLayout;
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
                    if (this.previewcard.parameters.showType == "infoWindow") {
                        this.getMap().infoWindow.setTitle(itemData.nm);
                        this.getMap().infoWindow.setContent(currentLayout.domNode);

                        this.getMap().infoWindow.show(new Point(itemData.lgtd, itemData.lttd));
                        this.getMap().infoWindow.resize(395, 265);
                    } else {
                        var pop = new Popup({
                            content: currentLayout,
                            container: "main-page",
                            titleLabel: itemData.nm,
                            width: 500,
                            height: 350,
                            buttons: []
                        });
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
                this.getMap().centerAt(new Point(item.lgtd,item.lttd)).then(lang.hitch(this,function(){
                    this.openWindow(item);
                }));
            },
            firstLoad: true,
            allList: [],
            getData: function (list) {
                if (this.firstLoad) { 
//                    this.getMap().on("zoom-end", lang.hitch(this, this.changeGraphicState));
                    this.firstLoad = false;
                }
                this.allList = list;
                //算出最大的
                var max=0;
                for(var jj=0;jj<list.length;jj++) {
                    if (max < list[jj][this.useValue])
                    {
                        max = list[jj][this.useValue];
                    }
                }
                var k =80/max;
                this.k=k;//拉伸系数//默认的
                //清除之前的
                this.clear(); 

                var count = 0;
                for (var i = 0; i < list.length; i++) {

                    var pt = new Point(list[i].lgtd, list[i].lttd);
                    var p = {
                    		x:list[i].lgtd,
                    		y:list[i].lttd,
                    		attributes:list[i] 
                    };
                    this.addchart(p);
                }
                //判断下级别
//                this.changeLabelVis();
                this.redraw();//还必须要刷新下有时候
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
//                var level = this.getMap().getLevel();
//                if (this.currentVis && this.labelVis || (level > this.levelNum)) {
//                    this.labelLayer.setVisibility(true);
//                } else {
//                    this.labelLayer.setVisibility(false);
//                }
            },
            ////
           
            _setMap: function(map, surface){
                if(this.data){
                    this.data.forEach(lang.hitch(this,function(d){
                        this.add(d);
                    }));
                }
                var div = this.inherited(arguments);
                return div;
            },
            addchart: function(e) {
                //this.data.push(e);
                if (e.x && e.y && e.attributes) {
                    var x,y,pt;

                    if(e.x>-180&&e.x<180&&e.y>-90&&e.y<90){
                        var normalizedVal = webMercatorUtils.lngLatToXY(e.x, e.y, true);
                        x=normalizedVal[0];
                        y=normalizedVal[1]
                    }
                    else
                    {
                        x=e.x;y=e.y;
                    }

                    //pt = new Point(e.x,e.y, this.spatialReference);
                    pt = new Point(e.x,e.y);
                    var chart = new Chart(e.attributes,this.k,this.useValue);
                    var imagedata = chart.getImageData();
                    var json = {
                        url: imagedata,
                        "width": chart.width,
                        "height": chart.height
                    };
                    var sym = new PictureMarkerSymbol(json)
                    var graphic = new Graphic(pt, sym,e.attributes);
                    graphic.haschart = true;
                    graphic.chart = chart;
                    graphic.selectedindex = -1;
                    //  this.inherited(graphic);
                    this.add(graphic);
                }
            },
//            add: function(p) {
//                if (p.haschart) {
//                    this.inherited(arguments);
//                    this.onGraphicAdd(arguments);
//                    return;
//                }
//                this.addchart(p);
//            },
            onGraphicAdd: function() {},
            _updatesymbol:function(e,unselected) {
                //更新符号用的
                if (e.graphic.haschart) {
                    var graphic = e.graphic;
                    var mappt = e.mapPoint;
                    var y = mappt.y - graphic.geometry.y;
                    var x = mappt.x - graphic.geometry.x;
                    var chart = e.graphic.chart;
                    chart.draw();
                    var imagedata = chart.getImageData();
                    var json = {
                        url: imagedata,
                        "width": chart.width,
                        "height": chart.height
                    };
                    var sym = new PictureMarkerSymbol(json)
                    graphic.setSymbol(sym)
                }
            },
            onClick: function(e) {
                this._updatesymbol(e);
                this._extenteventarg(e);
            },
            onMouseMove: function(e) {
                this._updatesymbol(e);
                this._extenteventarg(e);
            },
            onMouseOver: function(e) {
                this._updatesymbol(e);
                this._extenteventarg(e);
            },
            onMouseDown: function(e) {
                this._extenteventarg(e);
            },
            onMouseUp: function(e) {
                this._extenteventarg(e);
            },
            _extenteventarg:function(e){
                var chart = e.graphic.chart;
                if(e.graphic.selectedindex>=0){
                    var sname=chart.angles[e.graphic.selectedindex].name;
                    e.slecetedata={};
                    e.slecetedata[sname]=chart.data[sname];
                    e.chartdata=chart.data;
                }
            },

            onMouseOut: function(e) {
                if (e.graphic.haschart) {
                    var graphic = e.graphic;
                    var chart = e.graphic.chart;
                    chart.draw();
                    var imagedata = chart.getImageData();
                    var json = {
                        url: imagedata,
                        "width": chart.width,
                        "height": chart.height
                    };
                    var sym = new PictureMarkerSymbol(json)
                    graphic.setSymbol(sym)
                    e.graphic.selectedindex=-1;
                }
                this._extenteventarg(e);
            }

        });
    });