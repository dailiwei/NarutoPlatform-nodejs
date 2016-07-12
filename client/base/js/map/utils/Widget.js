///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/on',
    'dojo/json',
    'dojo/query',
    'dojo/cookie',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
      "dijit/_TemplatedMixin",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "esri/tasks/Geoprocessor",
        "esri/tasks/FeatureSet",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/tasks/JobInfo",
        "esri/tasks/LinearUnit",
        "esri/toolbars/draw",
        "esri/SpatialReference"
  ],
  function(declare, lang, html,array, on, JSON, query, cookie, _WidgetsInTemplateMixin,
           BaseWidget,_TemplatedMixin,TabContainer,ContentPane,
           Geoprocessor,
           FeatureSet,
           Point,
           Polyline,
           Polygon,
           Graphic,
           SimpleMarkerSymbol,
           SimpleLineSymbol,
           SimpleFillSymbol,
           JobInfo,
           LinearUnit,
           Draw,
           SpatialReference

  ) {
    var clazz = declare([BaseWidget, _TemplatedMixin,_WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-about',
      // clasName: 'esri.widgets.About',


      postCreate: function() {
        this.inherited(arguments);

          //
          //this.createGp();
          //this.createGp2();

          //获取河流和站点
          this.getData();
      },

      startup: function() {
        this.inherited(arguments);

        this.resize();
      },

      resize: function() {
      },
        createGp:function(){
            //第一步构造GP
            //var gpUrl = 'http://192.168.228.129:6080/arcgis/rest/services/GP/watershed/GPServer/watershed';
            //var gpUrl = 'http://192.168.228.129:6080/arcgis/rest/services/watershed2/GPServer/watershed2';
            //var gpUrl = 'http://192.168.228.129:6080/arcgis/rest/services/GP/CreateWatershedPolygon2/GPServer/Create%20WaterShed%20Polygon';
            //var gpUrl = 'http://192.168.228.130:6080/arcgis/rest/services/GP/test/GPServer/test';
            var gpUrl = 'http://192.168.1.102:6080/arcgis/rest/services/GP/watershed/GPServer/util';
            this.gp = new Geoprocessor(gpUrl);
            //第二步，构造参数
            //我们通过上面，了解到GPFeatureRecordSetLayer对应FeatureSet
            var features = [];
            //features.push(new Graphic(new Point(107.840124,27.447972),new SimpleMarkerSymbol(),{Name:null,Descript:null,BatchDone:null,SnapOn:null,SrcType:null}));
            features.push(new Graphic(new Point(108.224258,27.524485),new SimpleMarkerSymbol(),{WatershedID:null}));
            var featureset = new FeatureSet();
            featureset.features = features;
            ////构造缓冲长度，这里的单位是可以更改的，我使用的是度，简单一些
            //var Dis = new esri.tasks.LinearUnit();
            //Dis.distance = 1;
            //Dis.units = esri.Units.DECIMAL_DEGREES;
            //Distance__value_or_field_,后悔当时参数名字没有改
            var parms = {
                BatchPoint : featureset
                ,Snap_distance : 0.005
            };
            //这里函数是异步的，使用函数是submitJob,同步的使用的是execute。
            //成功之后，调用jobResult,建议看一下这个参数。
            this.gp.submitJob(parms, lang.hitch(this,this.jobResult));
        },
        jobResult:function(result){
            alert("ok"+status);
            var jobId = result.jobId;
            var status = result.jobStatus;
            if(status === JobInfo.STATUS_SUCCEEDED) {
                //成功之后，将其中的结果取出来，当然这也是参数名字。
                //在模型中，想要取出中间结果，需要设置为模型参数
                this.gp.getResultData(jobId, "Watershed1", lang.hitch(this,this.polygon_BufferResults));
                this.gp.getResultData(jobId, "WatershedPoint", lang.hitch(this,this.resultCityResults));
            }
        },
        addResults1:function(results){
            console.log(results);
            var features = results.value.features;
            for(var f = 0, fl = features.length; f < fl; f++) {
                var feature = features[f];

            }
        },
        addResults:function(results){
            console.log(results);
            var features = results.value.features;
            for(var f = 0, fl = features.length; f < fl; f++) {
                var feature = features[f];
                var polySymbolRed = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([204, 102, 51]), 1), new dojo.Color([158, 184, 71, 1]));
                feature.setSymbol(polySymbolRed);
                this.map.graphics.add(feature);
            }
        },
        createGp2:function(){
            this.toolbar = new Draw(this.map);
            dojo.connect(this.toolbar, 'onDrawEnd', lang.hitch(this,this.drawEnd));

            this.toolbar.activate(Draw.POLYGON);
        },
        drawEnd:function(geometry){
            geometry.setSpatialReference(new SpatialReference(4214) );
            this.toolbar.deactivate();
            var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            var graphic = new Graphic(geometry, symbol);
            this.map.graphics.add(graphic);
            this.createGp2Job(graphic);
        },
        createGp2Job:function(graphic){
            //第一步构造GP
            var gpUrl = 'http://192.168.228.130:6080/arcgis/rest/services/GP/ContaminatedAreas/GPServer/ContaminatedAreas';
            this.gp = new Geoprocessor(gpUrl);
            //第二步，构造参数
            //我们通过上面，了解到GPFeatureRecordSetLayer对应FeatureSet
            var features = [];
            features.push(graphic);
            var featureset = new FeatureSet();
            featureset.features = features;
            ////构造缓冲长度，这里的单位是可以更改的，我使用的是度，简单一些
            var Dis = new LinearUnit();
            Dis.distance = 1;
            Dis.units = esri.Units.DECIMAL_DEGREES;
            //Distance__value_or_field_,后悔当时参数名字没有改
            var parms = {
                ContaminatedAreas : featureset
                ,Distance__value_or_field_ : Dis
            };
            //这里函数是异步的，使用函数是submitJob,同步的使用的是execute。
            //成功之后，调用jobResult,建议看一下这个参数。
            this.gp.submitJob(parms, lang.hitch(this,this.jobResult2));
        },
        jobResult2:function(result){
            var jobId = result.jobId;
            var status = result.jobStatus;
            if(status === JobInfo.STATUS_SUCCEEDED) {
                //成功之后，将其中的结果取出来，当然这也是参数名字。
                //在模型中，想要取出中间结果，需要设置为模型参数
                //setTimeout()
                this.gp.getResultData(jobId, "polygon_Buffer", lang.hitch(this,this.polygon_BufferResults));
                this.gp.getResultData(jobId, "resultCity", lang.hitch(this,this.resultCityResults));
            }
        },
        polygon_BufferResults:function(results){
            console.log(results);
            var features = results.value.features;
            for(var i = 0, length = features.length; i != length; ++i) {
                var feature = features[i];
                var polySymbolRed = new SimpleFillSymbol();
                polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,124, 0, 0.5]), 1));
                polySymbolRed.setColor(new dojo.Color([155, 0, 0, 0.5]));
                feature.setSymbol(polySymbolRed);
                this.map.graphics.add(feature);
            }
        },
        stationsPoint:null,
        resultCityResults:function(results){
            console.log(results);
            var features = results.value.features;
            var featureset_stations = new FeatureSet();
            featureset_stations.features = features;//把返回的测站最为泰森的测站点
            this.stationsPoint = featureset_stations;
            for(var f = 0, fl = features.length; f < fl; f++) {
                var feature = features[f];

                var polySymbolRed = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([204, 102, 51]), 1), new dojo.Color([158, 184, 71, 1]));
                feature.setSymbol(polySymbolRed);
                this.map.graphics.add(feature);

                this.map.centerAt(feature.geometry);
            }

            //进行泰森多边形分析

            this.thiessen();//进行泰森分析
        },

        thiessen:function(){

            var gpUrl = 'http://192.168.1.102:6080/arcgis/rest/services/GP/Thiessen/GPServer/Thiessen';
            this.gp = new Geoprocessor(gpUrl);


            var features_watershed = [];
            features_watershed.push(this.watershedGraphic);
            var featureset_watershed = new FeatureSet();
            featureset_watershed.features = features_watershed;

            var features_extent = [];
            var graphic_extent = new Graphic(this.watershedGraphic.geometry, new SimpleFillSymbol());
            features_extent.push(graphic_extent);
            var featureset_extent = new FeatureSet();
            featureset_extent.features = features_extent;



            var parms = {
                watershed : featureset_watershed,
                extent:featureset_extent,
                stations:this.stationsPoint
            };
            //这里函数是异步的，使用函数是submitJob,同步的使用的是execute。
            //成功之后，调用jobResult,建议看一下这个参数。
            this.gp.submitJob(parms, lang.hitch(this,this.jobResult4));

        },

        getData:function(){
            return dojo.xhrPost({
                url:"./widgets/About2/data.json",
                handleAs: "json"
            }).then(lang.hitch(this, function (response) {
                var textContent = response.geostr;
                this.createGP3(textContent);
            }));
        },

        watershedGraphic:null,

        createGP3:function(textContent){
            var ringstr = (textContent);
            var arrays = ringstr.split(";");
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

            var polySymbolRed = new SimpleFillSymbol();
            polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.5]), 1));
            polySymbolRed.setColor(new dojo.Color([239, 239, 18, 0.25]));
            graphic.symbol = polySymbolRed;

            this.watershedGraphic = graphic;

            this.map.graphics.add(graphic);


            var gpUrl = 'http://192.168.1.102:6080/arcgis/rest/services/GP/riverrainSimple/GPServer/riverrainSimple';
            this.gp = new Geoprocessor(gpUrl);

            var features = [];
            features.push(graphic);
            var featureset = new FeatureSet();
            featureset.features = features;

            var parms = {
                watershed : featureset
            };
            //这里函数是异步的，使用函数是submitJob,同步的使用的是execute。
            //成功之后，调用jobResult,建议看一下这个参数。
            this.gp.submitJob(parms, lang.hitch(this,this.jobResult3));
        },
        jobResult3:function(result){
            alert("river_rain"+status);
            var jobId = result.jobId;
            var status = result.jobStatus;
            if(status === JobInfo.STATUS_SUCCEEDED) {
                this.gp.getResultData(jobId, "rivers", lang.hitch(this,this.riverlinesResults));
                this.gp.getResultData(jobId, "stations", lang.hitch(this,this.resultCityResults));
            }
        },
        riverlinesResults:function(results){
            console.log(results);
            var features = results.value.features;
            var lintsr = "";
            for(var i = 0, length = features.length; i != length; ++i) {
                var feature = features[i];
                var plineSymbolRed = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([37, 152, 193, 0.5]), 1);
                feature.setSymbol(plineSymbolRed);
                var json =  feature.toJson();
                var jsr = JSON.stringify(json);
                //console.log(jsr);
                lintsr+=jsr+";";
                //this.map.graphics.add(feature);
            }

            lintsr = lintsr.substring(0,lintsr.length-1);
            console.log(lintsr);//输出的是可以入库的河流线数据
            this.getlinesByStr(lintsr);//测试叠加河流线数据
        },
        getlinesByStr:function(lintsr){
            var arrays = lintsr.split(";");
            var ringsArray = new Array();
            array.forEach(arrays,function (item) {

                var json = JSON.parse(item);
                var graphic = new Graphic(json);
                //var plineSymbolRed = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([37, 152, 193, 0.5]), 1);
                //graphic.setSymbol(plineSymbolRed);
                this.map.graphics.add(graphic);

            }, this);
        },
        jobResult4:function(result){
            alert("river_thiessen:"+result.jobStatus);
            var jobId = result.jobId;
            var status = result.jobStatus;
            if(status === JobInfo.STATUS_SUCCEEDED) {
                this.gp.getResultData(jobId, "thiessen", lang.hitch(this,this.polygon_thiessenResults));
            }
        },
        polygon_thiessenResults:function(results){
            console.log(results);
            var features = results.value.features;
            var plysr = "";
            for(var i = 0, length = features.length; i != length; ++i) {
                var feature = features[i];
                var polySymbolRed = new SimpleFillSymbol();
                polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,124, 0, 0.5]), 1));
                polySymbolRed.setColor(new dojo.Color([155, 0, 0, 0.5]));
                feature.setSymbol(polySymbolRed);
                //this.map.graphics.add(feature);

                var json =  feature.toJson();
                var jsr = JSON.stringify(json);
                //console.log(jsr);
                plysr+=jsr+";";
            }

            plysr = plysr.substring(0,plysr.length-1);
            //console.log(plysr);//输出的是可以入库的泰森数据

            this.getThiessenByStr(plysr);//测试叠加河流线数据

        },
        getThiessenByStr:function(plysr){
            var arrays = plysr.split(";");
            var ringsArray = new Array();
            array.forEach(arrays,function (item) {

                var json = JSON.parse(item);
                var graphic = new Graphic(json);
                //var plineSymbolRed = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([37, 152, 193, 0.5]), 1);
                //graphic.setSymbol(plineSymbolRed);
                this.map.graphics.add(graphic);

            }, this);

            alert("搞定一切");
        }


    });
    return clazz;
  });