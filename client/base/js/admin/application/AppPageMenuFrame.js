/**
 * Created by richway on 2015/6/23.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/dom-construct",
    'dojo/on',
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    
    "dojo/text!../template/AppPageMenuFrame.html",
    "dojo/text!../css/AppPageMenuFrame.css",
    "dojo/topic",
    "dojo/Deferred",
    'base/admin/AppCommon',
    "base/utils/commonUtils",
    "base/widget/Message",
    'require'
], function (declare,
             lang,
             html,
             domConstruct,
             on,
             JSON,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             
             template,
             css,
             topic,
             Deferred,
             AppCommon,
             commonUtils,
             Message

) {
    return declare("base.admin.application.AppPageMenuFrame", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppPageMenuFrame",
        constructor: function (args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);
        },

        postCreate: function () {
            this.inherited(arguments);

            

            this.nameNode.select();//焦点选中
        },
        resize: function () {
        },
        startup: function () {
            this.inherited(arguments);
            this.nameNode.value = this.name;
            if(this.nt){
                this.ctNode.value = this.nt;
            }
            if(!this.visible&&this.visible==0){//0 false 1 true
                this.pageVisNode.checked = false;
            }
        },

        _onKeyUp:function(e){
            topic.publish("vendor/tree/nodeNameEdit", this.nameNode.value);
        },
        _onFocus:function(e){
            topic.publish("vendor/tree/nodeNameEdit",this.nameNode.value);
        },
        destroy:function(){
            this.inherited(arguments);

        },
        _savePage:function(){
            //更新page基础信息
            var jsonobj =    { 
                "list": [  {
                    "pageId": this.pageId,
                    "pageNm": this.nameNode.value,
                    "visible": this.pageVisNode.checked?1:0,
                    "nt": this.ctNode.value
                }   ]
            };
            var dataStr = JSON.stringify(jsonobj);
            var url = AppCommon.saveAppPageConfig.replace("{appId}",this.appId);
            url=url.replace("{pageId}",this.pageId);
            commonUtils.put(url,dataStr
            ).then(lang.hitch(this, function (json) {
                    this.getParent().isEdit = false;
                    topic.publish("base/manager/message",{state:"info",title:"保存",content:"<div> "+this.nameNode.value+"信息保存成功</div>"});

                    //修改树的信息
                    topic.publish("vendor/tree/nodeNameEdit_visible",this.pageVisNode.checked?1:0);
                    topic.publish("vendor/tree/nodeNtEdit", this.ctNode.value);
                }));

        }, _getPageId:function(){ 
		    var msg2 = new Message({
		        titleLabel: "页面pageid",
		        message: this.pageId,
		        width: 400,
		        height: 170,
		        buttons: [{
		            label: '确定',
		            onClick: lang.hitch(this, function() { 
		                msg2.close(); 
		            })
		        } ]
		    });
       }


    });
});