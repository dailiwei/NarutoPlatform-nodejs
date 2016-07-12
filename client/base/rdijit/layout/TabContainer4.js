///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 16：25
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/query',
  'dojo/NodeList-manipulate',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  './ViewStack',
  '../utils',
  "dojo/dom-construct"
],
function(declare,
         lang,
         array,
         html,
         on,
         query,
         nlm,
         _WidgetBase,
         _TemplatedMixin,
         ViewStack,
         utils,
         domConstruct
){
  return declare([_WidgetBase, _TemplatedMixin], {


    'baseClass': 'rdijit-layout-tab3',
    declaredClass: 'rdijit.layout.TabContainer3',
    way:"left",
    templateString: '<div style="width: 100%;height:100%">' +
        '<div style="width:100%;height:50px;background-color: #e5e9eb;text-align: center">' +
    '<div  data-dojo-attach-point="controlNode"></div>' +
    '</div>'+


    '<div style=" height:100%;padding:0px;width:100%;float:left;background-color: white;box-shadow: 0 0 3px #888;" data-dojo-attach-point="containerNode"></div>' +
      '</div>',
    constructor: function(){
    	 this.inherited(arguments);
    	//this.id = dojox.uuid.generateRandomUuid();
    },
    postCreate: function(){
      this.inherited(arguments);
      if(this.tabs.length === 0){
        return;
      }
      this.controlNodes = [];
      this.viewStack = new ViewStack(null, this.containerNode);
      var width = 1/this.tabs.length * 100 -20;
      if(this.isNested){
        html.addClass(this.domNode, 'nested');
      }
      array.forEach(this.tabs, function(tabConfig){
        this._createTab(tabConfig, width);
      }, this);
    },

    startup: function() {
      this.inherited(arguments);
      if(this.selected){
        this.selectTab(this.selected);
      }else if(this.tabs.length > 0){
        this.selectTab(this.tabs[0].title);
      }
      utils.setVerticalCenter(this.domNode);
    },

    _createTab: function(tabConfig, width){
      var ctrlNode;
      //ctrlNode = html.create('div', {
      //  innerHTML: tabConfig.title,
      //  'class': 'tabItem',
      //  style: {
      //    width: '100%',
      //    height:'70px'
      //  },
      //  label: tabConfig.title
      //}, this.controlNode);



      ctrlNode = html.create("div",{
        'class': 'iconItem2',
        style:'width:60px;height:45px;padding-top: 5px;padding-bottom: 0px;'
      });

      var imgNode= html.create('img', {
          src: APP_ROOT+"base/images/taskbar/dark/cude.png" ,
          style: {
          width: '24px', height: '24px'
        }
      }, ctrlNode);

      var label = html.create('div', {
        'class': 'content-title2',
        innerHTML: tabConfig.title
      }, ctrlNode);


      domConstruct.place(ctrlNode, this.controlNode);


      if(tabConfig.content.domNode){
        this.viewStack.viewType = 'dijit';
      }else{
        this.viewStack.viewType = 'dom';
      }
      tabConfig.content.label = tabConfig.title;
      this.viewStack.addView(tabConfig.content);
      this.own(on(ctrlNode, 'click', lang.hitch(this, this.onSelect, tabConfig.title)));
      ctrlNode.label = tabConfig.title;
      this.controlNodes.push(ctrlNode);
    },

    onSelect: function(title){
      this.selectTab(title);
    },

    selectTab: function(title){
      this._selectControl(title);
      this.viewStack.switchView(title);
    //  this.emit('tabChanged', title);
    },

    _selectControl: function(title){
      array.forEach(this.controlNodes, function(ctrlNode) {
        html.removeClass(ctrlNode, 'rdijit-state-selected4');
        if(ctrlNode.label === title){
          html.addClass(ctrlNode, 'rdijit-state-selected4');
        }
      });
    },
    addChild:function(child){

      this.tabs.push(child);
    }

  });
});