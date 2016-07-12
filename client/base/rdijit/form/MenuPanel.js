///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-20 17:49
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/string',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin'
],
function(declare, lang, html, array, on, string, _WidgetBase, _TemplatedMixin) {
  /**
   * 用来显示CheckBox
   *
   * @alias CheckBox
   * @constructor
   * @param {Object} [kwArgs] Object with the following properties:
   * @demo {@link ./base/rdijit/test/testCheckBox.html}
   */
  return declare([_WidgetBase,_TemplatedMixin], {
    'baseClass': 'rdijit-form-menuPanel',
    declaredClass: 'rdijit.form.menuPanel',
    templateString:
    	"<div data-dojo-attach-point='container'>" +
    	"<span style='display:inline-block;margin-left:118px;width:0px;height:0px;"
  	  +"border-left: 10px solid transparent;"
  	  +"border-right: 10px solid transparent;border-bottom: 12px solid #fff;'></span></div>",
    postCreate: function(){
    	this.inherited(arguments);
    	this.build();
    },
    constructor: function(){
    	
    	if(arguments.length == 1 && !lang.isArray(arguments[0])){
    		declare.safeMixin(this, arguments[0]);
    	}
		for(var i = 0;i < arguments.length && i < 2;i++){
			var arg = arguments[i];
			if(typeof arg === "function" && !this.onpick){
				this.onpick = arg;
			}else if(lang.isArray(arg) && !this.data){
				this.data = arg;
			}
		}
	},
	name: "name",
	_name: function(node){
		if(typeof this.children === "function"){
			this._name = this.name;
		}else{
			var property_name = this.name;
			this._name = function(node){
				return node[property_name];
			}
		}
		return this._name(node);
	},
	children: "children",
	_children: function(node){
		if(typeof this.children === "function"){
			this._children = this.children;
		}else{
			var property_children = this.children;
			this._children = function(node){
				return node[property_children];
			}
		}
		return this._children(node);
	},
	build: function(){
		var content = "";
		var data = [];
    	for(var i = 0,l = this.data.length;i < l;i++){
    		var item = this.data[i];
    		var children = this._children(item);
    		if(children && Object.prototype.toString.call(children) === "[object Array]"
    				&& children.length > 0){
    			/*var height = (c.length / 2)> i ? 17 : (i - (c.length / 2))*26 + 17*/
    			var height = children.length / 2 * 26;
    			content += "<li><div style='margin-top:-"+height+"px'>";
    			content	+="<span style='position: absolute;margin-left:-17px;left:100%;top:50%;width:0px;height:0px;"
  	  +"border-left: 13px solid #fff;"
  	  +"border-top: 7px solid transparent;border-bottom: 7px solid transparent;'></span><ul>";
    			for(var j = 0,cl = children.length;j < cl;j++){
    				content += "<li data-indexs='"+i+","+j+"'>"+this._name(children[j])+"</li>";
    			}
    			content += "</ul></div><a><span>&lt;</span>" + this._name(item) + "</a>";
    		}else{
    			content += "<li data-indexs='"+i+"'>" + this._name(item) + "";
    		}
    		content += "</li>";
    	}
    	dojo.query('ul', this.domNode).forEach(function(nodeUl){
    		html.destroy(nodeUl);
    	});
    	var ul = html.create('ul', {innerHTML: content}, this.domNode);
    	if(this.onpick){
    		ul.onclick = lang.hitch(this, function(event){
            		if(this.data && this.onpick){
            			var indexs = event.target.getAttribute("data-indexs");
            			if(!indexs)return;
            			indexs = indexs.split(",");
        				var m = this.data;
        				for(var i = 0;i < indexs.length;i++){
        					if(i == 0){
        						m = m[indexs[i]];
        					}else{
        						m = this._children(m)[indexs[i]];
        					}
        				}
        				this.onpick(m, indexs, this.data);
            		}
    			});
    	}
	},
    toggle: function(){
    	if(this.visible){
    		this.hide();
    	}else{
    		this.show();
    	}
    },
	show: function(){
		this.domNode.style.display = "block";
		this.visible = true;
	},
	hide: function(){
		this.domNode.style.display = "none";
		this.visible = false;
	},
	data: null,
	onpick: null,
    setData: function(data){
    	this.data = data;
    	this.build();
    }
  });
});