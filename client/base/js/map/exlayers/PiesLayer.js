define([
    "dojo/_base/declare",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/lang",
    "dojo/topic"
], function (declare,
             GraphicsLayer,
             Point,
             SpatialReference,
             Graphic,
             PictureMarkerSymbol,
             webMercatorUtils,
             lang,
             topic) {


    var Pie = function Pie(data, colorset, height, linecolor, selectedlinecolor) {
        this.angles = [];
        this.base64data = "";
        //  data:{'name1':30,'name2':40,'name3':50,'name4':60,'name5':70}
        this.data = data;
        this.linecolor = linecolor || "rgba(229, 205, 205, 0.78)";
        this.selectedlinecolor = selectedlinecolor || "#0F66E9"; // format suchas  #FFFFFF rgba(229, 205, 205, 0.78) or color name
        this.config = colorset; //{'name1':"#F7464A",'name2':'#E2EAE9','name3':'#02EAF9','name4':'#D4CCC5','name5':'#D4CC00'}
        this.canvas = document.createElement('canvas');
        this.height = height;
        this.canvas.height = height;
        this.canvas.width = height;
        this.ctx = this.canvas.getContext('2d');
        this.pieRadius = height / 2 - 5;
        this.segmentTotal = 0;
        for (var i in data) {
            if (this.config.hasOwnProperty(i))
                this.segmentTotal += this.data[i];
        }
        //Logger.log("segmentTotal" + this.segmentTotal);
        var startangle = 0
        for (var d in data) {
            if (this.config.hasOwnProperty(d)) {
                this.angles.push({
                    name: d,
                    angle: startangle + (this.data[d] / this.segmentTotal) * (Math.PI * 2)
                });
                startangle = startangle + (this.data[d] / this.segmentTotal) * (Math.PI * 2);
            }
        }
        this.draw(-1);
    }
    Pie.prototype.setPieRadius = function (r) {
        this.height = r;
        this.canvas.height = r;
        this.canvas.width = r;
        this.pieRadius = r / 2 - 5;
    }
    Pie.prototype.getAreaIndex = function (y, x) {
        var angle = Math.atan2(y, x);
        if (angle < 0) angle = -angle;
        else {
            angle = Math.PI * 2 - angle;
        }
        if (angle > this.angles[this.angles.length - 1]) {
            return this.angles.length - 1;
        }
        for (var i = 0; i < this.angles.length; i++) {
            if (angle < this.angles[i].angle) {
                return i;
            }
        }
    };
    Pie.prototype.getImageData = function () {
        return this.canvas.toDataURL("image/png");
    };
    Pie.prototype.updateImageData = function (data) {

    };
    Pie.prototype.draw = function () {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.height, this.height);
        var startAngle = 0;
        for (var i = 0; i < this.angles.length; i++) {
            {
                ctx.strokeStyle = this.linecolor;
                ctx.beginPath();
                ctx.arc(this.height / 2, this.height / 2, this.pieRadius, startAngle, this.angles[i].angle, false);
                ctx.lineTo(this.height / 2, this.height / 2);
                ctx.closePath();
                ctx.fillStyle = this.config[this.angles[i].name];
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.stroke();
                startAngle = this.angles[i].angle;
            }
        }
    };
    Pie.prototype.drawselected = function (i) {
        var ctx = this.ctx;
        this.draw();
        ctx.beginPath()
        ctx.strokeStyle = this.selectedlinecolor;
        ctx.lineWidth = 1;
        if (i == 0) {
            ctx.arc(this.height / 2, this.height / 2, this.pieRadius, 0, this.angles[0].angle, false);
        } else {
            ctx.arc(this.height / 2, this.height / 2, this.pieRadius, this.angles[i - 1].angle, this.angles[i].angle, false); //逆时针
        }
        ctx.lineTo(this.height / 2, this.height / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.linecolor;
    };


    return declare("base.map.exlayers.PiesLayer",GraphicsLayer, {

    	
        constructor: function (options) {
            declare.safeMixin(this, options);

            this.colorConfig = this.parameters.colors;
            this.pieRadius = this.parameters.r;
            this.linecolor = options.linecolor || "rgba(229, 205, 205, 0.78)";
            this.selectedlinecolor = options.selectedlinecolor || "#0F66E9";
            this.spatialReference = options.spatialReference || new SpatialReference({wkid: 102100});

            this.catalog = "piesChart";
            var tStr = 'layer/' + this.catalog + "/";

            topic.subscribe(tStr + "data", lang.hitch(this, this.getData));
            //      //弹出框展示
            //      topic.subscribe(tStr + "window", lang.hitch(this, this.openWindowPanel));
            //控制可见
            topic.subscribe(tStr + "visible", lang.hitch(this, this.setVis));
            //label控制可见
            topic.subscribe(tStr + "visible/label", lang.hitch(this, this.setLabelVis));

            //鼠标移入 可以做一些显示
            this.on("mouse-move", lang.hitch(this, this.mouseOverHandler));
            //鼠标移出 还原一些配置
            this.on("mouse-out", lang.hitch(this, this.mouseOutHandler));
            //鼠标点击 弹框
            this.on("click", lang.hitch(this, this.clickHandler));

            this.id = "pie图层";
        },
        mouseOverHandler: function (e) {
            this._map.setMapCursor("pointer");

            var piedata = e.piedata;
            var name = piedata.stnm;
            var slecetedata = e.slecetedata;
            this._map.infoWindow.setContent(name + "   " + JSON.stringify(slecetedata));
            this._map.infoWindow.show(e.mapPoint);
        },
        mouseOutHandler: function (evt) {
            this._map.setMapCursor("default");
            this._map.infoWindow.hide();
        },
        clickHandler: function (evt) {
            var selected = evt.graphic;
            var item = selected.attributes;
            alert(item.stnm);
            //this.openWindow(item);
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
            if (this.showType != "infoWindow") {
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
                    height: 345 + 30,
                    buttons: []
                });
            }
            panel.startup();
        },
        firstLoad: true,
        allList:null,
        //接收数据
        getData: function (list) {
            if (this.firstLoad) {
                this.labelLayer = new GraphicsLayer();
                this._map.addLayer(this.labelLayer);
                //this._map.on("zoom-end", lang.hitch(this, this.changeGraphicState));
                this.firstLoad = false;
            }
            //清除之前的
            this.clear();
            
            this.allList = [];
            this.allList = list;
            //this.labelLayer.clear();
            list.forEach(lang.hitch(this, function (d) {
                this.add(d);
            }));
        },

        addpie: function (e) {
            if (e.lgtd && e.lttd) {
                var x, y, pt;
                if (this._map.spatialReference.wkid == 4326) {
                    pt = new Point(e.lgtd, e.lttd);
                }
                else {
                    pt = webMercatorUtils.geographicToWebMercator(new Point(e.lgtd, e.lttd));
                }

                var pie = new Pie(e, this.colorConfig, this.pieRadius + 5);
                var imagedata = pie.getImageData();
                var json = {
                    url: imagedata,
                    "width": pie.height,
                    "height": pie.height
                };
                var sym = new PictureMarkerSymbol(json)
                var graphic = new Graphic(pt, sym, e);
                graphic.haschart = true;
                graphic.pie = pie;
                graphic.selectedindex = -1;
                this.add(graphic);
            }
        },
        add: function (p) {
            if (p.haschart) {
                this.inherited(arguments);
                this.onGraphicAdd(arguments);
                return;
            }
            this.addpie(p);
        },
        onGraphicAdd: function () {
        },
        _updatesymbol: function (e, unselected) {
            if (e.graphic.haschart) {
                var graphic = e.graphic;
                var mappt = e.mapPoint;
                var y = mappt.y - graphic.geometry.y;
                var x = mappt.x - graphic.geometry.x;
                var pie = e.graphic.pie;
                if (e.graphic.selectedindex != pie.getAreaIndex(y, x)) {
                    e.graphic.selectedindex = pie.getAreaIndex(y, x);
                    var sname = pie.angles[e.graphic.selectedindex].name;
                    e.slecetedata = {};
                    e.slecetedata[sname] = pie.data[sname];
                    e.piedata = pie.data;
                    pie.drawselected(pie.getAreaIndex(y, x));
                    var imagedata = pie.getImageData();
                    var json = {
                        url: imagedata,
                        "width": pie.height,
                        "height": pie.height
                    };
                    var sym = new PictureMarkerSymbol(json)
                    graphic.setSymbol(sym)
                }
            }
        },
        onClick: function (e) {
            this._updatesymbol(e);
            this._extenteventarg(e);
        },
        onMouseMove: function (e) {
            this._updatesymbol(e);
            this._extenteventarg(e);
        },
        onMouseOver: function (e) {
            this._updatesymbol(e);
            this._extenteventarg(e);
        },
        onMouseDown: function (e) {
            this._extenteventarg(e);
        },
        onMouseUp: function (e) {
            this._extenteventarg(e);
        },
        _extenteventarg: function (e) {
            var pie = e.graphic.pie;
            if (e.graphic.selectedindex >= 0) {
                var sname = pie.angles[e.graphic.selectedindex].name;
                e.slecetedata = {};
                e.slecetedata[sname] = pie.data[sname];
                e.piedata = pie.data;
            }
        },
        setPieRadius: function (r) {
            this.graphics.forEach(function (graphic, i) {
                if (graphic.haschart)graphic.pie.setPieRadius(r)
            });
            this.graphics.forEach(function (graphic, i) {
                if (graphic.haschart)graphic.pie.draw();
            });
        },
        onMouseOut: function (e) {
            if (e.graphic.haschart) {
                var graphic = e.graphic;
                var pie = e.graphic.pie;
                pie.draw();
                var imagedata = pie.getImageData();
                var json = {
                    url: imagedata,
                    "width": pie.height,
                    "height": pie.height
                };
                var sym = new PictureMarkerSymbol(json)
                graphic.setSymbol(sym)
                e.graphic.selectedindex = -1;
            }
            this._extenteventarg(e);
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
    })
});
