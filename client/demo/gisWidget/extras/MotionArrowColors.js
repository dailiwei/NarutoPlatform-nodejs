
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/on",

    "esri/layers/GraphicsLayer",
    "esri/Color",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/graphic"
],function(
    declare,
    array,
    connect,
    on,
    GraphicsLayer,
    Color,
    SpatialReference,
    Point,
    webMercatorUtils,
    Graphic
){
    return declare([GraphicsLayer], {

        bezier: {},
        t: 0.1,
        delta : 0.01,
        orders:[],

        constructor: function(url){

            this.url = url;
            /*
             this._controlPointColor:options.controlColor || new Color([214,39,40]);
             this._followingColor:options.pointColor || "#A0522D";
             this._curveColor:options.curveColor || "#7CFC00";
             this._curveWidth:options.curveWidth || "3px";
             */
            this.stroke = d3.scale.category10();

        },
        _load: function(){
            var self =this;

            d3.json(this.url, function(geojson){
                self.geojson = geojson;
                self.loaded = true;
                self._getPoints();
                self._render();
            });
        },

        _setMap: function(){
            this._load();
            return this.inherited(arguments);
        },
        _bind: function(map){
            this._connects = [];
            this._connects.push(
                connect.connect(this._map, "onZoomEnd", this, this._reset)
            );

        },

        _project: function(x){
            var p = new Point(x[0], x[1]);
            var point = this._map.toScreen(webMercatorUtils.geographicToWebMercator(p));
            return [point.x, point.y];
        },
        _reset:function(){
            var self = this;

            self._element().selectAll("circle.park")
                .attr("cx", function(d, i){
                    if(d.geometry){
                        return self._project(d.geometry.coordinates)[0];
                    }
                    else{
                        return d.x;
                    }
                })
                .attr("cy", function(d, i){
                    if(d.geometry){
                        return self._project(d.geometry.coordinates)[1];
                    }
                    else
                    {
                        return d.y;
                    }
                });
            self._element().selectAll("svg").remove();
            self._getPoints();

            var p = self._element();
            self.vis = p.selectAll("svg")
                .data(self.orders)
                .enter()
                .append("svg")
                .append("g");


            var interpolation = self.vis.selectAll("g")
                .data(function(d,i) {
                    //console.log(self._getLevels(d,self.t));
                    var dataset = self._getLevels(d,self.t);
                    console.log("");
                    return self._getLevels(d,self.t)[dataset.length - 1];
                });



            interpolation.enter().append("g");

            var defs = interpolation.append("defs");

            self.arrowMarker = defs.append("marker")
                .attr("id","arrow")
                .attr("markerUnits","strokeWidth")
                .attr("markerWidth","12")
                .attr("markerHeight","12")
                .attr("viewBox","0 0 12 12")
                .attr("refX","6")
                .attr("refY","6")
                .attr("orient","auto");

            var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

            self.arrowMarker.append("path")
                .attr("d",arrow_path)
                .attr("fill",function(d){
                    return d.color;
                });

            var line = d3.svg.line()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                });


            var curve = self.vis.selectAll("path.curve")
                .data(function(d){
                    return self._getCurve(d);
                });
            curve.enter().append("path")
                .attr("class", "curve")
                .attr("stroke",function(d){
                    return d[0].color;
                });
            curve.attr("d", line)
                .attr("marker-end","url(#arrow)");


        },
        _element: function(){

            return d3.select("g#"+ this.id +"_layer");
        },
        _getPoints: function(){
            var self = this;
            var dataset = self.geojson.features;
            //console.log(dataset);
            var points = [];
            if(dataset.length > 0){
                for(var i = 0; i< dataset.length; i++){
                    var attr = dataset[i].properties;
                    //console.log(attr);
                    if(attr.target.length > 0){
                        var point0 = self._project(dataset[i].geometry.coordinates);
                        var color = dataset[i].properties.color;
                        var fromPoint = {x:point0[0], y:point0[1], color:color};
                        var targetPoint = {}, controlPoint = {};
                        //console.log("组合生成贝塞尔曲线的点");
                        for(var j = 0; j < attr.target.length; j++){
                            targetPoint = self._queryTargetPoint(attr.target[j].code);
                            //console.log(attr.team.code,attr.target[j].code);
                            controlPoint = self._calcControlPoint(fromPoint, targetPoint);
                            points.push([fromPoint, controlPoint, targetPoint]);
                        }

                    }

                }
                //console.log("组合后的贝赛尔曲线点:", points);
                self.bezierPoints = points;
                self.orders = d3.range(0, points.length);
                //console.log("组合后的贝赛尔曲线个数:",self.orders);
            }
        },
        _calcControlPoint: function(fromPoint, toPoint){
            var x0 = fromPoint.x, y0 = fromPoint.y,
                x1 = toPoint.x, y1 = toPoint.y;
            if(y1 > y0){
                return {x:x1, y:y0, color:fromPoint.color};
            }
            else if(y1 < y0){
                return {x: x0, y:y1, color:fromPoint.color}
            }
            else if(y1 == y0){
                var dx =  x1 > x0? (x0 + (x1 - x0)/2): (x1+ (x0-x1)/2);
                return {x: dx, y: y1, color:fromPoint.color};
            }
        },
        _queryTargetPoint:function(code_1){
            var dataset = this.geojson.features;
            for(var i = 0; i< dataset.length; i++){

                if(dataset[i].properties.team.code == code_1){
                    var coordinates = dataset[i].geometry.coordinates;
                    var point = this._project(coordinates);
                    var color = dataset[i].properties.color;
                    var targetPoint = {x: point[0],y:point[1], color:color};
                    //console.log("toPoint", targetPoint);
                    return targetPoint;
                }

            }
        },

        _render: function(){
            var self = this;

            var dataset = this.geojson.features;
            //console.log(dataset);


            var p = self._element();
            //console.log(this.id);


            p.selectAll("circle")
                .data(dataset)
                .enter().append("circle")
                .attr("r",10)
                .attr("class","park")
                .attr("fill", function(d){
                    return d.properties.color;
                })
                .attr("cx",function(d,i){
                    return self._project(d.geometry.coordinates)[0];
                })
                .attr("cy", function(d, i){
                    return self._project(d.geometry.coordinates)[1];
                });



            this._bind();

            self.vis = p.selectAll("svg")
                .data(self.orders)
                .enter()
                .append("svg")
                .append("g");


            this._update();
            //self.reseted = false;

            var last = 0;
            d3.timer(function(elapsed) {
                //console.log("elapsed",elapsed);
                self.t = (self.t + (elapsed - last) / 5000) %  1;
                //console.log("self.t", self.t);
                last = elapsed;
                self._update();
                return self.reseted;
            });


        },
        _update:function(){
            var self = this;
            var interpolation = self.vis.selectAll("g")
                .data(function(d, i) {
                    //console.log(self._getLevels(d,self.t));
                    var dataset = self._getLevels(d,self.t);
                    return self._getLevels(d,self.t)[dataset.length - 1];
                });

            interpolation.enter().append("g");

            var defs = interpolation.append("defs");

            self.arrowMarker = defs.append("marker")
                .attr("id","arrow")
                .attr("markerUnits","strokeWidth")
                .attr("markerWidth","12")
                .attr("markerHeight","12")
                .attr("viewBox","0 0 12 12")
                .attr("refX","6")
                .attr("refY","6")
                .attr("orient","auto");

            var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

            self.arrowMarker.append("path")
                .attr("d",arrow_path)
                .attr("fill", function(d){
                    return d.color;
                })
                .attr("opacity",0.9);




            var line = d3.svg.line()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                });


            var curve = self.vis.selectAll("path.curve")
                .data(function(d){
                    return self._getCurve(d);
                });
            curve.enter().append("path")
                .attr("class", "curve")
                .attr("stroke",function(d){
                    console.log("path的d值：",d[0].color);
                    return d[0].color;
                });
            curve.attr("d", line)
                .attr("marker-end","url(#arrow)");

        },
        _interpolated: function (d,p){
            var r = [];
            for(var i = 1; i < d.length; i++){
                var d0 = d[i-1], d1 = d[i];
                r.push({x: d0.x+(d1.x - d0.x)*p, y: d0.y+(d1.y - d0.y)*p, color:d0.color});
            }
            return r;
        },
        _getLevels:function (d, t_){
            var self = this;
            //console.log("getLevel中的d值是:",d);

            var x = [self.bezierPoints[d].slice(0,3)];
            //console.log("绘制曲线传递",self.bezierPoints[d]);
            for(var i = 1; i < 3; i++){
                x.push(self._interpolated(x[x.length - 1],t_));
            }
            //console.log("getLevels结果:",x);
            return x;
        },

        _getCurve:function(d){
            var self = this;
            //console.log("self.bezier",self.bezier);
            var curve = self.bezier[3];
            if(d!=-1){
                curve = self.bezier[3] = [];
                for (var t_=0; t_<=1; t_+=self.delta) {
                    var x = self._getLevels(d, t_);
                    curve.push(x[x.length-1][0]);
                }
            }
            return [curve.slice(0, self.t/self.delta + 1)];
        }

    });

});
