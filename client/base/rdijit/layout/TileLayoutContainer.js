///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-10 14:00
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/dom-construct',
  'dojo/mouse',
  'dojo/query',
  'dijit/_WidgetBase'
],
function (declare, lang, html, on, domConstruct, mouse, query, _WidgetBase) {
  
  return declare([_WidgetBase], {
    baseClass: 'rdijit-tile-container',
    declaredClass: 'rdijit.layout.TileLayoutContainer',
    
    /**
    * Layout the items depends the strategy: fixWidth, breakWidth, fixCols
    * fixWidth:
    *    the item width/height is px, if the container is not width enough, the item will
    *    flow to the next line.
    * breakWidth:
    *    the item width/height is an array, like this:
    *       [{screenWidth: 600, width: 100, height: 200}],
    *    the order is by screen width
    * fixCols:
    *    set the max cols, and the container will resize the item's width to fit the container.
    *
    * options:
    *   stragety: fixWidth, breakWidth, fixCols
    *   itemSize: [] or {}
    *       each object is:
    *           screenWidth: 600
    *           width: 100
    *           height: 200 or 10%
    *   maxCols:
    *   items: [ResizableNode]
    **/
    constructor: function(){
      this.items = [];
      this.margin = 10;
    },

    startup: function(){
      this.inherited(arguments);
      this.items.forEach(lang.hitch(this, function(item){
        this._placeItem(item);
      }));
      this.resize();
    },

    _placeItem: function(item){
      if(item.domNode){
        html.place(item.domNode, this.domNode);
      }else{
        html.place(item, this.domNode);
      }
    },

    addItem: function(item){
      this.items.push(item);
      this._placeItem(item);
      this.resize();
    },

    addItems: function(items){
      this.items = this.items.concat(items);
      this.items.forEach(lang.hitch(this, function(item){
        this._placeItem(item);
      }));
      this.resize();
    },

    removeItem: function(itemLabel){
      var i;
      for(i = 0; i < this.items.length; i++){
        if(this.items[i].label === itemLabel){
          if(this.items[i].domNode){
            this.items[i].destroy();
          }else{
            html.destroy(this.items[i]);
          }
          this.items.splice(i, 1);
          this.resize();
          return;
        }
      }
    },

    empty: function(){
      var i;
      for(i = 0; i < this.items.length; i++){
        if(this.items[i].domNode){
          this.items[i].destroy();
        }else{
          html.destroy(this.items[i]);
        }
      }
      this.items = [];
    },

    resize: function(){
      var box, itemSize, cpr;
      box = html.getMarginBox(this.domNode);

      itemSize = this.getItemSize(box);
      cpr = 4;// Math.floor((box.w+this.margin  ) / (itemSize.width+this.margin ));
      
      this.items.forEach(lang.hitch(this, function(item, i){
        this.setItemPosition(item, i, itemSize, cpr);
      }));
    },

    getItemSize: function(box){
      var size = {}, i;
      if(this.strategy === 'fixWidth'){
        size.width = this.itemSize.width;
        size.height = this.itemSize.height;
      }else if(this.strategy === 'breakWidth'){
        for(i = 0; i < this.itemSize.length; i++){
          if(box.w <= this.itemSize[i].screenWidth){
            size.width = this.itemSize[i].width;
            size.height = this.itemSize[i].height;
            break;
          }
        }
      }else if(this.strategy === 'fixCols'){
        size.width =  (box.w - this.margin * (this.maxCols - 1)) / this.maxCols  ;
        if(typeof this.itemSize.height === 'number'){
          size.height = this.itemSize.height;
        }else{
          size.height = (size.width) *
          parseFloat(this.itemSize.height.substring(0, this.itemSize.height.length - 1)) / 100;
        }
      }
      return size;
    },

    setItemPosition: function(item, i, itemSize, cpr){
      i++;
      var col = i % cpr;
      var row = Math.ceil(i / cpr);

      if(col === 0){
        col = 4;
      }
      var itemStyle = {
        position: 'absolute',
        left: (((this.margin + itemSize.width) * (col - 1))+5) + 'px',
        top: (((this.margin + itemSize.height) * (row - 1))+5) + 'px'
      };
      if (itemSize.width >= 0){
        itemStyle.width = itemSize.width + 'px';
      }
      if (itemSize.height >= 0){
        itemStyle.height = itemSize.height + 'px';
      }
      html.setStyle(item.domNode? item.domNode: item, itemStyle);
    }

  });
});