define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/on",

    "esri/layers/GraphicsLayer",
    "esri/Color",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/graphic"
], function (declare,
             lang,
             array,
             connect,
             on,
             GraphicsLayer,
             Color,
             SpatialReference,
             Point,
             webMercatorUtils,
             Graphic) {
    return declare([GraphicsLayer], {

        bezier: {},
        t: 1,
        delta: 0.01,


        constructor: function (url) {

            this.url = url;

            this.stroke = d3.scale.category10();
        },
        _load: function () {
            var self = this;
            d3.json(this.url, function (geojson) {
                self.geojson = geojson;
                self.loaded = true;
                self._getPoints();
                self._render();
            });
        },

        _setMap: function () {
            this._load();
            return this.inherited(arguments);
        },
        _bind: function (map) {
            this._connects = [];
            this._connects.push(
                connect.connect(this._map, "onZoomEnd", this, this._reset)
            );

        },

        _project: function (x) {
            var p = new Point(x[0], x[1]);
            var point = this._map.toScreen(webMercatorUtils.geographicToWebMercator(p));
            return [point.x, point.y];
        },
        _reset: function () {
            var self = this;

            self._element().selectAll("circle.park")
                .attr("cx", function (d, i) {
                    if (d.geometry) {
                        return self._project(d.geometry.coordinates)[0];
                    }
                    else {
                        return d.x;
                    }
                })
                .attr("cy", function (d, i) {
                    if (d.geometry) {
                        return self._project(d.geometry.coordinates)[1];
                    }
                    else {
                        return d.y;
                    }
                });
            self._element().selectAll("svg").remove();
            self._getPoints();


            this._update();


        },
        _element: function () {

            return d3.select("g#" + this.id + "_layer");
        },
        _getPoints: function () {
            var self = this;
            var dataset = self.geojson.features;
            //console.log(dataset);
            var points = [];
            if (dataset.length > 0) {
                for (var i = 0; i < dataset.length; i++) {
                    var attr = dataset[i].properties;
                    //console.log(attr);
                    if (attr.target.length > 0) {
                        var point0 = self._project(dataset[i].geometry.coordinates);
                        var fromPoint = {x: point0[0], y: point0[1]};
                        var targetPoint = {}, controlPoint = {};
                        //console.log("缁勫悎鐢熸垚璐濆灏旀洸绾跨殑鐐�");
                        for (var j = 0; j < attr.target.length; j++) {
                            targetPoint = self._queryTargetPoint(attr.target[j].code);
                            //console.log(attr.team.code,attr.target[j].code);
                            controlPoint = self._calcControlPoint(fromPoint, targetPoint);
                            points.push([fromPoint, controlPoint, targetPoint]);
                        }

                    }

                }
                //console.log("缁勫悎鍚庣殑璐濊禌灏旀洸绾跨偣:", points);
                self.bezierPoints = points;
                self.orders = d3.range(0, points.length);
                //console.log("缁勫悎鍚庣殑璐濊禌灏旀洸绾夸釜鏁�:",self.orders);
            }
        },
        _calcControlPoint: function (fromPoint, toPoint) {
            var x0 = fromPoint.x, y0 = fromPoint.y,
                x1 = toPoint.x, y1 = toPoint.y;
            if (y1 > y0) {
                return {x: x1, y: y0};
            }
            else if (y1 < y0) {
                return {x: x0, y: y1}
            }
            else if (y1 == y0) {
                var dx = x1 > x0 ? (x0 + (x1 - x0) / 2) : (x1 + (x0 - x1) / 2);
                return {x: dx, y: y1};
            }
        },
        _queryTargetPoint: function (code_1) {
            var dataset = this.geojson.features;
            for (var i = 0; i < dataset.length; i++) {

                if (dataset[i].properties.team.code == code_1) {
                    var coordinates = dataset[i].geometry.coordinates;
                    var point = this._project(coordinates);
                    var targetPoint = {x: point[0], y: point[1]};
                    //console.log("toPoint", targetPoint);
                    return targetPoint;
                }

            }
        },

        _render: function () {
            var self = this;

            var dataset = this.geojson.features;
            //console.log(dataset);

            var p = self._element();
            //console.log(this.id);


            var cs = p.selectAll("circle")
                .data(dataset)
                .enter().append("circle")
                .attr("r", 5)
                .attr("class", "park")
                .attr("cx", function (d, i) {
                    return self._project(d.geometry.coordinates)[0];
                })
                .attr("cy", function (d, i) {
                    return self._project(d.geometry.coordinates)[1];
                });
                //.transition().ease("elastic").delay(750)
                //.styleTween("stroke", function () {
                //    return d3.interpolate("red", "green");
                //})
                //.attrTween("r", function () {
                //    return d3.interpolate(10, 50);
                //});


            self.loop(cs);

            setTimeout(lang.hitch(this,function(){
                this.play = false;
            }),5000);


            this._bind();

            this._update();


        },
        play:true,
        rMin:5,
        rMax:50,
        durationTime:1500,
        loop: function (cs) {
            var _cs = cs;
            _cs.transition()
                    .duration(this.durationTime)
                    .attrTween("r", lang.hitch(this,function () {
                        return d3.interpolate(this.rMin, this.rMax);
                    }))
                    .styleTween("stroke", function () {
                        return d3.interpolate("red", "green");
                    })
                    .styleTween("stroke-width", function () {
                        return d3.interpolate(9, 0);
                    })
                    .styleTween("opacity", function () {
                        return d3.interpolate(0.8, 0);
                    })
                    .each("end", lang.hitch(this,function(){
                       if(this.play){
                           this.loop(_cs);
                      }

                    }));
        },
        _update: function () {
            var self = this;
            var p = self._element();
            self.vis = p.selectAll("svg")
                .data(self.orders)
                .enter()
                .append("svg")
                .append("g");

            var self = this;
            var interpolation = self.vis.selectAll("g")
                .data(function (d) {
                    //console.log(self._getLevels(d,self.t));
                    var dataset = self._getLevels(d, self.t);
                    return self._getLevels(d, self.t)[dataset.length - 1];
                });

            interpolation.enter().append("g");


            var line = d3.svg.line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                });


            var curve = self.vis.selectAll("path.staticCurve")
                .data(function (d) {
                    //console.log("缁樺埗鏇茬嚎绾跨殑d鍊硷細", d);
                    //console.log("缁樺埗鏇茬嚎鐨勬暟缁勫€硷細", self._getCurve(d));
                    return self._getCurve(d);
                });
            curve.enter().append("path")
                .attr("class", "staticCurve");
            curve.attr("d", line);

        },
        _interpolated: function (d, p) {
            var r = [];
            for (var i = 1; i < d.length; i++) {
                var d0 = d[i - 1], d1 = d[i];
                r.push({x: d0.x + (d1.x - d0.x) * p, y: d0.y + (d1.y - d0.y) * p});
            }
            return r;
        },
        _getLevels: function (d, t_) {
            var self = this;
            //console.log("getLevel涓殑d鍊兼槸:",d);

            var x = [self.bezierPoints[d].slice(0, 3)];
            //console.log("缁樺埗鏇茬嚎浼犻€�",self.bezierPoints[d]);
            for (var i = 1; i < 3; i++) {
                x.push(self._interpolated(x[x.length - 1], t_));
            }
            //console.log("getLevels缁撴灉:",x);
            return x;
        },

        _getCurve: function (d) {
            var self = this;
            //console.log("self.bezier",self.bezier);
            var curve = self.bezier[3];
            if (d != -1) {
                curve = self.bezier[3] = [];
                for (var t_ = 0; t_ <= 1; t_ += self.delta) {
                    var x = self._getLevels(d, t_);
                    curve.push(x[x.length - 1][0]);
                }
            }
            return [curve.slice(0, self.t / self.delta + 1)];
        }
    });

});