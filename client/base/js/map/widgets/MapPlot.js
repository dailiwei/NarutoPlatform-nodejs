define([
        'dojo/_base/declare',

        'esri/graphic',
        'esri/geometry/Point',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/geometry/Polyline',
        'esri/symbols/SimpleLineSymbol',
        'esri/geometry/Polygon',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/TextSymbol',
        'esri/symbols/Font',
        'esri/units',
        'esri/geometry/webMercatorUtils',
        'esri/geometry/geodesicUtils',
        'dojo/_base/lang',
        "dojo/dom",
        'dojo/on',
        'dojo/topic',
        'dojo/_base/html',
        'dojo/_base/Color',
        'dojo/_base/query',
        'dojo/_base/array',
        'dijit/form/Select',
        'dijit/form/NumberSpinner',
        'base/map/dijit/ViewStack',
        'base/map/dijit/SymbolChooser',
        'base/map/dijit/DrawBoxEx',
        'base/map/dijit/utils',
        "esri/plot/BoxPlotLayer",

        "gridx/core/model/cache/Sync",
        "gridx/core/model/cache/Async",
        "gridx/Grid",
        "gridx/modules/VirtualVScroller",
        "gridx/modules/ColumnResizer",
        "gridx/modules/extendedSelect/Row",
        "gridx/modules/SingleSort",
        "gridx/modules/pagination/Pagination",
        "gridx/modules/pagination/PaginationBar",
        "gridx/modules/Focus",
        "gridx/support/exporter/toCSV",

        "gridx/modules/Tree",
        'gridx/tests/support/stores/ItemFileWriteStore',
        'gridx/tests/support/data/TreeColumnarTestData',
        'gridx/allModules',
        'dojo/data/ItemFileWriteStore',
        "dojo/text!./template/MapPlot.html",
        "base/utils/commonUtils",
        "base/css!baseImages/map/plotIcon/style.css",

        "base/widget/Popup",
        "base/map/dijit/PlotInfo",
        "./MapPlugin"
    ],
    function (declare,
              Graphic,
              Point,
              SimpleMarkerSymbol,
              Polyline,
              SimpleLineSymbol,
              Polygon,
              SimpleFillSymbol,
              TextSymbol,
              Font,
              esriUnits,
              webMercatorUtils,
              geodesicUtils,
              lang,
              dom,
              on,
              topic,
              html,
              Color,
              Query,
              array,
              Select,
              NumberSpinner,
              ViewStack,
              SymbolChooser,
              DrawBox,
              jimuUtils,
              BoxPlotLayer,
              Sync,
              Async,
              Grid,
              VirtualVScroller,
              ColumnResizer,
              SelectRow,
              SingleSort,
              Pagination,
              PaginationBar,
              Focus,
              toCSV,
              Tree,
              storeFactory,
              dataSource,
              modules,
              ItemFileWriteStore,
              template,
              commonUtils,
              css,
              Popup,
              PlotInfo,
              MapPlugin

    ) {/*jshint unused: false*/
        return declare("base.map.widgets.MapPlot",[MapPlugin], {
            templateString: template,
            name: 'Draw',
            baseClass: 'base-map-widgets-MapPlot',

            baseUrl:APP_ROOT+"base/mark/",
            map:null,
            plotProps:'types:["point","polyline","polygon","text"],showClear:true',
            //plotProps:'types:["polyline"],showClear:true',
            saveMarkSuccess:null,//保存完，或者更新完的回调
            withGrid:false,
            currentPlotId:null,
            constructor: function (args) {
                if(args.parameters){
                    this.plotProps = args.parameters.plotProps?args.parameters.plotProps:this.plotProps;
                    this.currentPlotId = args.parameters.id?args.parameters.id:this.currentPlotId;
                    this.withGrid = args.parameters.withGrid?args.parameters.withGrid:this.withGrid;
                }

            },

            postCreate: function () {
                this.inherited(arguments);
                ////添加地图标绘还原
                //this.addPlotDrag();
            },
            _bindEvents: function () {
                //bind DrawBox
                this.own(on(this.drawBox, 'IconSelected', lang.hitch(this, this._onIconSelected)));
                this.own(on(this.drawBox, 'DrawEnd', lang.hitch(this, this._onDrawEnd)));

                //bind symbol change events
                this.own(on(this.pointSymChooser, 'change', lang.hitch(this, function () {
                    this._setDrawDefaultSymbols();
                })));
                this.own(on(this.lineSymChooser, 'change', lang.hitch(this, function () {
                    this._setDrawDefaultSymbols();
                })));
                this.own(on(this.fillSymChooser, 'change', lang.hitch(this, function () {
                    this._setDrawDefaultSymbols();
                })));
                this.own(on(this.textSymChooser, 'change', lang.hitch(this, function (symbol) {
                    this.drawBox.setTextSymbol(symbol);
                    this.drawBox.updateSelectedSymbol();
                })));


                this.own(topic.subscribe("change/graphic/symbol", lang.hitch(this, this.changeSelectGraphicSymbol)));
            },
            changeSelectGraphicSymbol: function (data) {
                var commontype;
                switch (data.geometry.type) {
                    case "point":
                    case "pointtext":
                    case "multipoint":
                        if (data.geometry.drawExtendType == "pointtext") {
                            commontype = 'text';
                            this.textSymChooser._initTextSettings(data.symbol);
                        } else {
                            commontype = 'point';
                            this.pointSymChooser._initPointSettings(data.symbol);
                        }

                        break;
                    case "polyline":
                        commontype = 'polyline';
                        this.lineSymChooser._initLineSettings(data.symbol);
                        break;
                    default:
                        commontype = 'polygon';
                        this.fillSymChooser._initFillSettings(data.symbol);
                        break;
                }

                this._onIconSelected(null, null, commontype);
            },

            _onIconSelected: function (target, geotype, commontype) {
                if (target) {
                    this.drawBox.clearSelect();
                    this._setDrawDefaultSymbols();
                }

                if (commontype === 'point') {
                    this.viewStack.switchView(this.pointSection);
                }
                else if (commontype === 'polyline') {
                    this.viewStack.switchView(this.lineSection);
                }
                else if (commontype === 'polygon') {
                    this.viewStack.switchView(this.polygonSection);
                }
                else if (commontype === 'text') {
                    this.viewStack.switchView(this.textSection);
                }
            },

            _onDrawEnd: function (graphic, geotype, commontype) {
                var geometry = graphic.geometry;
                if (geometry.type === 'extent') {
                    var a = geometry;
                    var polygon = new Polygon(a.spatialReference);
                    var r = [[a.xmin, a.ymin], [a.xmin, a.ymax], [a.xmax, a.ymax], [a.xmax, a.ymin], [a.xmin, a.ymin]];
                    polygon.addRing(r);
                    geometry = polygon;
                    commontype = 'polygon';
                }
            },
            _setDrawDefaultSymbols: function () {

                this.drawBox.setPointSymbol(this._getPointSymbol());
                this.drawBox.setLineSymbol(this._getLineSymbol());
                this.drawBox.setPolygonSymbol(this._getPolygonSymbol());

                //可能同时更新
                this.drawBox.updateSelectedSymbol();
            },
            _getPointSymbol: function () {
                return this.pointSymChooser.getSymbol();
            },

            _getLineSymbol: function () {
                return this.lineSymChooser.getSymbol();
            },

            _getPolygonSymbol: function () {
                return this.fillSymChooser.getSymbol();
            },

            _getTextSymbol: function () {
                return this.textSymChooser.getSymbol();
            },
            destroy: function () {
                this.drawBox.destroy();
                this.inherited(arguments);
            },

            startup: function () {
                this.inherited(arguments);

                //this._initUnitSelect();
                if(!this.map){
                    this.map= window.viewerMap;
                }
                //jimuUtils.combineRadioCheckBoxWithLabel(this.showMeasure, this.showMeasureLabel);
                this.drawBox.setMap(this.map);

                this.viewStack = new ViewStack({
                    viewType: 'dom',
                    views: [this.pointSection, this.lineSection, this.polygonSection, this.textSection]
                });
                html.place(this.viewStack.domNode, this.settingContent);

                this._bindEvents();

                this.viewStack.startup();
                this.viewStack.switchView(null);

                if(this.currentPlotId){
                    this.getMarkById(this.currentPlotId);
                }

                if(this.withGrid){
                    this.own(on(this.changeBtn,"click",lang.hitch(this,this.changeState)));

                    this.initGrid();
                }else{
                    html.setStyle(this.changeBtn,"display","none");
                }

            },
            initGrid: function () {
                html.setStyle(this.listContainer, "height", this.domNode.clientHeight - 50 + "px");

                var data = {
                    identifier: "idx",
                    items: []
                };

                this.gridStore = new ItemFileWriteStore({data: data});

                var layout = [
                    {
                        field: "idx",
                        style: "text-align:center",
                        width:"35px",
                        name: "<div style='text-align:center'> </div>"
                    },
                    {
                        field: "title",
                        //style: "text-align:center",
                        name: "<div style='text-align:center'>名称</div>"
                    },
                    {
                        field: "time",
                        style: "text-align:center",
                        name: "<div style='text-align:center'>时间</div>"
                    },
                    {
                        field: "id",
                        name: "<div style='text-align:center'>删除</div>",
                        style:"text-align:center;margin:0 auto;",//居中
                        width: "45px",
                        decorator : lang.hitch(this,function( cellData, rowId, rowIndex) {
                            return '<div style="cursor: pointer;margin: auto 0;text-align: center;"> <i style="cursor:pointer" title="删除" data-dojo-attach-point="iconNode"  class="fa fa-trash-o fa-lg"></i></div>'
                        })
                    }
                ];

                this.grid = new Grid({
                    cacheClass: Async,
                    selectRowTriggerOnCell: true,
                    modules: [
                        Focus,
                        VirtualVScroller,
                        ColumnResizer,
                        SelectRow,
                        SingleSort
                    ],
                    style: "width: 100%;height:100%;position:relative;",
                    structure: layout,
                    store: this.gridStore,
                    autoHeight: false
                });
                this.grid.placeAt(this.listContainer);
                this.grid.startup();

                this.grid.connect(this.grid, 'onRowClick', lang.hitch(this, function (event) {

                    var selectedId = event.rowId;
                    var item = this.grid.model.byId(selectedId).item;
                    var index = event.columnIndex;
                    if(index==2){//点击图标查询
                        //清除地图
                        this.delPlotMarkById(item.id[0]).then(lang.hitch(this,function(){
                            this.loadMarks();
                        }));

                        return;
                    }
                    this.getPlotMarkById(item.id);
                }));

                this.loadMarks();
            },
            delPlotMarkById:function(id){
                //删除标绘 可批量［“1”,“2”］
                return commonUtils.del(this.baseUrl,{"ids":[id]}).then(lang.hitch(this, function(json){
                    topic.publish("base/manager/message", {
                        state: "info",
                        title: "标绘图形",
                        content: "<div> 删除成功</div>"
                    });
                    return json;
                }));
            },
            getPlotMarkById:function(id){
                //根据ID查询单个标绘
                commonUtils.get(this.baseUrl+id,{}).then(lang.hitch(this, function(jsons){
                    var l = jsons.data;
                    this.drawBox.addPlotByStr(l[0].content);
                }));
            },
            onOpen: function () {
            },

            savePlot: function () {
                //this.drawBox.export();
                var content = this.drawBox.exportStr();

                if(content==""){
                    //或者允许为空的先
                    topic.publish("base/manager/message", {
                        state: "warn",
                        title: "标绘图形",
                        content: "<div> 请先绘制图形</div>"
                    });
                }else{
                    if(this.currentPlotId){
                        var data = {"content":content};
                        var id = this.currentPlotId;
                        this.updateMarkById(id,data).then(lang.hitch(this,function(json){
                            topic.publish("base/manager/message", {
                                state: "info",
                                title: "更新成功",
                                content: "<div> 成功将【" + id + "】图形更新</div>"
                            });

                            if(this.saveMarkSuccess){
                                this.saveMarkSuccess();
                            }
                            if(this.withGrid){
                                this.loadMarks();
                            }
                        }));
                    }else{
                        var panel=new PlotInfo({});
                        var pop=new Popup({
                            titleLabel:"标绘信息",
                            content:panel,
                            width:500,
                            height:300,
                            button:[],
                            //canMove:false,
                            //overlayShow:false,
                            onClose:lang.hitch(this,function(){
                                if(panel.isFlag){//点击的保存，否则是点击的X
                                    this.savePlot2Mark(content,panel.title,panel.nt,panel.type).then(lang.hitch(this,function(json){
                                        topic.publish("base/manager/message", {
                                            state: "info",
                                            title: "保存成功",
                                            content: "<div> 成功将【" + panel.title + "】保存</div>"
                                        });
                                        if(this.saveMarkSuccess){
                                            this.saveMarkSuccess();
                                        }
                                        if(this.withGrid){
                                            this.loadMarks();
                                        }
                                    }));
                                }

                                panel.destroy();
                                return true;
                            })
                        });
                    }
                }
            },
            savePlot2Mark: function (content,title,nt,type) {
                //新增标绘 post
                return commonUtils.post(this.baseUrl,{
                    //"id":"ebd6aa999f0545599864c463bb62aa48",
                    "content": content,
                    "title": title,
                    "nt":nt,
                    "type":type,
                    "userName": window.userName
                }).then(lang.hitch(this, function(json){
                    //Logger.log(json);
                    return json;
                }));
            },
            loadMarks:function(){
                //查询所有
                commonUtils.get(this.baseUrl,{}).then(lang.hitch(this, function(json){
                    //Logger.log(json);
                    var list = json.data;
                    this.updateGrid(list);
                }));
                ////更新标绘 根据ID
                //var id ="e25cbc25a18147b0a732596e2dc9811e";
                //commonUtils.put(this.baseUrl+id,{"title":"修改了007","content":"xxxxxx"}).then(lang.hitch(this, function(jsonss){
                //    Logger.log(jsonss);
                //}));
            },
            updateGrid:function(list){

                var data = {
                    identifier: "idx",
                    items: []
                };

                var rows = 4;
                for (var i = 0, l = list.length; i < l; i++) {
                    data.items.push(lang.mixin({idx: i + 1}, list[i % l]));
                }


                this.gridStore = new ItemFileWriteStore({data: data});
                this.grid.setStore(this.gridStore);
            },

            getMarkById:function(id){
                this.currentPlotId = id;
                //根据ID查询单个标绘
                commonUtils.get(this.baseUrl+id,{}).then(lang.hitch(this, function(jsons){
                    Logger.log(jsons);
                    var l = jsons.data;
                    //绘制到地图
                    this.drawBox.addPlotByStr(l[0].content);
                    //把找到的第一个图形设置成可编辑
                    var selected = this.drawBox.setSelectEditable();

                    this.changeSelectGraphicSymbol(selected);
                }));
            },
            updateMarkById:function(id,data){
                //更新标绘 根据ID
                return commonUtils.put(this.baseUrl+id,data).then(lang.hitch(this, function(json){
                    return json;
                }));
            },
            flag:true,
            changeState:function(){
                if(this.flag){
                    html.setStyle(this.drawContent,"display","none");
                    html.setStyle(this.drawList,"display","block");
                    if( this.grid){
                        this.grid.resize();
                    }
                    this.flag= false;
                    html.removeClass(this.changeBtnI,"fa-table");
                    html.addClass(this.changeBtnI,"fa-paint-brush");
                    this.divName.innerHTML = "列表";
                }else{
                    html.setStyle(this.drawContent,"display","block");
                    html.setStyle(this.drawList,"display","none");
                    this.flag= true;
                    html.removeClass(this.changeBtnI,"fa-paint-brush");
                    html.addClass(this.changeBtnI,"fa-table");
                    this.divName.innerHTML = "绘制";
                }
            }
        });
    });