/**
 * Created by richway on 2015/6/17.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    'dojo/on',
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!../template/AppCompsPanel.html",
    "dojo/text!../css/AppCompsPanel.css",
    "dojo/topic",
    "dojo/Deferred",
    "rdijit/layout/CompsGroupTileLayoutContainer",
    "../dijit/AppCompItemNode",
    'base/admin/AppCommon',
    "base/utils/commonUtils",
    'require'
],function(
    declare,
    lang,
    html,
    on,
    JSON,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,
    template,
    css,
    topic,
    Deferred,
    GroupTileLayoutContainer,
    AppCompItemNode,
    AppCommon,
    commonUtils

){
    return declare("base.admin.application.AppCompsPanel", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
        templateString: template,
        'baseClass':"base-admin-application-AppCompsPanel",
        constructor: function(args){
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);

            this.compsList = [];
            this.compsListSelect = [];//之前选中的
        },

        postCreate:function(){
            this.inherited(arguments);

            commonUtils.mask("请稍等...");
            //应该是两个，第一是获取所有的组件，第二是看当前的appid,之前是不是已经选择过了，这次只是重新编辑
            this._getComps().then(lang.hitch(this,this.createGroupTile));

            //第二个先忽略，service完成在写
        },
        resize:function(){
        },
        startup:function(){
            this.inherited(arguments);


        },
        _getComps:function(){
            //去后台请求数据

            //return dojo.xhrPost({
            //    url: APP_ROOT+"base/data/app_comps_list.json",
            //    handleAs: "text",
            //    content: { name:"" }
            //}).then(lang.hitch(this, function (response) {
            //    var json = dojo.fromJson(response);
            //    if (json.success) {//成功返回
            //        return json.data;
            //    } else {
            //        return [];
            //    }
            //}));

            var url;
            if(window.testApp){
                url = APP_ROOT+"base/data/app_comps_list.json";
            }else{
                url = AppCommon.getAppCpmts;
            }

            //var dataStr =    '{"sqlid":"com.ibm.rich.framework.persistence.CfgAppCmptMapper.getAppCpmts","appId":"'+(this.appId?this.appId:null)+'"}';
            //return commonUtils.post( url,dataStr
            //    //'{"sqlid":"com.ibm.rich.framework.persistence.CfgAppCmptMapper.getAppCpmts"}'
            //).then(lang.hitch(this, function (json) {
            //        return json.data;
            //    }));


            if(this.appId){
                url = AppCommon.cfg_app+"/"+this.appId+"/cmpt";
            }else{
                //url = AppCommon.getAppCpmts;
            }
            return commonUtils.get( url).then(lang.hitch(this, function (json) {
                    commonUtils.mask("请稍等...");
                    var list = json.data;
                    for(var i=0;i<list.length;i++){
                    	list[i].isUsed = list[i].isUsed.toLowerCase();
                    }
                    return list;
                }));

        },
        compsList:null,
        compsListSelect:null,//之前选中的
        createGroupTile:function(list){
            if(!this.groupList){
                this.groupList = new GroupTileLayoutContainer({
                    strategy: 'fixWidth',
                    //itemSize: {height: ((110/130)*100) + '%'},
                    itemSize: {height: 90,width:300 },
                    maxCols: 4
                }, this.compsNode);
            }
            this.groupList.empty();

            var items = [];
            for(var i=0;i<list.length;i++)
            {
                var node = new AppCompItemNode(list[i]);
                var data = list[i];
                items.push({groupName:data.component_category,data:data,node:node});
                this.compsList.push(node);
                if(data.isUsed == "true"){
                    this.compsListSelect.push(data);//之前选中的先保存起来
                }
            }

            this.groupList.addItems(items);

            var box = html.getMarginBox(this.domNode);
            var listHeight = box.h - 37 - 21 - 61;
            html.setStyle(this.groupList, 'height', listHeight + 'px');
            if(this.groupList){
                this.groupList.resizeGroup();
            }

        },
        validate:function(){
            //在这里判断是否都填写完整了

            return true;
        },
        save:function(){
            //获取已经选择的组件
            var selectComps = [];
            for(var i=0;i< this.compsList.length;i++){
                if(this.compsList[i].isSelect){
                    selectComps.push(this.compsList[i].model);
                }
            }

            var selectCompsList = [];
            for(var k=0;k<selectComps.length;k++){
                selectCompsList.push(selectComps[k].cmptId);
            }

            //和以前选中的进行对比分析
            var newlist = [];
            for( var i=0;i<this.compsListSelect.length;i++){
                var isHas = false;
                for(var j=0;j<selectComps.length;j++){
                    if(this.compsListSelect[i].cmptId == selectComps[j].cmptId){
                        isHas = true;
                    }
                }
                if(isHas){
                    //newlist.push({"appId":this.appId,"cmptId":this.compsListSelect[i].cmptId,"isUsed":"true"});
                }else{
                    newlist.push({"appId":this.appId,"cmptId":this.compsListSelect[i].cmptId,"isUsed":"false"});
                }

            }


            for(var j1=0;j1<selectComps.length;j1++){
                var okdd = false;
                for( var i1=0;i1<this.compsListSelect.length;i1++) {
                    if(selectComps[j1].cmptId == this.compsListSelect[i1].cmptId){
                        okdd = true;
                    }
                }
                if(!okdd){
                    newlist.push({"appId":this.appId,"cmptId":selectComps[j1].cmptId,"isUsed":"true"});
                }
            }

            if(selectComps.length==0 && this.appId !='0'){
                topic.publish("base/manager/message", {
                    state: "error",
                    title: "提示",
                    content: "请选择至少一个组件"
                });
                return;
            }

            //提交到后台,cmptId
            var url;
            if(window.testApp){
                url = APP_ROOT+"base/data/app_comps_list.json";
            }else{
                //url = AppCommon.saveAppCmptProp;
                //url = AppCommon.getAppCpmts;
                url = AppCommon.cfg_app+"/"+this.appId+"/cmpt";
            }

            var dataStr = JSON.stringify({list:newlist});
            return commonUtils.post( url,dataStr
                //'{"sqlid":"com.ibm.rich.framework.persistence.CfgAppCmptMapper.getAppCpmts"}'
            ).then(lang.hitch(this, function (json) {
                    window.selectCompsList = selectCompsList;
                    this.getAllWidgets();
                    return selectComps;//选中的返回
                }));
        },
        getAllWidgets: function() {
            var cmpstr = "";
            cmpstr = window.selectCompsList.join("','");
            Logger.time("根据组件获取相关的widget");
             var url = AppCommon.getWidgetsByComponents + "('" + cmpstr + "')";
             Logger.log("根据组件获取相关的widget:"+url);
//            var url = APP_ROOT+"base/data/widgets_all.json";
            return commonUtils.get(url).then(lang.hitch(this, function(json) {
                if(!window.global){
                    window.global = {};
                }
                window.global.widgetList = json.data;

                Logger.timeEnd("根据组件获取相关的widget");
            }));

        }

    });
});