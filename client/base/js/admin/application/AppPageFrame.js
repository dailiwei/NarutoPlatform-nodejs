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

    "dojo/text!../template/AppPageFrame.html",
    "dojo/text!../css/AppPageFrame.css",
    "dojo/topic",
    "dojo/Deferred",
    "base/admin/page/PageLayoutConfig",
    "base/admin/page/PageAccess",
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
             PageLayoutConfig,
             PageAccess,
             AppCommon,
             commonUtils,
             Message

) {
    return declare("base.admin.application.AppPageFrame", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppPageFrame",
        pageLayoutConfig:null,
        pagePageAccess:null,
        constructor: function (args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);

            this.pageLayoutConfig = null;
            this.pagePageAccess = null;
             

        },

        postCreate: function () {
            this.inherited(arguments);

     //       this.nameNode.value = this.name;


            //this.layout = this.layout



            this.nameNode.select();//焦点选中
        },
        resize: function () {
        },
        startup: function () {
            this.inherited(arguments);
          

            this.nameNode.value = this.name;
            if(!this.visible&&this.visible==0){//0 false 1 true
                this.pageVisNode.checked = false;
            }
            
            //检查_widgets
            var widgetList = this.getParent().widgetList;
            if(widgetList.length>0){
            	  this.loadPage(widgetList);
            }else{
            	this.getWidgetsByLocal().then(lang.hitch(this,function(widgetList){
            		Logger.log("获取本地的widgets_all");
            		this.loadPage(widgetList);
            	}));
            }
          
        },
        getWidgetsByLocal:function(){ 
            
        	   var url = window.APP_ROOT+"base/data/widgets_all.json";
               return commonUtils.get(url).then(lang.hitch(this, function(json) {
                   
                   this.getParent().widgetList = json.data;
                   return json.data; 
               }));
        },
        loadPage: function (widgetList) {
            var pageConfig = [];
            var layout = { };  

            if(this.pageConfig){
                pageConfig = this.pageConfig;
            }

            if(this.layout){
                layout = this.layout;
                this.layoutImg.src = this.layout.thumbnail;
            }

            //var pageLayoutConfig = new PageLayoutConfig({
            //    "pageConfig": pageConfig,
            //    "layout": layout,
            //    "pageId":this.pageId,
            //    "selectedComponents":window.selectCompsList
            //});
            //domConstruct.place( pageLayoutConfig.domNode, this.contentDiv);
            //this.pageLayoutConfig = pageLayoutConfig;
            //pageLayoutConfig.startup();
            this.nameNode.value = this.name;
            if(this.nt){
                this.ctNode.value = this.nt;
            }
            var pageLayoutConfig = new PageLayoutConfig({
                "appId":this.appId,
                "pageId":this.pageId,
                "pageConfig": pageConfig,
                "layout": layout,
                "selectedWidgets": widgetList,//这里我是写死了所有的了
                "selectedComponents": window.selectCompsList
            });
            domConstruct.place( pageLayoutConfig.domNode, this.contentDiv);
            this.pageLayoutConfig = pageLayoutConfig;
            pageLayoutConfig.startup();


            var pageAccess = new PageAccess({appId:this.appId,pageId:this.pageId});
            domConstruct.place( pageAccess.domNode, this.rightContentDiv);
            this.pagePageAccess = pageAccess;
            pageAccess.startup();

        },
        _onKeyUp:function(e){
            topic.publish("vendor/tree/nodeNameEdit", this.nameNode.value);
        },
        _onFocus:function(e){
            topic.publish("vendor/tree/nodeNameEdit",this.nameNode.value);
        },
        destroy:function(){
            this.inherited(arguments);

            try{
                this.pageLayoutConfig.destory();
                this.pagePageAccess.destory();
            }
            catch(e){

            }
        },
        _savePage:function(){
            //更新page基础信息
            var config = this.pageLayoutConfig.getPageConfig();
            var jsonobj =    {
                // "sqlid":"com.ibm.rich.framework.persistence.CfgAppPageMapper.updateCfgAppPage",
                "list": [  {
                    "pageId": this.pageId,
                    "pageNm": this.nameNode.value,
                    "visible": this.pageVisNode.checked?1:0,
                    "nt": this.ctNode.value,
                    "config":config
                }   ]
            };
            var dataStr = JSON.stringify(jsonobj);
//            var dataStr = jsonobj;
            var url = AppCommon.saveAppPageConfig.replace("{appId}",this.appId);
            url=url.replace("{pageId}",this.pageId);
            commonUtils.put(url ,dataStr
            ).then(lang.hitch(this, function (json) {
                    //Logger.log(json);
                    this.getParent().isEdit = false;
                    topic.publish("base/manager/message",{state:"info",title:"页面保存",content:"<div> 成功保存页面布局</div>"});
                    //修改树的信息
                    topic.publish("vendor/tree/nodeNameEdit_visible",this.pageVisNode.checked?1:0);
                    
                    topic.publish("vendor/tree/nodeNtEdit", this.ctNode.value);
                }));
            //保存page的config内容 getPageConfig
            //this.pageLayoutConfig.savePageConfig().then(lang.hitch(this,this.pageSaved));

            //先注释掉
            this.pagePageAccess.savePageAccess().then(lang.hitch(this,this.pageAccessSaved));
        },
        pageSaved:function(data){
            //保存了就修改状态，当前不是编辑的了
            this.getParent().isEdit = false;
            topic.publish("base/manager/message",{state:"info",title:"页面保存",content:"<div> 成功保存布局</div>"});

        },
        pageAccessSaved:function(data){
            topic.publish("base/manager/message",{state:"info",title:"页面保存",content:"<div> 成功保存页面权限</div>"});

            Logger.log(data);
        },
        _getPageId:function(){ 
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