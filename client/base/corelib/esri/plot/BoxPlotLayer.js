/**
 * Created by dailiwei on 14/12/30.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Color",
    "dojo/_base/array",
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
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/MenuSeparator",
    './MyPoint',
    "dojo/dnd/move"
], function (declare,
             lang,
             color,
             Array,
             domConstruct,
             GraphicsLayer,
             Point,
             Graphic,
             Polygon,
             html,
             connect,
             SimpleMarkerSymbol,
             SimpleFill,
             SimpleLine,
             Menu,
             MenuItem,
             MenuSeparator,
             MyPoint,
             move) {
    return declare([GraphicsLayer], {

        //会有个默认的样式
        defaultBoxSymbol:new SimpleFill(SimpleFill.STYLE_SOLID, new SimpleLine(SimpleLine.STYLE_SOLID, new color([30, 144, 255]), 2), new color([255, 255, 255, 0.95])),

        constructor: function (options) {
            this._divId = new Date().toTimeString();
            var mapName = options.mapName||'map';
            html.create('div', {
                'id': this._divId,
                'style': 'width:100%;height:100%'
            }, dojo.byId(mapName+'_root'));//这里可能会修改
            var enableEdit = options.enableEdit||true;
            //是否开启右键编辑功能,默认不开启
            if(enableEdit){
                this.createGraphicsMenu();
            }
            this.defaultBoxSymbol = options.boxSymbol ||this.defaultBoxSymbol;

        },
        selected:null,
        createGraphicsMenu: function () {
            var ctxMenuForGraphics = new Menu({});
            ctxMenuForGraphics.addChild(new MenuItem({
                label: "编辑控制点",
                onClick:lang.hitch(this,function (evt) {
                    this.isEdit = true;
                    this.deleteCps();
                    this.createImgPoints(this.selected);
                })
            }));
            ctxMenuForGraphics.addChild(new MenuItem({
                label: "停止编辑",
                onClick:lang.hitch(this,function (evt) {
                    this.isEdit = true;
                    this.deleteCps();
                    this.isEdit = false;
                })
            }));


            ctxMenuForGraphics.addChild(new MenuSeparator());
            ctxMenuForGraphics.addChild(new MenuItem({
                label: "删除",
                onClick:lang.hitch(this,function (evt) {


                    this.removeBox(this.selected);
                })
            }));

            ctxMenuForGraphics.startup();

            this.on("mouse-over", lang.hitch(this,function (evt) {
                this.selected = evt.graphic;
                ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
            }));

            this.on("mouse-out",lang.hitch(this, function (evt) {
                ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
            }));
        },
        level: 0,
        mapclickhander: null,
        _setMap: function (map, surface) {
            var div = this.inherited(arguments);

            connect.connect(this._map, "onPanStart", lang.hitch(this, this.onPanStart));
            connect.connect(this._map, "onPanEnd", lang.hitch(this, this.onPanEnd));
            connect.connect(this._map, "onPan", lang.hitch(this, this.onPan));

            //this.mapclickhander = connect.connect(this._map, "onClick", lang.hitch(this, this.mapClick));
            this.level = map.getLevel();

            return div;
        },
        setBoxHTML:function(graphic,html){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==graphic.geometry._id){
                    graphic.geometry._html = html;
                    graphic.geometry._div.innerHTML = html;
                    break;
                }
            }
        },
        setBoxSymbol:function(graphic,symbol){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==graphic.geometry._id){
                    graphic.setSymbol(symbol);
                    break;
                }
            }
        },
        //删除某个box
        removeBox:function (graphic){
            this.deleteCps();
            this.isEdit = false;

            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==graphic.geometry._id){
                    dojo.byId(this._divId).removeChild(graphic.geometry._div);
                    this.remove(graphic);
                    this.boxGraphics.splice(i,1);
                    break;
                }
            }
        },
        //删除某个box id
        removeBoxById:function (id){
            this.deleteCps();
            this.isEdit = false;

            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==id){
                    dojo.byId(this._divId).removeChild(graphic.geometry._div);
                    this.remove(graphic);
                    this.boxGraphics.splice(i,1);
                    break;
                }
            }
        },
        //根据id得到box
        getBoxById:function (id){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id =id){
                    return this.boxGraphics[i];
                }
            }
        },
        setBoxId:function(graphic,id){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==graphic.geometry._id){

                    //修改div的id
                    var div = dojo.byId("div" + graphic.geometry._id);
                    div.id = "div" + id;
                    this.boxGraphics[i].geometry._id = id;//修改id
                    graphic.geometry._div = div;

                    break;
                }
            }
        },
        addBox:function(graphic){
            //createPlotBox: function (point, html, path, symbol) {
            //    if(html==""||html==''){//传个空串
            //        html = this.defaultPath;
            //    }
            //    if(path==""||path==''){//传个空串
            //        path = this.defaultPath;
            //    }
            //    if(symbol==""||symbol==''){//传个空串
            //        symbol = this.defaultBoxSymbol;
            //    }
            //
            //    var graphic = new Graphic(this.createGeo(point, null, path), symbol, {point: point});
            //    this.add(graphic);
            //    var graphic = this.createBox(point, graphic, new Date().toTimeString(), html, path);
            //    //保存创建的
            //    this.boxGraphics.push(graphic);
            //},

            var point  = graphic.geometry;
            var sym  = graphic.symbol;
            this.createPlotBox(point,graphic.geometry._html,graphic.geometry._path,sym);
        },
        setBoxVisbleById:function(id,visble){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==id){

                    var graphic = this.boxGraphics[i];
                    //修改div的id
                    var div = dojo.byId("div" +id);
                    dojo.style(div, {
                        'display': (visble?'block':'none')
                    });
                    graphic.geometry._div = div;
                    visble?graphic.show():graphic.hide();
                    this.boxGraphics[i].geometry._visible = visble;

                    break;
                }
            }
        },
        setBoxVisble:function(graphic,visble){
            for(var i=0;i<this.boxGraphics.length;i++){
                if(this.boxGraphics[i].geometry._id ==graphic.geometry._id){

                    //修改div的id
                    var div = dojo.byId("div" + graphic.geometry._id);
                    dojo.style(div, {
                        'display': (visble?'block':'none')
                    });
                    graphic.geometry._div = div;
                    visble?graphic.show():graphic.hide();
                    this.boxGraphics[i].geometry._visible = visble;

                    break;
                }
            }
        },
        //设置是否可见
        setVisible: function (vis) {
            this.setVisibility(vis);
            if (vis) {
                this.show();
            } else {
                this.hide();
            }
        },
        //移除全部内容，重新初始化
        removeAll: function () {
            this.clear();
            this.boxGraphics = [];
            domConstruct.empty(dojo.byId(this._divId));
            this.currentEGrahic = null;
            this.isEdit =false;
        },
        onPan: function (extent, delta) {
            //更新box
            for (var k = 0; k < this.boxGraphics.length; k++) {
                var item = this.boxGraphics[k];
                var left =  item.geometry._div.style.oleft ;
                var top = item.geometry._div.style.otop ;
                dojo.style(item.geometry._div, {
                    "left": (left  + delta.x) + "px",
                    "top": (top  + delta.y) + "px"
                });

            }
        },
        onPanStart: function () {
            this.deleteCps();
            for (var k = 0; k < this.boxGraphics.length; k++) {
                var item = this.boxGraphics[k];
                var left = Number(item.geometry._div.style.left.replace("px", ""));
                var top = Number(item.geometry._div.style.top.replace("px", ""));
                item.geometry._div.style.oleft = left;
                item.geometry._div.style.otop = top;
            }
            //this.hide();
        },
        onPanEnd: function () {
            //this.show();
        },
        boxGraphics: [],//保存地图标注框的东西
        mapClick: function (e) {
            connect.disconnect(this.mapclickhander);
            var point = e.mapPoint;
            var graphic = new Graphic(this.createGeo(point), this.defaultBoxSymbol, {point: point});
            this.add(graphic);

            var graphic = this.createBox(point, graphic, new Date().toTimeString(), this.innerHTMLTest, this.FramePath);

            this.boxGraphics.push(graphic);

            this.createImgPoints(graphic);
        },
        //默认的形状
        defaultPath:"-204,-202,-31.75,-202,140.5,-202,140.5,-171.25,140.5,-140.5,p97.4375,p-140.5,h0,h0,p11.3125,p-140.5,-31.75,-140.5,-204,-140.5,-204,-171.25",
        //默认的文本内容，空的div就是
        defaultHtml:"<div style='width: 100%;height: 100%;background-color: transparent'></div>",
        //锚点，内容，形状，符号
        createPlotBox: function (point, html, path, symbol) {
            if(html==""||html==''){//传个空串
                html = this.defaultPath;
            }
            if(path==""||path==''){//传个空串
                path = this.defaultPath;
            }
            if(symbol==""||symbol==''){//传个空串
                symbol = this.defaultBoxSymbol;
            }

            var graphic = new Graphic(this.createGeo(point, null, path), symbol, {point: point});
            this.add(graphic);
            var graphic = this.createBox(point, graphic, new Date().toTimeString(), html, path);
            //保存创建的
            this.boxGraphics.push(graphic);
            //this.isEdit = true;
            //this.createImgPoints(graphic);
        },
        createPlotBoxByJSONString:function(str){
            var json = JSON.parse(str);
            this.createPlotBoxByJSON(json);
        },
        createPlotBoxByJSON: function (own) {

            var point = new Point(own.point);
            var symbol;
            if(own.hasOwnProperty("symbol")&&own.symbol!=""){
                symbol = new SimpleFill(own.symbol);
            }else{
                symbol = "";
            }

            this.createPlotBox(point,decodeURI(own.html),own.path,symbol);
        },
        innerHTMLTest: "<div style='width: 100%;height: 100%;background-color: transparent'>" +
        '<div style="padding-left:5px;width:100%;font-size: 13px;font-family:微软雅黑;color: #70a0d0;font-weight: bold">石河水库</div>' +
        '<div style="padding-left:5px;width:100%;font-size: 12px;font-family:微软雅黑;color: #6b6a67;font-weight: bold">2015-02-02 09:00</div>' +
        '<div style="padding-left:5px;width:100%;font-size: 12px;font-family:微软雅黑;color: #6b6a67;font-weight: bold">水位：119.2(m)</div>' +
        "</div>",
        createBox: function (point, graphic, id, innerHTML, path) {
            var id = id;
            var exit = dojo.byId("div" + id);
            if (exit) {
                dojo.byId(this._divId).removeChild(dojo.byId("div" + id));
            }
            var _chartDiv = html.create('div', {
                'id': "div" + id,
                innerHTML: innerHTML
            });
            var showPt = this._map.toScreen(point);
            dojo.byId(this._divId).appendChild(_chartDiv);
            dojo.style(_chartDiv, {
                "left": (showPt.x - 150) + "px",
                "top": (showPt.y - 150) + "px",
                "position": "absolute",
                "width": 200 - 4 + "px",
                "height": 100 - 4 + "px",
                'margin': '2px'
            });


            graphic.geometry._id = id;
            graphic.geometry._path = graphic.geometry.hasOwnProperty("_path") ? graphic.geometry._path : path;
            graphic.geometry._point = point;
            graphic.geometry._div = _chartDiv;
            graphic.geometry._html = innerHTML;

            this.DrawFrame(graphic.geometry._path, graphic);
            return graphic;
        },
        createGeo: function (point, graphic, path) {
            var screenPt = this._map.toScreen(point);

            var clickPoint;
            if (graphic) {
                clickPoint = this.DrawFrame(graphic.geometry._path, graphic);
            } else {
                clickPoint = this.DrawFrame(path);
            }

            var screenPtX = screenPt.x - 1;
            screenPt = screenPt.y - 1;
            if (graphic) {
                var geomgtry =  this._toPolygon(clickPoint, screenPtX, screenPt);
                geomgtry._point = graphic.geometry._point;
                geomgtry._lefttop = graphic.geometry._lefttop;
                geomgtry._path = graphic.geometry._path;
                geomgtry._html = graphic.geometry._html;
                geomgtry._div = graphic.geometry._div;
                geomgtry._id = graphic.geometry._id;
                geomgtry._visible = true;
                return geomgtry
            } else {
                return this._toPolygon(clickPoint, screenPtX, screenPt);
            }



        },
        _toPolygon: function (pointCollection, screenPtX, screenPtY) {
            var map = this._map, result = new Polygon(this._map.spatialReference);
            result.addRing(Array.map(pointCollection, function (b) {
                return map.toMap({x: b[0] + screenPtX, y: b[1] + screenPtY})
            }));
            return result
        },
        _unsetMap: function () {
            this.inherited(arguments);
        },
        _onZoomStartHandler: function () {
            this.inherited(arguments);

            this.deleteCps();
            this.hide();
        },
        //缩放
        _onExtentChangeHandler: function () {
            this.inherited(arguments);
            this.updateBox();
            if (this.isEdit&&this.visible) {
                this.createImgPoints(this.currentEGrahic);
            }
            this.show();
        },
        //更新box
        updateBox: function () {
            for (var k = 0; k < this.boxGraphics.length; k++) {
                var item = this.boxGraphics[k];
                var point = item.geometry["_point"];
                item.geometry = this.createGeo(point, item);
                item.setGeometry(item.geometry);
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
        },
        //左上
        ZSx: -150,
        ZSy: -150,
        //上中
        SZx: -50,
        SZy: -150,
        //右上
        YSx: 50,
        YSy: -150,
        //右中
        YZx: 50,
        YZy: -100,
        //右下
        YXx: 50,
        YXy: -50,
        //下中
        XZx: -50,
        XZy: -50,
        //左下
        ZXx: -150,
        ZXy: -50,
        //中中
        ZZx: -150,
        ZZy: -100,

        Handx: 0,
        Handy: 0,

        calLength: function (x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        },
        ApplyFramePath: function (pathstr) {
            var i;
            var j; //拐点位置
            var tmparr = pathstr.split(",");
            //除去标记字符 p  抽出h标记
            for (i = 0; i < tmparr.length; i++) {
                if (tmparr[i].toString().indexOf("p") > -1) {
                    j = i;
                    break;
                }
            }
            var tg1 = tmparr.slice(0, j);
            var tg2 = tmparr.slice(j + 6, tmparr.length);
            var tg3 = tmparr.slice(j + 2, j + 4);
            var tg = tg1.concat(tg2).concat(tg3);
            tmparr = tg;
            this.ZSx = Number(tmparr[0]);
            this.ZSy = Number(tmparr[1]);
            this.SZx = Number(tmparr[2]);
            this.SZy = Number(tmparr[3]);
            this.YSx = Number(tmparr[4]);
            this.YSy = Number(tmparr[5]);
            this.YZx = Number(tmparr[6]);
            this.YZy = Number(tmparr[7]);
            this.YXx = Number(tmparr[8]);
            this.YXy = Number(tmparr[9]);
            this.XZx = Number(tmparr[10]);
            this.XZy = Number(tmparr[11]);
            this.ZXx = Number(tmparr[12]);
            this.ZXy = Number(tmparr[13]);
            this.ZZx = Number(tmparr[14]);
            this.ZZy = Number(tmparr[15]);
            this.Handx = Number(tmparr[16].toString().replace("h", ""));
            this.Handy = Number(tmparr[17].toString().replace("h", ""));
        },
        ApplyFramePathNew: function () {
            var i;
            var j; //拐点位置
            var tmparr = this.NowFramePath.split(",");
            //除去标记字符 p  抽出h标记
            for (i = 0; i < tmparr.length; i++) {
                if (tmparr[i].toString().indexOf("p") > -1) {
                    j = i;
                    break;
                }
            }
            var tg1 = tmparr.slice(0, j);
            var tg2 = tmparr.slice(j + 6, tmparr.length);
            var tg3 = tmparr.slice(j + 2, j + 4);
            var tg = tg1.concat(tg2).concat(tg3);
            tmparr = tg;
            this.Handx = Number(tmparr[16].toString().replace("h", "")) - 4.5;
            this.Handy = Number(tmparr[17].toString().replace("h", "")) - 4.5;
            this.ZSx = Number(tmparr[0]) - this.Handx;
            this.ZSy = Number(tmparr[1]) - this.Handy;
            this.SZx = Number(tmparr[2]) - this.Handx;
            this.SZy = Number(tmparr[3]) - this.Handy;
            this.YSx = Number(tmparr[4]) - this.Handx;
            this.YSy = Number(tmparr[5]) - this.Handy;
            this.YZx = Number(tmparr[6]) - this.Handx;
            this.YZy = Number(tmparr[7]) - this.Handy;
            this.YXx = Number(tmparr[8]) - this.Handx;
            this.YXy = Number(tmparr[9]) - this.Handy;
            this.XZx = Number(tmparr[10]) - this.Handx;
            this.XZy = Number(tmparr[11]) - this.Handy;
            this.ZXx = Number(tmparr[12]) - this.Handx;
            this.ZXy = Number(tmparr[13]) - this.Handy;
            this.ZZx = Number(tmparr[14]) - this.Handx;
            this.ZZy = Number(tmparr[15]) - this.Handy;

            this.Handx = -4.5;
            this.Handy = -4.5;
        },
        GenFramePath: function () {
            var ret = [];
            var retstr = "";
            //用来判断位置的数组
            var tmpArray = [];
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.ZSx, this.ZSy) + this.calLength(this.Handx, this.Handy, this.SZx, this.SZy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.SZx, this.SZy) + this.calLength(this.Handx, this.Handy, this.YSx, this.YSy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.YSx, this.YSy) + this.calLength(this.Handx, this.Handy, this.YZx, this.YZy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.YZx, this.YZy) + this.calLength(this.Handx, this.Handy, this.YXx, this.YXy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.YXx, this.YXy) + this.calLength(this.Handx, this.Handy, this.XZx, this.XZy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.XZx, this.XZy) + this.calLength(this.Handx, this.Handy, this.ZXx, this.ZXy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.ZXx, this.ZXy) + this.calLength(this.Handx, this.Handy, this.ZZx, this.ZZy));
            tmpArray.push(this.calLength(this.Handx, this.Handy, this.ZZx, this.ZZy) + this.calLength(this.Handx, this.Handy, this.ZSx, this.ZSy));
            //逐项比较后取出最短距离
            var tmpPos = 0;
            var i;
            var j = Number(tmpArray[0]);
            for (i = 1; i < tmpArray.length; i++) {
                if (tmpArray[i] <= j) {
                    j = tmpArray[i];
                    tmpPos = i;
                }
            }
            //根据距离判断所在区域
            //中点位置
            var MidX = 0;
            var MidY = 0;
            //var pt1:Point;
            //var pt2:Point
            var pt1;
            var pt2
            //插入矩形框体
            ret.push(this.ZSx.toString(), this.ZSy.toString(), this.SZx.toString(), this.SZy.toString(), this.YSx.toString(), this.YSy.toString(), this.YZx.toString(), this.YZy.toString(), this.YXx.toString(), this.YXy.toString(), this.XZx.toString(), this.XZy.toString(), this.ZXx.toString(), this.ZXy.toString(), this.ZZx.toString(), this.ZZy.toString());
            //在路径中增加标记以便区分矩形控制点和脚点
            switch (tmpPos) {
                case 0:
                    if (this.Handy < this.ZSy) {
                        MidX = (this.ZSx + this.SZx) / 2;
                        MidY = (this.ZSy + this.SZy) / 2;
                        pt1 = new MyPoint(((MidX + this.ZSx) / 2), ((MidY + this.ZSy) / 2));
                        pt2 = new MyPoint(((MidX + this.SZx) / 2), ((MidY + this.SZy) / 2));
                        ret.splice(2, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString());
                    }
                    else {
                        MidX = (this.ZSx + this.ZZx) / 2;
                        MidY = (this.ZSy + this.ZZy) / 2;
                        pt1 = new MyPoint((MidX + this.ZZx) / 2, (MidY + this.ZZy) / 2);
                        pt2 = new MyPoint((MidX + this.ZSx) / 2, (MidY + this.ZSx) / 2);
                        ret.splice(16, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 1:
                    if (this.Handy < this.YSy) {
                        //脚注控制开始----
                        MidX = (this.YSx + this.SZx) / 2;
                        MidY = (this.YSy + this.SZy) / 2;
                        pt1 = new MyPoint((MidX + this.SZx) / 2, (MidY + this.SZy) / 2);
                        pt2 = new MyPoint((MidX + this.YSx) / 2, (MidY + this.YSy) / 2);
                        ret.splice(4, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        MidX = (this.YSx + this.YZx) / 2;
                        MidY = (this.YSy + this.YZy) / 2;
                        pt1 = new MyPoint((MidX + this.YSx) / 2, (MidY + this.YSy) / 2);
                        pt2 = new MyPoint((MidX + this.YZx) / 2, (MidY + this.YZy) / 2);
                        ret.splice(6, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 2:
                    if (this.Handx > this.YSx) {
                        //脚注控制开始----
                        MidX = (this.YSx + this.YZx) / 2;
                        MidY = (this.YSy + this.YZy) / 2;
                        pt1 = new MyPoint((MidX + this.YSx) / 2, (MidY + this.YSy) / 2);
                        pt2 = new MyPoint((MidX + this.YZx) / 2, (MidY + this.YZy) / 2);
                        ret.splice(6, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        //脚注控制开始----
                        MidX = (this.YSx + this.SZx) / 2;
                        MidY = (this.YSy + this.SZy) / 2;
                        pt1 = new MyPoint((MidX + this.SZx) / 2, (MidY + this.SZy) / 2);
                        pt2 = new MyPoint((MidX + this.YSx) / 2, (MidY + this.YSy) / 2);
                        ret.splice(4, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 3:
                    if (this.Handx > this.YXx) {
                        //脚注控制开始----
                        MidX = (this.YZx + this.YXx) / 2;
                        MidY = (this.YZy + this.YXy) / 2;
                        pt1 = new MyPoint((MidX + this.YZx) / 2, (MidY + this.YZy) / 2);
                        pt2 = new MyPoint((MidX + this.YXx) / 2, (MidY + this.YXy) / 2);
                        ret.splice(8, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        MidX = (this.YXx + this.XZx) / 2;
                        MidY = (this.YXy + this.XZy) / 2;
                        pt1 = new MyPoint((MidX + this.YXx) / 2, (MidY + this.YXy) / 2);
                        pt2 = new MyPoint((MidX + this.XZx) / 2, (MidY + this.XZy) / 2);
                        ret.splice(10, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 4:
                    if (this.Handy > this.YXy) {
                        //脚注控制开始----
                        MidX = (this.YXx + this.XZx) / 2;
                        MidY = (this.YXy + this.XZy) / 2;
                        pt1 = new MyPoint((MidX + this.YXx) / 2, (MidY + this.YXy) / 2);
                        pt2 = new MyPoint((MidX + this.XZx) / 2, (MidY + this.XZy) / 2);
                        ret.splice(10, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        MidX = (this.YZx + this.YXx) / 2;
                        MidY = (this.YZy + this.YXy) / 2;
                        pt1 = new MyPoint((MidX + this.YZx) / 2, (MidY + this.YZy) / 2);
                        pt2 = new MyPoint((MidX + this.YXx) / 2, (MidY + this.YXy) / 2);
                        ret.splice(8, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 5:
                    if (this.Handy > this.ZXy) {
                        //脚注控制开始----
                        MidX = (this.XZx + this.ZXx) / 2;
                        MidY = (this.XZy + this.ZXy) / 2;
                        pt1 = new MyPoint((MidX + this.XZx) / 2, (MidY + this.XZy) / 2);
                        pt2 = new MyPoint((MidX + this.ZXx) / 2, (MidY + this.ZXy) / 2);
                        ret.splice(12, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        MidX = (this.ZXx + this.ZZx) / 2;
                        MidY = (this.ZXy + this.ZZy) / 2;
                        pt1 = new MyPoint((MidX + this.ZXx) / 2, (MidY + this.ZXy) / 2);
                        pt2 = new MyPoint((MidX + this.ZZx) / 2, (MidY + this.ZZy) / 2);
                        ret.splice(14, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 6:
                    if (this.Handx < this.ZXx) {
                        //脚注控制开始----
                        MidX = (this.ZXx + this.ZZx) / 2;
                        MidY = (this.ZXy + this.ZZy) / 2;
                        pt1 = new MyPoint((MidX + this.ZXx) / 2, (MidY + this.ZXy) / 2);
                        pt2 = new MyPoint((MidX + this.ZZx) / 2, (MidY + this.ZZy) / 2);
                        ret.splice(14, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        //脚注控制开始----
                        MidX = (this.XZx + this.ZXx) / 2;
                        MidY = (this.XZy + this.ZXy) / 2;
                        pt1 = new MyPoint((MidX + this.XZx) / 2, (MidY + this.XZy) / 2);
                        pt2 = new MyPoint((MidX + this.ZXx) / 2, (MidY + this.ZXy) / 2);
                        ret.splice(12, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    break;
                case 7:
                    if (this.Handx < this.ZSx) {
                        //脚注控制开始----
                        MidX = (this.ZSx + this.ZZx) / 2;
                        MidY = (this.ZSy + this.ZZy) / 2;
                        pt1 = new MyPoint((MidX + this.ZZx) / 2, (MidY + this.ZZy) / 2);
                        pt2 = new MyPoint((MidX + this.ZSx) / 2, (MidY + this.ZSx) / 2);
                        ret.splice(16, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString()); //脚注控制结束
                    }
                    else {
                        MidX = (this.ZSx + this.SZx) / 2;
                        MidY = (this.ZSy + this.SZy) / 2;
                        pt1 = new MyPoint(((MidX + this.ZSx) / 2), ((MidY + this.ZSy) / 2));
                        pt2 = new MyPoint(((MidX + this.SZx) / 2), ((MidY + this.SZy) / 2));
                        ret.splice(2, 0, "p" + pt1.x.toString(), "p" + pt1.y.toString(), "h" + this.Handx.toString(), "h" + this.Handy.toString(), "p" + pt2.x.toString(), "p" + pt2.y.toString());
                    }
                    break;
                default:
                    break;
            }
            //转换为路径字符串
            for (i = 0; i < ret.length - 1; i++) {
                retstr += ret[i].toString() + ",";
            }
            retstr += ret[ret.length - 1].toString();
            this.NowFramePath = retstr;
            return retstr;
        },
        NowFramePath: "-150,-150,-50,-150,50,-150,50,-100,50,-50,p25,p-50,h0,h0,p-25,p-50,-50,-50,-150,-50,-150,-100",

        AdjustFrame: function (ctrname, x, y) {
            switch (ctrname) {
                case "leftuppoint":
                    this.ZSx = x + 4.5;
                    this.ZSy = y + 4.5;
                    this.SZx = (this.ZSx + this.YXx) / 2;
                    this.SZy = this.ZSy;
                    this.YSx = this.YXx;
                    this.YSy = this.ZSy;
                    this.YZx = this.YXx;
                    this.YZy = (this.ZSy + this.YXy) / 2;
                    this.XZx = (this.ZSx + this.YXx) / 2;
                    this.XZy = this.YXy;
                    this.ZXx = this.ZSx;
                    this.ZXy = this.YXy;
                    this.ZZx = this.ZSx;
                    this.ZZy = (this.ZSy + this.YXy) / 2;
                    break;
                case "rightuppoint":
                    this.YSx = x + 4.5;
                    this.YSy = y + 4.5;
                    this.YZx = this.YSx;
                    this.YZy = (this.ZXy + this.YSy) / 2;
                    this.YXx = this.YSx;
                    this.YXy = this.ZXy;
                    this.XZx = (this.ZXx + this.YSx) / 2;
                    this.XZy = this.ZXy;
                    this.ZZx = this.ZXx;
                    this.ZZy = (this.YSy + this.ZXy) / 2;
                    this.ZSx = this.ZXx;
                    this.ZSy = this.YSy;
                    this.SZx = (this.ZXx + this.YSx) / 2;
                    this.SZy = this.YSy;
                    break;
                case "rightdownpoint":
                    this.YXx = x + 4.5;
                    this.YXy = y + 4.5;
                    this.XZx = (this.ZSx + this.YXx) / 2;
                    this.XZy = this.YXy;
                    this.ZXx = this.ZSx;
                    this.ZXy = this.YXy;
                    this.ZZx = this.ZSx;
                    this.ZZy = (this.ZSy + this.YXy) / 2;
                    this.SZx = (this.ZSx + this.YXx) / 2;
                    this.SZy = this.ZSy;
                    this.YSx = this.YXx;
                    this.YSy = this.ZSy;
                    this.YZx = this.YXx;
                    this.YZy = (this.ZSy + this.YXy) / 2;
                    break;
                case "leftdownpoint":
                    this.ZXx = x + 4.5;
                    this.ZXy = y + 4.5;
                    this.ZZx = this.ZXx;
                    this.ZZy = (this.YSy + this.ZXy) / 2;
                    this.ZSx = this.ZXx;
                    this.ZSy = this.YSy;
                    this.SZx = (this.ZXx + this.YSx) / 2;
                    this.SZy = this.YSy;
                    this.YZx = this.YSx;
                    this.YZy = (this.ZXy + this.YSy) / 2;
                    this.YXx = this.YSx;
                    this.YXy = this.ZXy;
                    this.XZx = (this.ZXx + this.YSx) / 2;
                    this.XZy = this.ZXy;
                    break;

                case "footpoint":
                    this.Handx = x + 4.5;
                    this.Handy = y + 4.5;
                    break;
            }
            var tmpstr = this.GenFramePath();
            return tmpstr;
        },
        FramePath: "-150,-150,-50,-150,50,-150,50,-100,50,-50,p25,p-50,h0,h0,p-25,p-50,-50,-50,-150,-50,-150,-100",
        //绘制边缘框体
        DrawFrame: function (FramePathStr, graphic) {
            this.ApplyFramePath(FramePathStr);
            var tmparr = FramePathStr.split(",");

            var pps = [];
            for (i = 0; i < tmparr.length; i++) {
                var pp = [];
                var myPattern = /p/gi;
                var px = tmparr[i].toString().replace(myPattern, "");
                myPattern = /h/gi;
                px = px.replace(myPattern, "");
                tmparr[i] = parseFloat(px);
                pp.push(tmparr[i]);

                myPattern = /p/gi;
                var py = tmparr[i + 1].toString().replace(myPattern, "");
                myPattern = /h/gi;
                py = py.replace(myPattern, "");
                tmparr[i + 1] = parseFloat(py);
                pp.push(tmparr[i + 1]);

                pps.push(pp);
                i++;
            }
            //第一个点 跟最后一个点要相接 Number(tmparr[0]), Number(tmparr[1]));
            pps.push(pps[0]);

            if (graphic) {
                var retPointArrX = [];
                var retPointArrY = [];
                for (i = 0; i < tmparr.length; i = i + 2) {
                    retPointArrX.push(Number(tmparr[i]));
                    retPointArrY.push(Number(tmparr[i + 1]));
                }
                retPointArrX = this.sortArray(retPointArrX);
                retPointArrY = this.sortArray(retPointArrY);
                //分别取出XY值最小的第二个 和最大的倒数第二个
                var xmin = Number(retPointArrX[1]);
                var xmax = Number(retPointArrX[retPointArrX.length - 2]);
                var ymin = Number(retPointArrY[1]);
                var ymax = Number(retPointArrY[retPointArrY.length - 2]);
                // 直接计算出位置
                var xx = xmin;
                var yy = ymin;
                var ww = xmax - xmin;
                var hh = ymax - ymin;
                this.ffff(graphic, xx, yy, ww, hh);
            }


            return pps;
        },
        ffff: function (graphic, x, y, w, h) {
            var id = graphic.geometry._id;
            var _chartDiv = dojo.byId("div" + id);
            if (!_chartDiv) {
                _chartDiv = html.create('div', {
                    'id': "div" + id,
                    innerHTML: graphic.geometry._html
                });
                dojo.byId(this._divId).appendChild(_chartDiv);
            }

            var showPt = this._map.toScreen(graphic.geometry._point);

            dojo.style(_chartDiv, {
                "left": (showPt.x + x) + "px",
                "top": (showPt.y + y) + "px",
                "position": "absolute",
                "width": w - 4 + "px",
                "height": h - 4 + "px",
                'margin': '2px'
            });
            graphic.geometry._lefttop = this._map.toMap({x: (showPt.x + x), y:(showPt.y + y)});
            graphic.geometry._path = graphic.geometry.hasOwnProperty("_path") ? graphic.geometry._path : this.FramePath;
            graphic.geometry._div = _chartDiv;
        },
        sortArray: function (numbers) {
            numbers.sort(function (a, b) {
                return a > b ? 1 : -1
            });
            return numbers;
        },

        currentImgX: 0,
        currentImgY: 0,
        //全局的位移
        xoff: 0,
        yoff: 0,
        currentEGrahic: null,
        isEdit: false,//默认关闭状态,测试打开
        lastPoint: null,
        createImgPoints: function (graphic) {

            this.currentEGrahic = graphic;
            this.NowFramePath = graphic.geometry._path;
            //console.log(this.NowFramePath);

            var point = this.currentEGrahic.geometry._point;
            var showPt = this._map.toScreen(point);

            var xoff = showPt.x;
            var yoff = showPt.y;

            //根据任意图形计算控制点序列位置
            var cs = this.getCPxy();

            for (var i in cs) {
                var pp = cs[i];
                var imgNode = dojo.byId("img," + i);//.removeChild(dojo.byId("img,"+));
                if (!imgNode) {
                    imgNode = html.create('img', {
                        id: "img," + i,
                        src: "images/point2.png",
                        style: "width:9px;height:9px;"
                    }, dojo.byId(this._divId));
                }

                dojo.style(imgNode, {
                    "left": (xoff + pp.x - 4.5) + "px",
                    "top": (yoff + pp.y - 4.5) + "px",
                    "position": "absolute"
                });

                var imgNodeMov = new dojo.dnd.Moveable(imgNode);
                dojo.connect(imgNodeMov, "onMoveStart", lang.hitch(this, function (mover) {
                    //this.currentImg = mover.node;
                    //判断这个点是什么点
                    var id = mover.node.id;

                    var cps = cs[id.split(',')[1]];
                    //var cx = -150;
                    //var cy = -150;
                    var cx = cps.x;
                    var cy = cps.y;

                    this.currentImgX = mover.marginBox.l - (cx);
                    this.currentImgY = mover.marginBox.t - (cy);

                    //获取0，0点的坐标
                    //获取全局偏移变量
                    this.xoff = this.currentImgX;
                    this.yoff = this.currentImgY;
                    this._map.disablePan();

                    //把其他的控制点隐藏
                    for (var i in cs) {
                        if (id.split(',')[1] == i) {
                            continue;
                        }
                        var imgdv = dojo.byId("img," + i);//.removeChild(dojo.byId("img,"+));
                        if (imgdv) {
                            dojo.byId(this._divId).removeChild(imgdv);
                        }
                    }
                }));
                dojo.connect(imgNodeMov, "onMoving", lang.hitch(this, function (mover, leftTop) {
                    var Gx = leftTop.l;
                    var Gy = leftTop.t;
                    var x = Gx + this._map.position.x - this.xoff;
                    var y = Gy + this._map.position.y - this.yoff;
                    //当前点的局部坐标有了
                    //要去更新其他点的坐标  /得到新的位置，更新数值
                    //var ptstr = this.AdjustFrame("footpoint",x,y);
                    var cname = mover.node.id.split(',')[1];

                    this.ApplyFramePath(this.NowFramePath);
                    var ptstr = this.AdjustFrame(cname, x, y);
                    var point = this._map.toScreen(this.currentEGrahic.geometry._point);

                    this.currentEGrahic.geometry = this.getNewPloy(ptstr, point, this.currentEGrahic);
                    this.currentEGrahic.setGeometry(this.currentEGrahic.geometry);

                    this.lastPoint = this._map.toMap({x: (Gx), y: (Gy)});
                }));
                dojo.connect(imgNodeMov, "onMoveStop", lang.hitch(this, function (mover) {
                    this._map.enablePan();
                    var cname = mover.node.id.split(',')[1];


                    if (cname == "footpoint") {
                        this.currentEGrahic.geometry._point = this.lastPoint;
                        this.ApplyFramePathNew();
                        this.NowFramePath = this.AdjustFrame(cname, -4.5, -4.5);
                        //this.add(new Graphic(this.lastPoint,new SimpleMarkerSymbol(),{}));
                    }
                    this.currentEGrahic.geometry._path = this.NowFramePath;

                    this.createImgPoints(this.currentEGrahic);
                }));
            }
        },
        getNewPloy: function (ptstr, point, graphic) {

            var clickPoint = this.DrawFrame(ptstr, graphic);
            var screenPtX = point.x - 1;
            var screenPt = point.y - 1;

            var geomgtry =  this._toPolygon(clickPoint, screenPtX, screenPt);
            geomgtry._point = graphic.geometry._point;
            geomgtry._lefttop = graphic.geometry._lefttop;
            geomgtry._path = graphic.geometry._path;
            geomgtry._html = graphic.geometry._html;
            geomgtry._div = graphic.geometry._div;
            geomgtry._id = graphic.geometry._id;
            return geomgtry;
        },
        deleteCps: function () {
            if (this.isEdit&&this.visible) {//编辑状态更新控制点
                var cps = ["leftuppoint", "rightuppoint", "rightdownpoint", "leftdownpoint", "footpoint"];
                for (var i = 0; i < cps.length; i++) {
                    var img = dojo.byId("img," + cps[i]);
                    if (img) {
                        dojo.byId(this._divId).removeChild(img);
                    }
                }
            }
        },
        getCPxy: function () {
            var pathstr = this.currentEGrahic.geometry._path;////形状路径

            var i;
            var j; //拐点位置
            var tmparr = pathstr.split(",");
            //除去标记字符 p  抽出h标记
            for (i = 0; i < tmparr.length; i++) {
                if (tmparr[i].toString().indexOf("p") > -1) {
                    j = i;
                    break;
                }
            }
            var tg1 = tmparr.slice(0, j);
            var tg2 = tmparr.slice(j + 6, tmparr.length);
            var tg3 = tmparr.slice(j + 2, j + 4);
            var tg = tg1.concat(tg2).concat(tg3);
            tmparr = tg;

            return {
                "leftuppoint": new MyPoint(Number(tmparr[0]), Number(tmparr[1])),
                "rightuppoint": new MyPoint(Number(tmparr[4]), Number(tmparr[5])),
                "rightdownpoint": new MyPoint(Number(tmparr[8]), Number(tmparr[9])),
                "leftdownpoint": new MyPoint(Number(tmparr[12]), Number(tmparr[13])),
                "footpoint": new MyPoint(Number(tmparr[16].toString().replace("h", "")), Number(tmparr[17].toString().replace("h", "")))

            };
        }
    });
});
