/**
 * Created by dailiwei on 14/12/30.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Color",
    "dojo/_base/array",
    "dojo/topic",
    "dojo/dom-construct",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/geometry/Polygon",
    'dojo/_base/html',
    'dojo/_base/connect',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    "base/map/dijit/Box1",
    "base/map/dijit/Box2",
    "base/map/dijit/Box3",
    "base/map/dijit/Box4"
], function (declare,
             lang,
             Color,
             Array,
             topic,
             domConstruct,
             GraphicsLayer,
             Point,
             Graphic,
             Polygon,
             html,
             connect,
             SimpleMarkerSymbol,
             SimpleFillSymbol,
             SimpleLineSymbol,
             Box1,
             Box2,
             Box3,
             Box4
) {

    var MyPoint = function MyPoint(_x,_y){
            this.x = _x;
            this.y = _y;
    };

    MyPoint.prototype.x = 0;
    MyPoint.prototype.y = 0;

    return declare("base.map.exlayers.BoxLayer",[GraphicsLayer], {

        innerHTMLTest: "<div style='width: 100%;height: 100%;' class='mapBox'>" +
        '<div style="padding-left:5px;width:100%;font-size: 13px;font-family:微软雅黑;color: #70a0d0;font-weight: bold">石河水库</div>' +
        '<div style="padding-left:5px;width:100%;font-size: 12px;font-family:微软雅黑;color: #6b6a67;font-weight: bold">2015-02-02 09:00</div>' +
        '<div style="padding-left:5px;width:100%;font-size: 12px;font-family:微软雅黑;color: #6b6a67;font-weight: bold">水位：119.2(m)</div>' +
        "</div>",
        idField:"stcd",
        panelWidth:null,
        panelHeight:null,

        constructor: function (args) {
           

            this.handlers = [];
            declare.safeMixin(this, args);

            var tStr = 'layer/' + args.parameters.catalog + "/";
            //图层控制读取这个id作为
            this.id = args.parameters.layerName;
            //这个属性必须有，图层的通用显示控制需要
            this.catalog = args.parameters.catalog+"/box";

            this.popModule = args.parameters.popModule?args.parameters.popModule:"base/temp/tempView";
            this.panelWidth = args.parameters.panelWidth?args.parameters.panelWidth:300;
            this.panelHeight = args.parameters.panelHeight?args.parameters.panelHeight: 150;
            this.pop = args.parameters.pop?args.parameters.pop:null;
            //兼容数据显示中心化
            this.center = false;
            if(args.parameters.hasOwnProperty("center")){
                this.center = args.parameters.center?args.parameters.center:this.center;
            }
            //idField
            this.idField = args.parameters.idField?args.parameters.idField:this.idField;
            //接收服务端的数据
            this.handlers.push(topic.subscribe(tStr + "data", lang.hitch(this, this.getData)));
            //控制可见
            this.handlers.push(topic.subscribe(tStr + "box/visible", lang.hitch(this, this.setVis)));

            if(this.pop){
                require([this.pop.popModule], lang.hitch(this, function(Module) {
                    this.PopClass = Module;//类声明
                }));
                this.popParameters = this.pop.parameters;
            }else{
                require([this.popModule], lang.hitch(this, function(Module) {
                    this.PopClass = Module;//类声明
                }));
            }
        },

        _setMap: function (map, surface) {
            var div = this.inherited(arguments);
            
            this._divId = new Date().toTimeString();
//            var mapName = args.parameters.mapName||'esri.Map_0';
            var mapName = map.id;
            html.create('div', {
                'id': this._divId,
                'style': 'width:100%;height:100%'
            }, dojo.byId(mapName+'_root'));//这里可能会修改 esri.Map_0_root

            connect.connect(this._map, "onPanStart", lang.hitch(this, this.onPanStart));
            connect.connect(this._map, "onPanEnd", lang.hitch(this, this.onPanEnd));
            connect.connect(this._map, "onPan", lang.hitch(this, this.onPan));

            return div;
        },

        setBoxHTML:function(graphic,html){
            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==graphic.geometry._id){
                    graphic.geometry._html = html;
                    graphic.geometry._div.innerHTML = html;
                    break;
                }
            }
        },

        //删除某个box
        removeBox:function (graphic){

            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==graphic.geometry._id){
                    dojo.byId(this._divId).removeChild(graphic.geometry._div);
                    this.remove(graphic);
                    break;
                }
            }
        },
        //删除某个box id
        removeBoxById:function (id){

            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==id){
                    dojo.byId(this._divId).removeChild(this.graphics[i].geometry._div);
                    this.remove(this.graphics[i]);
                    this.graphics.splice(i,1);
                    break;
                }
            }
        },
        //根据id得到box
        getBoxById:function (id){
            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id =id){
                    return this.graphics[i];
                }
            }
        },
        setBoxId:function(graphic,id){
            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==graphic.geometry._id){

                    //修改div的id
                    var div = dojo.byId("div" + graphic.geometry._id);
                    div.id = "div" + id;
                    this.graphics[i].geometry._id = id;//修改id
                    graphic.geometry._div = div;

                    break;
                }
            }
        },
        setBoxVisbleById:function(id,visble){
            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==id){

                    var graphic = this.graphics[i];
                    //修改div的id
                    var div = dojo.byId("div" +id);
                    dojo.style(div, {
                        'display': (visble?'block':'none')
                    });
                    graphic.geometry._div = div;

                    break;
                }
            }
        },
        setBoxVisble:function(graphic,visble){
            for(var i=0;i<this.graphics.length;i++){
                if(this.graphics[i].geometry._id ==graphic.geometry._id){

                    //修改div的id
                    var div = dojo.byId("div" + graphic.geometry._id);
                    dojo.style(div, {
                        'display': (visble?'block':'none')
                    });
                    graphic.geometry._div = div;

                    break;
                }
            }
        },
        currentVis:true,
        //设置是否可见
        setVis: function (vis) {
            this.setVisibility(vis);
            this.currentVis = vis;
            if (vis) {
                this.show();
            } else {
                this.hide();
            }
        },
        //移除全部内容，重新初始化
        removeAll: function () {
            this.clear();
            domConstruct.empty(dojo.byId(this._divId));
        },
        onPan: function (extent, delta) {
            //更新box
            for (var k = 0; k < this.graphics.length; k++) {
                var item = this.graphics[k];
                var left =  item.geometry._div.style.oleft ;
                var top = item.geometry._div.style.otop ;
                dojo.style(item.geometry._div, {
                    "left": (left  + delta.x) + "px",
                    "top": (top  + delta.y) + "px"
                });

            }
        },
        onPanStart: function () {
            for (var k = 0; k < this.graphics.length; k++) {
                var item = this.graphics[k];
                var left = Number(item.geometry._div.style.left.replace("px", ""));
                var top = Number(item.geometry._div.style.top.replace("px", ""));
                item.geometry._div.style.oleft = left;
                item.geometry._div.style.otop = top;
            }
        },
        onPanEnd: function () {
        },

        firstLoad: true,
        getData:function(list){
            if(!lang.isArray(list)){
                var ls = list.data;
                this.filterData = list.filterData;
                list = ls;
            }
            if (this.firstLoad) {
                this.firstLoad = false;
            }
            //清除点
            this.removeAll();
            //清除box html

            //先创建点
            for (var i = 0, max = list.length; i < max; i++) {
                var item = list[i];
                var pt = new Point(item.lgtd, item.lttd);
                var PointSymbol = new SimpleMarkerSymbol();
                PointSymbol.setOutline(new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([0,0,0]),
                    1
                ));
                PointSymbol.setSize(8);//设置符合的大小

                var gra = new Graphic(pt, PointSymbol, item);//不给符号的话，没有符号显示，必须赋符号
                this.add(gra);
                gra.hide();
                //在创建点附近的html box

                if( this.center){
                    this.createCenterBox(gra);
                }else{
                    this.createBox(gra);
                }

            }

        },

        //根据点创建BOX HTML
        createBox: function (graphic) {
            var id = graphic.attributes[this.idField];

            var point = graphic.geometry;
            var _boxDiv;
            var exit = dojo.byId("div" + id);
            var quad = graphic.attributes["quad"];
            if (exit) {
                _boxDiv = exit;
            }else{
                _boxDiv = html.create('div', {
                    'id': "div" + id,
                    "class":""
                });

                var box = new Box4({});
                if(graphic.attributes.hasOwnProperty("quad")) {
                    if (quad=="1") {
                        box = new Box1({});
                    } else if (quad=="2") {
                        box = new Box2({});
                    } else if (quad=="3") {
                        box = new Box3({});
                    }
                }

                domConstruct.place(box.domNode, _boxDiv);
                box.startup();

                var panel = new this.PopClass({
                    data: graphic.attributes
                });

                domConstruct.place(panel.domNode, box.getContainer());
                dojo.byId(this._divId).appendChild(_boxDiv);
            }

            var showPt = this._map.toScreen(point);

            var left = showPt.x+5 -30;
        	var top = showPt.y +2+20;
            //有几个方向 1，2，3，4象限 quad
            if(graphic.attributes.hasOwnProperty("quad")){

            	if(quad=="1"){
            		left = showPt.x+5 -30;
            		top = showPt.y -4 -30-this.panelHeight;
            	}else if(quad=="2"){
            		left = showPt.x+1+10-this.panelWidth;
            		top = showPt.y -4-30-this.panelHeight;
            	}else if(quad=="3"){
            		left =  showPt.x+1+10-this.panelWidth;
            		top = showPt.y +2+20;
            	}
            }
            dojo.style(_boxDiv, {
                "left": left + "px",
                "top": top + "px",
                "position": "absolute",
                "width": this.panelWidth+ 10 + "px",
                "height": this.panelHeight+10 + "px",
                "margin": '2px'
            });

            graphic.geometry._id = id;
            graphic.geometry._point = point;
            graphic.geometry._div = _boxDiv;

            return graphic;
        },

        //根据点创建BOX HTML
        createCenterBox: function (graphic) {
            var id = graphic.attributes[this.idField];

            var point = graphic.geometry;
            var _boxDiv;
            var exit = dojo.byId("div" + id);
            var quad = graphic.attributes["quad"];
            if (exit) {
                _boxDiv = exit;
            }else{
                _boxDiv = html.create('div', {
                    'id': "div" + id,
                    "class":""
                });

                var panel = new this.PopClass({
                    data: graphic.attributes,
                    panelWidth: this.panelWidth,
                    panelHeight: this.panelHeight
                });

                domConstruct.place(panel.domNode, _boxDiv);
                dojo.byId(this._divId).appendChild(_boxDiv);
                panel.startup();
            }

            var showPt = this._map.toScreen(point);

            var left = showPt.x - this.panelWidth/2;
            var top = showPt.y - this.panelHeight/2;

            dojo.style(_boxDiv, {
                "left": left + "px",
                "top": top + "px",
                "position": "absolute",
                "width": this.panelWidth+   "px",
                "height": this.panelHeight+  "px",
                "margin": '0px'
            });

            graphic.geometry._id = id;
            graphic.geometry._point = point;
            graphic.geometry._div = _boxDiv;

            return graphic;
        },

        _onZoomStartHandler: function () {
            this.inherited(arguments);
            this.hide();
        },
        //缩放
        _onExtentChangeHandler: function () {
            this.inherited(arguments);
            this.updateBox();

            if(this.currentVis){
                this.show();
            }
        },
        //更新box
        updateBox: function () {
            for (var k = 0; k < this.graphics.length; k++) {
                var item = this.graphics[k];

                if( this.center){
                    this.createCenterBox(item);
                }else{
                    this.createBox(item);
                }
            }
        },

        hide: function () {
            dojo.style(dojo.byId(this._divId), {
                "display": "none"
            });
        },
        show: function () {
            dojo.style(dojo.byId(this._divId), {
                "display": ""
            });
        }
    });
});
