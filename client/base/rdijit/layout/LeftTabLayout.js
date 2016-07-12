///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-11 14：44
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
  './ViewStack2',
  '../utils',
  "dojo/dom-construct",
      "base/Library",
      "dojo/Deferred"
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
         domConstruct,
         Library,
         Deferred
){
  return declare([_WidgetBase, _TemplatedMixin], {


    'baseClass': 'rdijit-layout-tab3',
    declaredClass: 'rdijit.layout.TabContainer3',
    way:"left",
    templateString: '<div style="width: 100%;height:100%">' +
    '<div style="float:left;width:60px;height:100%;background-color: #dbdfe5" data-dojo-attach-point="controlNode"></div>' +

    '<div style="overflow-x:auto;overflow-y:auto;height:100%;margin-left:60px;padding:10px;background-color: #edf1f5;box-shadow: 0 0 3px #888;" data-dojo-attach-point="containerNode"></div>' +
      '</div>',
    _library: null,
    _initTabAuto:true,//一次性全加载展示
      _currentWidget:null,
    constructor: function(args){
      declare.safeMixin(this, args);

      this._library = new Library();

      if(this.parameters.panels){
          this.tabs =  this.parameters.panels;
      }else if(this.parameters.parameters.panels){
          this.tabs = this.parameters.parameters.panels;
      }else if(this.parameters.parameters.parameters.panels){
          this.tabs = this.parameters.parameters.parameters.panels;
      }

        this.tabList = [];
    },

    postCreate: function(){
      this.inherited(arguments);
      if(this.tabs.length === 0){
        return;
      }
      this.controlNodes = [];
      //两种方式，上来挨个初始化，或者点击在初始化
      this.viewStack = new ViewStack(null, this.containerNode);
      var width = 1/this.tabs.length * 100 -20;
      if(this.isNested){
        html.addClass(this.domNode, 'nested');
      }

      array.forEach(this.tabs, function(tabConfig){
        this._createTab(tabConfig, width);
      }, this);


    },
      tabList:null,
    getWidgets:function(widget){
      var deffer = new Deferred();
      var widgetReadyArray = [];
      var widgetDefArray = [];
      var appwidgets =  window.appwidgets;
      for(var item in appwidgets){ //all for current page
        if( appwidgets[item].widget_id ==widget.widget_id){

            widget.moduleName = appwidgets[item].module.moduleName;
            widget.pathName = appwidgets[item].module.pathName;
            widget.pathLocation = appwidgets[item].module.pathLocation;
            break;
        }
      }

      var widgetConfig= lang.clone(widget);

      //去加载去
      this._library.loadWidget(widget.pathName, widget.pathLocation, widget.moduleName).then(lang.hitch(this, function(WidgetModule){

            var widget = new WidgetModule({parameters:widgetConfig});
            widget.domNode.label = widgetConfig.parameters.i18nLabel;
              this.tabList.push({"label": widgetConfig.parameters.i18nLabel,"widget":widget});
            this.viewStack.addView(widget.domNode);//向面板添加
            if(widget.startup){
              widget.startup();
            }
            if(widget.resize){
              widget.resize();
            }

            deffer.resolve(widget);
          }),
          lang.hitch(this, function(error){
            console.log(error);
          })
      );

      return deffer;
    },

    startup: function() {
      this.inherited(arguments);

      //把那几个widget加载过来创建了，然后添加
      this.getWidgets(this.tabs[0]).then(lang.hitch(this,function(widget){
        if(this.selected){
          this.selectTab(this.selected);
        }else if(this.tabs.length > 0){
          this.selectTab(this.tabs[0].parameters.i18nLabel);
        }
        utils.setVerticalCenter(this.domNode);
      }));

    },

    _createTab: function(tabConfig, width){
      var ctrlNode;
      ctrlNode = html.create("div",{
        'class': 'iconItem2'
      });
      var imgNode= html.create('img', {
          src: tabConfig.parameters.darkIcon ,
          style: {
          width: '24px', height: '24px'
        }
      }, ctrlNode);

      var label = html.create('div', {
        'class': 'content-title2',
        innerHTML:tabConfig.parameters.i18nLabel
      }, ctrlNode);

      domConstruct.place(ctrlNode, this.controlNode);


      this.viewStack.viewType = 'dom';
      //this.viewStack.addView(tabConfig.content);//向面板添加
      this.own(on(ctrlNode, 'click', lang.hitch(this, this.onSelect, tabConfig.parameters.i18nLabel)));
      ctrlNode.label = tabConfig.parameters.i18nLabel;
      this.controlNodes.push(ctrlNode);
    },

    onSelect: function(title){
      this.selectTab(title);
    },

    selectTab: function(title){
      this._selectControl(title);

    },

    _selectControl: function(title){
        var _widget;
      array.forEach(this.controlNodes,lang.hitch(this,function(ctrlNode) {
        html.removeClass(ctrlNode, 'rdijit-state-selected3');

          for(var j=0;j<this.tabs.length;j++){
             query('img',ctrlNode)[0].src = this.tabs[j].parameters.darkIcon;

          }

        if(ctrlNode.label === title){
          html.addClass(ctrlNode, 'rdijit-state-selected3');
            for(var j=0;j<this.tabs.length;j++){
                if(this.tabs[j].parameters.i18nLabel==title){
                    query('img',ctrlNode)[0].src = this.tabs[j].parameters.selectedIcon;
                    break;
                }
            }
            //判断初始过没
            var isHas = false;
            for(var i=0;i<this.tabList.length;i++) {
                if(this.tabList[i].label == title){
                    isHas = true;
                    _widget = this.tabList[i].widget;
                }
            }

            if(!isHas){
                //加载
                var k ;
                for(var j=0;j<this.tabs.length;j++){
                    if(this.tabs[j].parameters.i18nLabel==title){
                        k = j;
                        break;
                    }
                }

                this.getWidgets(this.tabs[k]).then(lang.hitch(this,function(widget){
                    if(this._currentWidget&&this._currentWidget.deactivate){
                        this._currentWidget.deactivate();
                    }
                    this._currentWidget = widget;
                    if(widget.activate){
                        widget.activate();
                    }
                    this.viewStack.switchView(title);
                }));

                return;
            }
        }
      }));


        if(this._currentWidget&&this._currentWidget.deactivate){
            this._currentWidget.deactivate();
        }
        this._currentWidget = _widget;
        if(_widget.activate){
            _widget.activate();
        }
      this.viewStack.switchView(title);
    },
    addChild:function(child){
      this.tabs.push(child);
    },
      activate:function(){
          if( this._currentWidget){
              this._currentWidget.activate();
          }
      },
      deactivate:function(){
          if( this._currentWidget){
              this._currentWidget.deactivate();
          }
      }

  });
});