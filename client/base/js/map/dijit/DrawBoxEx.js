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

define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./template/DrawBoxEx.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/topic',
  'dojo/query',
      "dijit/Menu",
      "dijit/MenuItem",
      "dijit/MenuSeparator",
  'esri/layers/GraphicsLayer',
  'esri/graphic',
  //'esri/toolbars/draw',
  'esri/plot/DrawEx',
  'esri/plot/EditEx',
      "esri/plot/drawer/PlotGraphicUtil",
  'esri/symbols/jsonUtils'
],
function(declare, _WidgetBase, _TemplatedMixin,_WidgetsInTemplateMixin,
  template, lang, html, array, on,topic, query,
  Menu,
  MenuItem,
  MenuSeparator,
  GraphicsLayer, Graphic, Draw, Edit,PlotGraphicUtil,jsonUtils) {
  return declare([_WidgetBase, _TemplatedMixin,_WidgetsInTemplateMixin], {
    templateString:template,
    baseClass: 'base-map-dijit-DrawBoxEx',
    declaredClass: 'base.map.dijit.DrawBoxEx',
    nls:null,
    types:null,//['point','polyline','polygon','text']
    pointSymbol:null,
    polylineSymbol:null,
    polygonSymbol:null,
    textSymbol:null,
    map:null,
    drawLayer:null,
    drawLayerId:null,
    drawToolBar:null,
    editToolbar:null,
    showClear:false,
    keepOneGraphic:false,
    editEnable:true,
    selected:null,
    isSymbolEdit:null,
    //options:
    //types
    //showClear
    //keepOneGraphic
    //map
    //pointSymbol
    //polylineSymbol
    //polygonSymbol
    //textSymbol

    //public methods:
    //clear
    //deactivate


    postMixInProperties:function(){
    },

    postCreate:function(){
      this.inherited(arguments);
      var layerArgs = {};
      if(this.drawLayerId){
        layerArgs.id = this.drawLayerId;
      }
      this.drawLayer = new GraphicsLayer(layerArgs);
      this._initDefaultSymbols();
      this._initTypes();
      var items = query('.draw-item',this.domNode);
      this.own(items.on('click',lang.hitch(this,this._onItemClick)));
      this.own(on(this.btnClear,'click',lang.hitch(this,this.clear)));
      this.own(on(this.btnExport,'click',lang.hitch(this,this.export)));
      if(this.map){
        this.setMap(this.map);
      }
      var display = this.showClear === true ? 'block' : 'none';
      html.setStyle(this.btnClear,'display',display);
      var display = this.showExport === true ? 'block' : 'none';
      html.setStyle(this.btnExport,'display',display);

    },

    disableWebMapPopup:function(){
      if(this.map && this.map.webMapResponse){
        var handler = this.map.webMapResponse.clickEventHandle;
        if(handler){
          handler.remove();
          this.map.webMapResponse.clickEventHandle = null;
        }
      }
    },

    enableWebMapPopup:function(){
      if(this.map && this.map.webMapResponse){
        var handler = this.map.webMapResponse.clickEventHandle;
        var listener = this.map.webMapResponse.clickEventListener;
        if(listener && !handler){
          this.map.webMapResponse.clickEventHandle=on(this.map,
                                                      'click',
                                                      lang.hitch(this.map,listener));
        }
      }
    },

    destroy:function(){
      if(this.drawToolBar){
        this.drawToolBar.deactivate();
      }
      if(this.editToolbar){
        this.editToolbar.deactivate();
      }

      if(this.drawLayer){
        if(this.map){
          this.map.removeLayer(this.drawLayer);
        }
      }

      this.drawToolBar = null;
      this.editToolbar = null;
      this.map = null;
      this.drawLayer = null;
      this.inherited(arguments);
    },

    setMap:function(map){
      if(map){
        this.map = map;
        this.map.addLayer(this.drawLayer);
        this.drawToolBar = new Draw(this.map);
        this.drawToolBar.setMarkerSymbol(this.pointSymbol);
        this.drawToolBar.setLineSymbol(this.polylineSymbol);
        this.drawToolBar.setFillSymbol(this.polygonSymbol);
        this.own(on(this.drawToolBar,'draw-end',lang.hitch(this,this._onDrawEnd)));

        //编辑的
        this.setEditEnable(this.editEnable);
      }
    },
    setEditEnable:function(enable){
      this.editEnable = enable;
      if(this.editEnable){
        this.editToolbar = new Edit(this.map, null, this.drawToolBar);

        this.own(on(this.map,'click',lang.hitch(this,function(evt){
          this.editToolbar.deactivate();
        })));
        this.createGraphicsMenu();
      }else{
        if(this.editToolbar){
          this.editToolbar.deactivate();
          this.editToolbar = null;
        }
      }

    },
    createGraphicsMenu:function(){
      var ctxMenuForGraphics = new Menu({});
      ctxMenuForGraphics.addChild(new MenuItem({
          label: "编辑节点",
          onClick: lang.hitch(this,function(){
              if (this.selected.geometry.type !== "point") {
                  this.editToolbar.activate(Edit.EDIT_VERTICES, this.selected);
              }
              else {
                  alert("Not implemented");
              }
          })
      }));

      ctxMenuForGraphics.addChild(new MenuItem({
        label: "编辑控制点",
        onClick:lang.hitch(this,function(){
          this.editToolbar.activate(Edit.MOVE | Edit.ROTATE | Edit.SCALE, this.selected);
          this.isSymbolEdit = false;
        })

      }));

      ctxMenuForGraphics.addChild(new MenuItem({
        label: "编辑样式",
        onClick:lang.hitch(this,function(){
          //this.editToolbar.activate(Edit.MOVE | Edit.ROTATE | Edit.SCALE, this.selected);

          var geometry = this.selected.geometry;
          var symbol = null;
          //点线面，激发不同的东西

          this.isSymbolEdit = true;
          topic.publish("change/graphic/symbol",{geometry:geometry,symbol:lang.hitch(this.selected.symbol)});

        })

      }));


      ctxMenuForGraphics.addChild(new MenuSeparator());
      ctxMenuForGraphics.addChild(new MenuItem({
        label: "删除",
        onClick: lang.hitch(this,function(){
          this.drawLayer.remove(this.selected);
          this.selected = null;
          this.isSymbolEdit = false;
        })
      }));
      ctxMenuForGraphics.addChild(new MenuSeparator());
      ctxMenuForGraphics.addChild(new MenuItem({
        label: "取消",
        onClick: lang.hitch(this,function(){
          this.selected = null;
          this.isSymbolEdit = false;
        })
      }));

      ctxMenuForGraphics.startup();

      //右键
      this.drawLayer.on("mouse-down",lang.hitch(this, function (evt) {
        this.selected = evt.graphic;
        ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
      }));

      this.drawLayer.on("mouse-over",lang.hitch(this, function (evt) {
        this.map.setMapCursor("pointer");
      }));

      this.drawLayer.on("mouse-out",lang.hitch(this, function (evt) {
        this.map.setMapCursor("default");
      }));
    },

    //清除选中
    clearSelect:function(){
      this.selected = null;
      this.isSymbolEdit = false;
    },
    updateSelectedSymbol:function(){
      if(this.selected&&this.isSymbolEdit){
        var symbol;
        switch (this.selected.geometry.type) {
          case "point":
          case "pointtext":
          case "multipoint":
            if(this.selected.geometry.drawExtendType=="pointtext"){
              symbol = this.textSymbol;
            }else{
              symbol = this.pointSymbol;
            }

            break;
          case "polyline":
            symbol = this.polylineSymbol;
            break;
          default:
            symbol = this.polygonSymbol;
            break;
        }
        this.selected.setSymbol(symbol);
      }
    },

    setPointSymbol:function(symbol){
      this.pointSymbol = symbol;
      this.drawToolBar.setMarkerSymbol(this.pointSymbol);
    },

    setLineSymbol:function(symbol){
      this.polylineSymbol = symbol;
      this.drawToolBar.setLineSymbol(symbol);
    },

    setPolygonSymbol:function(symbol){
      this.polygonSymbol = symbol;
      this.drawToolBar.setFillSymbol(symbol);
    },

    setTextSymbol:function(symbol){
      this.textSymbol = symbol;
    },

    clear:function(){
      this.drawLayer.clear();
      this.onClear();
    },
    export:function(){
      PlotGraphicUtil.outPutPlotGraphicLayer2Txt(this.drawLayer);
    },
    exportStr:function(){
      return  PlotGraphicUtil.outPutPlotGraphicLayer2String(this.drawLayer);
    },
    addPlotByTxt:function(file){
      PlotGraphicUtil.getPlotLayerFromTxt(file,this.drawLayer);
    },
    addPlotByStr:function(str){
      PlotGraphicUtil.getPlotLayerFromJsonStr(str,this.drawLayer);
    },
    setSelectEditable:function(){
      var graphics = this.drawLayer.graphics;
      if(graphics&&graphics.length>0){
        this.selected = graphics[0];
        this.editToolbar.activate(Edit.EDIT_VERTICES, this.selected);
        this.isSymbolEdit = true;
        this.map.setExtent(this.selected.geometry.getExtent().expand(2.0));
        return this.selected;
      }

    },
    deactivate:function(){
      this.enableWebMapPopup();
      if(this.drawToolBar){
        this.drawToolBar.deactivate();
      }
      query('.draw-item',this.domNode).removeClass('selected');
    },

    onIconSelected:function(target,geotype,commontype){/*jshint unused: false*/},

    onDrawEnd:function(graphic,geotype,commontype){/*jshint unused: false*/},

    onClear:function(){},

    addGraphic:function(g){
      if(this.keepOneGraphic){
        this.drawLayer.clear();
      }
      this.drawLayer.add(g);
    },

    removeGraphic:function(g){
      this.drawLayer.remove(g);
    },

    _initDefaultSymbols:function(){
      var pointSys = {
        "style": "esriSMSCircle",
        "color": [0, 0, 128, 128],
        "name": "Circle",
        "outline": {
          "color": [0, 0, 128, 255],
          "width": 1
        },
        "type": "esriSMS",
        "size": 18
      };
      var lineSys = {
        "style": "esriSLSSolid",
        "color": [79, 129, 189, 255],
        "width": 3,
        "name": "Blue 1",
        "type": "esriSLS"
      };
      var polygonSys = {
        "style": "esriSFSSolid",
        "color": [79, 129, 189, 128],
        "type": "esriSFS",
        "outline": {
          "style": "esriSLSSolid",
          "color": [54, 93, 141, 255],
          "width": 1.5,
          "type": "esriSLS"
        }
      };
      if(!this.pointSymbol){
        this.pointSymbol = jsonUtils.fromJson(pointSys);
      }
      if(!this.polylineSymbol){
        this.polylineSymbol = jsonUtils.fromJson(lineSys);
      }
      if(!this.polygonSymbol){
        this.polygonSymbol = jsonUtils.fromJson(polygonSys);
      }
    },

    _initTypes:function(){
      if(!(this.types instanceof Array)){
        this.types = ['point','polyline','polygon'];
      }
      var items = query('.draw-item',this.domNode);
      items.style('display','none');
      array.forEach(items,lang.hitch(this,function(item){
        var commonType = item.getAttribute('data-commontype');
        var display = array.indexOf(this.types,commonType) >= 0 ? 'block' : 'none';
        html.setStyle(item,'display',display);
      }));
    },

    _onItemClick:function(event){
      var target = event.target||event.srcElement;
      var items = query('.draw-item',this.domNode);
      items.removeClass('selected');
      html.addClass(target,'selected');
      var geotype = target.getAttribute('data-geotype');
      var commontype = target.getAttribute('data-commontype');
      var tool = Draw[geotype];
      this.disableWebMapPopup();
      this.drawToolBar.activate(tool);
      this.onIconSelected(target,geotype,commontype);
    },

    _onDrawEnd:function(event){
      var selectedItem = query('.draw-item.selected',this.domNode)[0];
      var geotype = selectedItem.getAttribute('data-geotype');
      var commontype = selectedItem.getAttribute('data-commontype');
      var geometry = event.geometry;
      var type = geometry.type;
      var symbol = null;
      if (type === "point" || type === "multipoint") {
        if(html.hasClass(this.textIcon,'selected')){
          symbol = this.textSymbol;
          geometry.drawExtendType = "pointtext";
        }
        else{
          symbol = this.pointSymbol;
        }
      } else if (type === "line" || type === "polyline") {
        symbol = this.polylineSymbol;
      } else {
        symbol = this.polygonSymbol;
      }
      var g = new Graphic(geometry,symbol,null,null);
      if(this.keepOneGraphic){
        this.drawLayer.clear();
      }
      this.drawLayer.add(g);
      this.deactivate();
      this.onDrawEnd(g,geotype,commontype);
    }

  });
});