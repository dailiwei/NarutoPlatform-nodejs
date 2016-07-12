

/**
 * Created by dailiwei on 15/1/27.
 */
define(['dojo/_base/lang',
        'dojo/_base/array',
        'dojo/on',
        'dojo/aspect',
        'dojo/Deferred',
        'dojo/cookie',
        'dojo/json',
        'dojo/topic',
        'dojo/sniff',
        'dojo/_base/url',
        'dojo/io-query',
        'esri/geometry/Point',
        "dojo/json",
        "esri/geometry/Polygon",
        'esri/SpatialReference',
        'esri/graphic',
        "esri/symbols/SimpleFillSymbol",
        ".././BoxPlotLayer"
    ],

    function (lang, array, on, aspect, Deferred, cookie,
              json, topic, sniff, Url, ioquery,Point,
              JSON,Polygon,SpatialReference,Graphic,SimpleFillSymbol,BoxPlotLayer) {
        var plotGraphicUtil = {};//标绘的图形的工具类

        //将图形输出为JSON字符串
        plotGraphicUtil.toPlotJSONString=function(plotGraphic) {
            var pointsJsons = [];

            var points = plotGraphic.geometry.controlPoints?plotGraphic.geometry.controlPoints:[];
            var plotType = plotGraphic.geometry.drawExtendType?plotGraphic.geometry.drawExtendType:"";
            //循环得出控制点的json
            for (var i = 0; i < points.length; i++) {
                pointsJsons.push(points[i].toJson());
            }

            var old = plotGraphic.toJson();
            var own = {};
            own["self"] = old;
            own["controlPoints"] = pointsJsons;
            own["plotType"] = plotType;

            return JSON.stringify(own);
        };
        //将图形输出为JSON对象
        plotGraphicUtil.toPlotJSON=function(plotGraphic) {
            var pointsJsons = [];

            var points = plotGraphic.geometry.controlPoints;
            var plotType = plotGraphic.geometry.drawExtendType;

            //循环得出控制点的json
            for (var i = 0; i < points.length; i++) {
                pointsJsons.push(points[i].toJson());
            }

            var old = plotGraphic.toJson();
            own["self"] = old;
            own["controlPoints"] = pointsJsons;
            own["plotType"] = plotType;

            return own;
        };

        //从JSON对象还原成图形
        plotGraphicUtil.toPlotFromJSON=function(own) {
            var self = own["self"];

            var graphic ;
            //switch (own.plotTyp) {
            //    case "point":
            //    case "multipoint":
            //        graphic = new Graphic(self);
            //        break;
            //    case "line":
            //    case "polyline":
            //    case "freehandpolyline":
            //
            //        break;
            //    default:
            //        symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol().setWidth(4), new Color([0, 116, 217, 0.41]));
            //        break;
            //}
            //
            //var polygon = new Polygon(self.geometry);
            //var symbol = new SimpleFillSymbol(self.symbol);
            //var plotGraphic = new Graphic(polygon, symbol);
            var controlPoints = [];
            var points = own.controlPoints;
            graphic = new Graphic(self);

            for(var i=0;i<points.length;i++){
                controlPoints.push(new Point(points[i]));
            }
            graphic.geometry.controlPoints = controlPoints;
            graphic.geometry.drawExtendType = own.plotType;
            return graphic;
        };

        //从JSON字符串还原成图形
        plotGraphicUtil.toPlotFromJSONStr=function(ownStr) {
            ownStr = decodeURI(ownStr);
            var own = JSON.parse(ownStr);
            return this.toPlotFromJSON(own);
        };

        //复制一个对象
        plotGraphicUtil.copyFromPlotGraphic=function(graphic){
            return lang.clone(this,graphic);
        };

        //绘制图形导出文件
        plotGraphicUtil.outPutPlotGraphicLayer2Txt=function(graphic,filename){
            filename = "标绘";
            var jsonStr = this.toPlotJSONString(graphic);
            var encodedUri = encodeURI(jsonStr);
            var a = document.createElement('a');
            a.href = 'data:attachment/txt,' + encodedUri;
            a.target = '_blank';
            a.download = filename+'.txt';
            document.body.appendChild(a);
            a.click();
        };


        //绘制图层导出文件
        plotGraphicUtil.outPutPlotGraphicLayer2Txt=function(layer,filename){
            filename = "标绘";
            var graphics = layer.graphics;
            var jsonStr = "";
            for(var i=0;i<graphics.length;i++){
                jsonStr+= this.toPlotJSONString(graphics[i])+';';
            }
            jsonStr = jsonStr.substring(0,jsonStr.length-1);
            var encodedUri = encodeURI(jsonStr);
            var a = document.createElement('a');
            a.href = 'data:attachment/txt,' + encodedUri;
            a.target = '_blank';
            a.download = filename+'.txt';
            document.body.appendChild(a);
            a.click();
        };

        //绘制图层导出字符串
        plotGraphicUtil.outPutPlotGraphicLayer2String=function(layer){
            var graphics = layer.graphics;
            var jsonStr = "";
            for(var i=0;i<graphics.length;i++){
                jsonStr+= this.toPlotJSONString(graphics[i])+';';
            }
            jsonStr = jsonStr.substring(0,jsonStr.length-1);
            var encodedUri = encodeURI(jsonStr);
            return encodedUri;
        };




        //绘制图形屏幕坐标导出文件
        plotGraphicUtil.outPutPlotScreens2Txt=function(plotGraphic,filename,map){
            filename = "标绘";

            var pointsJsons = [];

            var points = plotGraphic.geometry.rings[0];

            //循环得出控制点的json
            for (var i = 0; i < points.length; i++) {
                var point = new Point(points[i][0],points[i][1],map.spatialReference);
                pointsJsons.push([map.toScreen(point).x,map.toScreen(point).y]);
            }
            jsonStr =  JSON.stringify(pointsJsons);
            var encodedUri = encodeURI(jsonStr);
            var a = document.createElement('a');
            a.href = 'data:attachment/txt,' + encodedUri;
            a.target = '_blank';
            a.download = filename+'.txt';
            document.body.appendChild(a);
            a.click();
        };

        //从文件还原绘制图层
        plotGraphicUtil.getPlotLayerFromTxt=function(file,layer){
            console.log('读取的txt: ', file, ', ', file.name, ', ', file.type, ', ', file.size);
            //layer.clear();
            var reader = new FileReader();
            reader.onload = lang.hitch(this,function(){
                var data=  reader.result;
                var plots = data.split(";");
                for(var i=0;i<plots.length;i++){
                    var graphic = this.toPlotFromJSONStr(plots[i]);
                    layer.add(graphic)
                }

            });
            reader.readAsText(file);
        };

        plotGraphicUtil.getPlotLayerFromJsonStr = function (X, V) {
            //var X = reader.result;
            var W = X.split(";");
            for (var U = 0; U < W.length; U++) {
                var T = this.toPlotFromJSONStr(W[U]);
                V.add(T)
            }
        };

        /////////////////////////////////////////////////////////////////////////
        //box绘制图层导出字符串
        plotGraphicUtil.outPutPlotBoxGraphicLayer2String=function(layer){
            var graphics = layer.boxGraphics;
            var jsonStr = "";
            for(var i=0;i<graphics.length;i++){
                jsonStr+= this.toPlotBoxJSONString(graphics[i])+'@';
            }
            jsonStr = jsonStr.substring(0,jsonStr.length-1);
            var encodedUri = (jsonStr);
            return encodedUri;
        };
        //将box图形输出为JSON字符串
        plotGraphicUtil.toPlotBoxJSONString=function(plotGraphic) {

            var own = {};
            //own["id"] = plotGraphic.geometry_id;
            own["point"] = plotGraphic.geometry._point;
            own["html"] =  encodeURI(plotGraphic.geometry._html);
            own["path"] =  plotGraphic.geometry._path;
            own["symbol"] = plotGraphic.symbol.toJson();
            return JSON.stringify(own);
        };

        plotGraphicUtil.createBoxs2Layer=function(str,layer){
            var graphis = str.split("@");
            for(var i=0;i<graphis.length;i++){
                var json = JSON.parse(graphis[i]);
                layer.createPlotBoxByJSON(json);
            }
        };

        return plotGraphicUtil;
    });