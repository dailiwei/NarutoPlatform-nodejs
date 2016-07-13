define(["dojo/_base/declare",
        "esri/graphic",
        "dojo/json"
    ],
    function (declare, Graphic, JSON) {
        return declare("PlotGraphic", Graphic, {

            //标绘的图形，扩展一些方法
            type: "PlotGraphic",
            points: [],//控制点
            plotType: "",

            setType: function (type) {

            },
            toPlotString: function () {
                var pointsJsons = [];

                //循环得出控制点的json
                for (var i = 0; i < this.points.length; i++) {

                    pointsJsons.push(this.points[i].toJson());
                }

                var old = this.toJson();
                own["self"] = old;
                own["controlPoints"] = pointsJsons;
                own["plotType"] = this.plotType;

                return JSON.stringify(own);

            }
        });
    });