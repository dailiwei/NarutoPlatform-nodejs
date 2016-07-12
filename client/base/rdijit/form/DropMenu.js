///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 00:25
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/Evented',
  '../utils'
],
function(declare, _WidgetBase, lang, array, html, on, Evented, utils) {
  return declare([_WidgetBase, Evented], {
    // summary: 
    //    the params format:
    //    items: [{
    //      key:
    //      label: <as innerHTML set to UI>
    //    }]
    //    box: String|DomNode. 
    //      if not set, use the menu's parent node to calculate the menu's position.
    'baseClass': 'rdijit-form-dropmenu',
    declaredClass: 'rdijit.form.DropMenu',


    constructor: function(){
      this.state = 'closed';
    },
    postCreate: function(){
      this.btnNode = html.create('div', {
        'class': 'rdijit-form-icon-btn'
      }, this.domNode);

      this.own(on(this.btnNode, 'click', lang.hitch(this, this._onBtnClick)));
      if(!this.box){
        this.box = this.domNode.parentNode;
      }
      this.own(on(this.box, 'click', lang.hitch(this, function(){
        if(this.dropMenuNode){
          this.closeDropMenu();
        }
      })));
    },

    _onBtnClick: function(evt){
      evt.stopPropagation();
      if(!this.dropMenuNode){
        this._createDropMenuNode();
      }
      if(this.state === 'closed'){
        this.openDropMenu();
      }else{
        this.closeDropMenu();
      }
    },

    _createDropMenuNode: function(){
      this.dropMenuNode = html.create('div', {
        'class': 'drop-menu',
        style: {
          display: 'none'
        }
      }, this.domNode);

      if(!this.items){
        this.items = [];
      }

      array.forEach(this.items, function(item){
        var node;
        if(item.key){
          node = html.create('div', {
            'class': 'menu-item',
            'itemId': item.key,
            innerHTML: item.label
          }, this.dropMenuNode);

          this.own(on(node, 'click', lang.hitch(this, function(){
            this.selectItem(item);
          })));
        }else{
          html.create('hr', {
            'class': 'menu-item-line'
          }, this.dropMenuNode);
        }
      }, this);
    },

    _getDropMenuPosition: function(){
      var outBox = html.getContentBox(this.box);
      var thisBox = html.getMarginBox(this.domNode);
      var btnBox = html.getMarginBox(this.btnNode);
      var menuBox = html.getMarginBox(this.dropMenuNode);
      var pos = {}, max, l, t, b, r;
      //display at the bottom by default, if the space is not enough,
      //get the maximum space of the left/top/bottom/right
      pos.l = thisBox.l;
      pos.t = thisBox.t + btnBox.h;
      if(pos.t + menuBox.h > outBox.h){
        t = thisBox.t;
        b = outBox.h - thisBox.t - btnBox.h;
        max = Math.max(t, b);
        if(max === t){
          //put on top of the btn
          pos.t =  0 - menuBox.h;
        }
      }
      if(pos.l + menuBox.w > outBox.w){
        l = thisBox.l;
        r = outBox.w - thisBox.l - btnBox.w;
        max = Math.max(l, r);
        if(max === l){
          pos.l = '';
          pos.r = 0;
        }
      }
      pos.left = pos.l;
      pos.top = pos.t;
      pos.right = pos.r;
      return pos;
    },

    selectItem: function(item){
      this.closeDropMenu();
      this.emit('onMenuClick', item);
    },

    openDropMenu: function(){
      this.state = 'opened';
      html.setStyle(this.dropMenuNode, 'display', '');

      html.setStyle(this.dropMenuNode, utils.getPositionStyle(this._getDropMenuPosition()));

      this.emit('onOpenMenu');
    },

    closeDropMenu: function(){
      this.state = 'closed';
      html.setStyle(this.dropMenuNode, 'display', 'none');
      this.emit('onCloseMenu');
    }

  });
});