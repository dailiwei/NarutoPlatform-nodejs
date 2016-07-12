///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-01 15:05
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/html',
  "dojo/dom-construct",
  "dojo/on",
  "rdijit/form/Search",
        "dojo/_base/fx"
],
function(
		declare, 
		_WidgetBase, 
		lang,
		html,
		domConstruct,
		on,
		Search,
        fx) {
  /**
   * 用来显示AdcdListBox
   *
   * @alias AdcdListBox
   * @constructor
   * @param {Object} [kwArgs] Object with the following properties:
   * @demo {@link ./base/rdijit/test/testAdcdListBox.html}
   */
  return declare(_WidgetBase, {
//    'baseClass': 'rdijit-AdcdListBox',
    declaredClass: 'rdijit.AdcdListBox', 
    
    mainContainer:null,
    list:null,
    show:false,
    firstLoad:true,
    constructor:function(args){
    	  this.inherited(arguments);
//    	  args = {container:"main"};
    	  this.mainContainer = args.container;
    	  this.list = [
    	               {label:"安徽省","value":000000000,"seleted":true},
    	               {label:"吉林市","value":340000001},
    	               {label:"长春市","value":340000002},
    	               {label:"四平市","value":340000003},
    	               {label:"临江市","value":340000004},
    	               {label:"长白山","value":340000005},
    	               {label:"xxxxxx","value":340000006},
    	               {label:"yyyyyy","value":340000007},
    	               {label:"zzzzzz","value":340000008},
                      {label:"长春市","value":340000002},
                      {label:"四平市","value":340000003},
                      {label:"临江市","value":340000004},
                      {label:"长白山","value":340000005},
                      {label:"xxxxxx","value":340000006},
                      {label:"yyyyyy","value":340000007}
    	               ];
    	  this.show = false;//默认是不可见的

        this.firstLoad = true;
    },
    postCreate: function(){
//    	var search1 = new Search({
//    		id:"xx76543xxxx",//dojox.uuid.generateRandomUuid(),
//    		placeholder: '请输入关键字',
//    		style: "width:200px"
//    	},this.domNode);
//    	search1.onSearch = function(text){
//    		alert(text);
//    	};
//    	search1.startup();

        this.labelNode = html.create('div', {
          'class': 'rdijit-form-input',
          style:'width:150px;height:25px; text-align: center; cursor: pointer;',
          'innerHTML': "全部"
        }, this.domNode);
      this.own(
      on(this.labelNode, 'click', lang.hitch(this, function(){
        if(this.show){
            this.showShengList(false);
        }else{
            this.showShengList(true);
        }
      }))
    );
    },
      showShengList:function(visible){
          if( !this.listDiv ){
              var innerHTML = '<div style="padding-left:1px;padding-right:1px ">';
              for(var i =0;i<this.list.length;i++){
                  var item = this.list[i];
                  innerHTML+='<div class="rdijit-AdcdListBox-item" id="'+item.label+','+item.value+'">'+item.label+'</div>';
              }
              innerHTML +='</div>';

              var height = this.list.length*19;//根据个数计算高度
              this.listDiv = html.create('div', {
                  'style':'overflow:auto;position: absolute;z-index:1000;float:left;width:160px;height:'+height+'px;  box-shadow: 0 0 1px #6b6a67; background-color: rgba(247, 249, 250, 0.74902);',
                  innerHTML:innerHTML
              },  this.mainContainer);

              var left =  Number(this.domNode.style.left.replace("px", ""));
              var top =   Number(this.domNode.style.top.replace("px", ""));
              if(top>210){
                  dojo.style( this.listDiv , {
                      "left":(left +80) + "px",
                      "top": (top -165) + "px"
                  });
              }else{
                  dojo.style( this.listDiv , {
                      "left":(left ) + "px",
                      "top": (top +40) + "px"
                  });
              }

              this.own(on(this.listDiv, 'click', lang.hitch(this, function (evt) {
                  //派发事件了，参数是任意的
                  var item = evt.target;
                  if(item.id&&item.id.split(",").length>0){
                      var ary = item.id.split(",");
                      alert(ary[0]);
                  }
              })));

              this.own(on(this.listDiv, 'mouseover', lang.hitch(this, function (evt) {
                  //派发事件了，参数是任意的
                  var item = evt.target;
                  if(item.id&&item.id.split(",").length>0){
                      //html.addClass(item, 'rdijit-AdcdListBox-item-selected');
                      var ary = item.id.split(",");
                      this.createShiList();
                  }
              })));

              this.own(on(this.listDiv, 'mouseout', lang.hitch(this, function (evt) {
                  //派发事件了，参数是任意的
//        	 domConstruct.destroy(this.listDivShi);
                  var item = evt.target;
                  //html.removeClass(item, 'rdijit-AdcdListBox-item-selected');
              })));
          }

          if(visible){
              this.showEffect( this.listDiv);
              this.show = true;
          }else{
              this.hideEffect( this.listDiv);
              this.show = false;
          }
      },

    createShiList:function(){
    	var innerHTML = '<div style="padding-left:8px;padding-right:8px ">';
        for(var i =0;i<this.list.length;i++){
            var item = this.list[i];
            innerHTML+='<div class="rdijit-AdcdListBox-item" id="'+item.label+','+item.value+'">'+item.label+'</div>';
        }

        innerHTML +='</div>';

        this.listDivShi = html.create('div', {
            'style':'overflow:auto;position: absolute;z-index:1000;float:left;width:200px;height:200px;  box-shadow: 0 0 1px #6b6a67; background-color: rgba(247, 249, 250, 0.74902);',
            innerHTML:innerHTML
        },  this.mainContainer);

        var left =  Number(this.domNode.style.left.replace("px", ""));
        var top =   Number(this.domNode.style.top.replace("px", ""));
        if(top>210){
            dojo.style( this.listDivShi , {
                "left":(left +80) + "px",
                "top": (top -165) + "px"
            });
        }else{
            dojo.style( this.listDivShi , {
                "left":(left +205) + "px",
                "top": (top +40) + "px"
            });
        }


    },

      showEffect:function(node){
          dojo.style(node, {
              "display":"block"
          });
          fx.animateProperty(
              {
                  node: node,
                  properties: {
                      opacity: {start: 0, end: 1}
                  },
                  duration: 500,
                  onEnd: lang.hitch(this,function(){

                  })
              }).play();
      },
      hideEffect:function(node){
          fx.animateProperty(
              {
                  node: node,
                  properties: {
                      opacity: {start: 1, end: 0}
                  },
                  duration: 500
              }).play();
          dojo.style(node, {
              "display":"none"
          });
      },

    setValue: function(value){
      if(value === true){
        this.check();
      }else{
        this.uncheck();
      }
    },

    getValue: function(){
      return this.checked;
    },

    setStatus: function(status){
      this.status = status;
      if(!this.labelNode){
        return;
      }
      if(status){
        html.setStyle(this.labelNode, "color", "#000000");
      }else{
        html.setStyle(this.labelNode, "color", "#818181");
      }
    },

    check: function(){
      this.checked = true;
      html.addClass(this.checkNode, 'checked');
      this.onStateChange();
    },

    uncheck: function(notEvent){
      this.checked = false;
      html.removeClass(this.checkNode, 'checked');
      if(!notEvent){
        this.onStateChange();
      }
    },

    onStateChange: function(){
      if(this.onChange && lang.isFunction(this.onChange)){
        this.onChange(this.checked,this.label);
      }
    }
  });
});