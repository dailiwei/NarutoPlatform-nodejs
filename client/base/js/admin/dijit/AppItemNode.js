///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        "dojo/dom-construct",
        'base/_BaseWidget',
        'dijit/_TemplatedMixin',
        "dojo/text!./template/AppItemNode.html",
        "dojo/text!./css/AppItemNode.css",
        'dojo/on',
        'dojo/mouse',
        'dojo/query',
        "dojo/topic",
        "base/utils/commonUtils",
        'base/widget/Message',
        'base/admin/AppCommon',
        'base/widget/PopupMini',
        'base/admin/application/AppPagesConfig'
    ],
    function(
        declare,
        lang,
        html,
        domConstruct,
        _WidgetBase,
        _TemplatedMixin,
        template,
        css,
        on,
        mouse,
        query,
        topic,
        commonUtils,
        Message,
        AppCommon,
        PopupMini,
        AppPagesConfig
    ) {
        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            'baseClass': 'app-item-node',
            declaredClass: 'base.admin.dijit.AppItemNode',
            /**
             *options:
             *img: the img url,
             *label:
             *width/height/marginTop/marginLeft: can be px or %
             **/
            model: null,
            constructor: function(data) {
                /*jshint unused: false*/
                this.setCss(css);

                this.model = data;



            },
            mouseover: function(evt) {
                query('.icon_delete', this.domNode).addClass('icon_delete_selected');

            },
            mouseout: function(evt) {
                query('.icon_delete', this.domNode).removeClass('icon_delete_selected');

            },
            postCreate: function() {
                this.own(on(this.domNode, 'mouseover', lang.hitch(this, this.mouseover)));
                this.own(on(this.domNode, 'mouseout', lang.hitch(this, this.mouseout)));
                //this.box = html.create('div', {
                //  'class': 'node-box'
                //}, this.domNode);
                //html.create('img', {
                //  'src': this.img
                //}, this.box);
                //html.create('div', {
                //  'class': 'node-label',
                //  'innerHTML': this.label,
                //  title: this.label
                //}, this.domNode);
                //
                //this.own(on(this.domNode, 'click', lang.hitch(this, this.onClick)));
              

                this.parseModel();
                
                if(this.model.appId=="1"||this.model.appId=="2"||this.model.appId=="3"){
                	domConstruct.destroy(this.deleteNode);
                }
            },

            onClick: function() {
                query('.icon_delete', this.getParent().domNode).removeClass('icon_delete_selected');
                query('.icon_delete', this.domNode).addClass('icon_delete_selected');
            },

            highLight: function() {
                query('.icon_delete', this.getParent().domNode).removeClass('icon_delete_selected');
                query('.icon_delete', this.domNode).addClass('icon_delete_selected');
            },

            startup: function() {
                this.inherited(arguments);
            },
            parseModel: function() {
                //this.model = {
                //    appId:"xxxxxxxyyyyyy00000",//系统自动生成的唯一的ID
                //    appNm:"安徽省政府雨水情监控",//系统名称－校验规范
                //    creator:"李部长",//创建者
                //    crtDt:"2015-06-14",//创建时间
                //    updDt:"126天14小时15分钟",//持续运行天数
                //    adcd:"34000000",//所属管辖区域
                //    categoryId:"1",//业务类型表，存储类型，可以动态新建更新,
                //    app_catalogName:"山洪防汛",//业务类型表，存储类型，可以动态新建更新,
                //    nt:"安徽山洪系统测试创建，可删除",
                //    stat:"1",//1运行，0，停止，－1 未知
                //    "monitor":
                //[
                //    {
                //        "id": null,
                //        "appId": "9a8c479e8fd247329c881780aa84de78",
                //        "res": "cpu",
                //        "resVal": 12,
                //        "nt": null,
                //        "crtDt": 1434988800000,
                //        "updDt": 1434988800000
                //    },
                //    {
                //        "id": null,
                //        "appId": "9a8c479e8fd247329c881780aa84de78",
                //        "res": "memory",
                //        "resVal": 23,
                //        "nt": null,
                //        "crtDt": 1434988800000,
                //        "updDt": 1434988800000
                //    }
                //]
                //
                //};
                this.appName.innerHTML = this.model.appNm;
                this.appName.title = this.model.appNm;
                this.app_creator.innerHTML = "创建者:" + this.model.creator;
                //现在是测试的数据,待修改
                this.app_device_cpu.innerHTML = "24%"; // this.model.device.cpu+"%";
                this.app_device_memory.innerHTML = "15%"; // this.model.device.memory+"%";

                //判断应用的状态，默认是打开的
                if (this.model.stat == "1") {
                    this.app_state_name.innerHTML = "运行中";
                } else if (this.model.stat == "0") {
                    query('.icon_run', this.domNode).addClass('icon_stop');
                    this.app_state_name.innerHTML = "已停止";
                } else if (this.model.stat == "-1") {
                    query(this.domNode).addClass('error'); //异常
                }
            },

            //改变应用状态－停止，暂停之类
            _changeAppState: function(evt) {
                //判断当前的状态，从model对象取得
                if (this.model.stat == "1") {
                    commonUtils.mask("停止中·····");
                    setTimeout(lang.hitch(this, function() {
                        query('.icon_run', this.domNode).addClass('icon_stop');
                        this.app_state_name.innerHTML = "已停止";
                        this.model.stat = "0";
                        commonUtils.mask("已停止");
                        this.changeStateApp(this.model.stat);
                    }), 2000);

                } else if (this.model.stat == "0") {
                    commonUtils.mask("启动中·····");
                    setTimeout(lang.hitch(this, function() {
                        query('.icon_run', this.domNode).removeClass('icon_stop');
                        this.app_state_name.innerHTML = "运行中";
                        this.model.stat = "1";
                        commonUtils.mask("已运行");
                        this.changeStateApp(this.model.stat);
                    }), 2000);

                } else if (this.model.stat == "-1") {

                }


            },
            changeStateApp: function(state) {
                //var dataStr = JSON.stringify( this.model);
                var dataStr = JSON.stringify({
                    "appId": this.model.appId,
                    "stat": state
                });
                var url = AppCommon.cfg_app;
                url += "/" + this.model.appId;
                commonUtils.put(url, dataStr).
                then(lang.hitch(this, function(json) {
                    if (json.success) { //成功返回
                        Logger.log("app状态改变成功");
                    } else {}
                }));
            },
            //打开应用
            _openApp: function(evt) {
                if (this.model.stat == "1") {
                    window.open(APP_ROOT + 'app.jsp?appId=' + this.model.appId);
                } else {

                    alert("请先启动应用");
                }
            },
            //管理应用－编辑应用
            _manageApp: function(evt) {

                topic.publish("base/admin/AppListView/createApp", {
                    "appId": this.model.appId,
                    "model": this.model
                });
            },
            _managePages:function(){
            	window.selectCompsList = [ "Base" ,"data_monitor","device_mgmt","rainmonitor","report","site_mgmt","warn_mgmt"];
            	var panel = new AppPagesConfig({"appId":this.model.appId});  
    			
//    			var width = this.domNode.style.width;
//    			var height = this.domNode.style.height;
//
//    			var box = html.getMarginBox(this.domNode);

    			var pop = new PopupMini({
    				content: panel,
    				container: "main-page",
    				titleLabel: "新建应用",
    				width: '100%',
    				height: '100%',
    				buttons: []
    			});
            },
            _deleteApp: function() {
                //弹出确认，不可恢复的窗口
                var msg2 = new Message({
                    titleLabel: "提示",
                    message: '删除应用,不可恢复',
                    width: 400,
                    height: 170,
                    buttons: [{
                        label: '确定',
                        onClick: lang.hitch(this, function() {
                            if (this.model.appId != 0) {
                                commonUtils.mask("正在删除应用·····");
                                msg2.close();

                                setTimeout(lang.hitch(this, function() {
                                    commonUtils.del(AppCommon.delAppByAppId + this.model.appId).then(lang.hitch(this, function(json) {

                                        domConstruct.destroy(this.domNode);
                                        commonUtils.mask("已经删除应用·····");
                                        topic.publish("base/admin/AppListView/applistUpdate");

                                    }));
                                    //domConstruct.destroy(this.domNode);
                                    //commonUtils.mask("已经删除应用·····");
                                    //topic.publish("base/admin/AppListView/applistUpdate");

                                }), 2000);
                            };


                        })
                    }, {
                        label: '取消',
                        onClick: lang.hitch(this, function() {
                            msg2.close();
                        })
                    }]
                });
            }

        });
    });
