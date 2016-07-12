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

    "dojo/text!../template/AppPageLinkFrame.html",
    "dojo/text!../css/AppPageLinkFrame.css",
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
    return declare("base.admin.application.AppPageLinkFrame", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppPageLinkFrame",
        target: null,

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
            if(this.url){
                this.urlNode.value = this.url;
            }
            if(this.target){
                if(this.target==""){
                    this.urlRadio1.checked = true;
                }else if(this.target=="_blank"){
                    this.urlRadio2.checked = true;
                }else if(this.target=="_iframe"){
                    this.urlRadio3.checked = true;
                }

            }


        },

        _onKeyUp: function (e) {
            topic.publish("vendor/tree/nodeNameEdit", this.nameNode.value);
        },
        _onFocus: function (e) {
            topic.publish("vendor/tree/nodeNameEdit", this.nameNode.value);
        },
        destroy: function () {
            this.inherited(arguments);

        },
        _savePage: function () {
            if (this.urlNode.value == "") {
                alert("请填写URL");
                return;
            }
            //更新page基础信息
            var jsonobj = { 
                "list": [{
                    "pageId": this.pageId,
                    "pageNm": this.nameNode.value,
                    "visible": this.pageVisNode.checked?1:0,
                    "nt": this.ctNode.value,
                    "url": this.urlNode.value,
                    "target":this._target,
                    "pageType":"url"
                }]
            };
            var dataStr = JSON.stringify(jsonobj);
            var url = AppCommon.saveAppPageConfig.replace("{appId}",this.appId);
            url=url.replace("{pageId}",this.pageId);
            commonUtils.put(url, dataStr
            ).then(lang.hitch(this, function (json) {
                    this.getParent().isEdit = false;
                    topic.publish("base/manager/message", {
                        state: "info",
                        title: "保存",
                        content: "<div> " + this.nameNode.value + "链接页面信息保存成功</div>"
                    });
                    //修改树的信息
                    //topic.publish("vendor/tree/nodeNameEdit_visible",this.pageVisNode.checked?1:0);
                    topic.publish("vendor/tree/nodeNameEdit_visible",{
                        "pageId": this.pageId,
                        "pageNm": this.nameNode.value,
                        "visible": this.pageVisNode.checked?1:0,
                        "nt": this.ctNode.value,
                        "url": this.urlNode.value,
                        "target":this._target,
                        "pageType":"url"
                    });
                    
                    topic.publish("vendor/tree/nodeNtEdit", this.ctNode.value);
                }));

        },
        changeRadio: function (evt) {
            var id = evt.currentTarget.id;
            if (id == "0") {
                this._target = "";
            } else if (id == "1") {
                this._target = "_blank";
            } else if (id == "2") {
                this._target = "_iframe";
            }

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