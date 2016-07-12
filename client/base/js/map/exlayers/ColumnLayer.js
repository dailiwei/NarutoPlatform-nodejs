define(["dojo/_base/declare", "esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/SpatialReference",
    "esri/graphic", "esri/symbols/PictureMarkerSymbol","esri/geometry/webMercatorUtils","dojo/_base/lang"
], function(declare, GraphicsLayer, Point, SpatialReference,Graphic, PictureMarkerSymbol,webMercatorUtils,lang) {


    var Chart = function Chart(data,k) {
        this.angles = [];
        this.base64data = "";
        this.data = data;
        this.k = k;
        this.canvas = document.createElement('canvas');
        this.height= k*data["drp"];
        this.width=20;
        this.canvas.height= 100;
        this.canvas.width = 20;
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
        ctx.strokeStyle = "blue";
        ctx.rect(0, 0, this.width,  this.height);
        ctx.stroke();

        ctx.fillRect(0,0, this.width, this.height);//绘制矩形
        ctx.fillStyle = "blue";
    }
    Chart.prototype.drawselected = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, 100);
        // 绿色矩形
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "blue";
        ctx.rect(0, 0, 20, this.height);
        ctx.stroke();

        //ctx.fillRect(30, 30, 20, 50);//绘制矩形
        ctx.fillStyle = "red";
    }


    return declare([GraphicsLayer], {

        constructor: function(options) {
            this.spatialReference=options.spatialReference|| new SpatialReference({wkid:102100});
            this.data=options.data||[];
            this.k=options.k||0.5;//拉伸系数
        },
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

                pt = new Point(e.x,e.y, this.spatialReference);
                var chart = new Chart(e.attributes,this.k);
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
        add: function(p) {
            if (p.haschart) {
                this.inherited(arguments);
                this.onGraphicAdd(arguments);
                return;
            }
            this.addchart(p);
        },
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

    })
});
