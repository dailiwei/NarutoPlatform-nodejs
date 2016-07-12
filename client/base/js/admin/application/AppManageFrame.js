/**
 * Created by richway on 2015/6/17.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    'dojo/on',
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",

    "dojo/text!../template/AppManageFrame.html",
    "dojo/text!../css/AppManageFrame.css",
    "dojo/topic",
    "dojo/Deferred",
    'base/admin/application/AppInfoPanel',
    'base/admin/application/AppCompsPanel',
    'base/admin/application/AppCompsSetting',
    'base/admin/application/AppPagesConfig',
    'base/widget/Message',
    "dojo/dom-construct",
    "dojo/_base/html",
    'dojo/query',
    "base/utils/commonUtils",
    'require'
],function(
    declare,
    lang,
    htmlUtil,
    on,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,

    template,
    css,
    topic,
    Deferred,
    AppInfoPanel,
    AppCompsPanel,
    AppCompsSetting,
    AppPagesConfig,
    Message,
    domConstruct,
    html,
    query,
    commonUtils

){
    return declare("base.admin.application.AppManageFrame", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
        templateString: template,
        'baseClass':"base-admin-application-AppManageFrame",
        name:"",
        isManage:null,
        constructor: function(args){
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);

            this.name = "\u6d4b\u8bd5";
            this.isManage = false;
        },

        stepPanel1:null,
        postCreate:function(){
            this.inherited(arguments);
            var appId =  this.appId?this.appId:"";
            if(appId!=""){
                this._appId = appId;
                this.titleFrameLabel.innerHTML = "管理应用";
                this.finishNode.innerHTML = "完成";
                this.isManage = true;
            }
            //创建第一个基础信息的
            this.stepPanel1 = new AppInfoPanel({"appId":this._appId,"model":this.model});
            domConstruct.place( this.stepPanel1.domNode, this.divNode1);
            html.setStyle(this.divNode1, 'display', 'block');
        },
        resize:function(){
        },
        startup:function(){
            this.inherited(arguments);
        },
        _cancel:function(){
        	
//        	this.isManage
            //弹出确认关闭，数据不保存之类的东西
        	if(this.currentStep==1){
        		var content = "";
        		if(this.isManage){
        			content = "取消通用设置";
        		}else{
        			content = "放弃创建应用?";
        		}
        		var msg2 = new Message({
                    titleLabel:"提示",
                    message: content,
                    width:400,
                    height:170,
                    buttons: [
                        {
                            label: '确定',
                            onClick:lang.hitch(this,function(){
                            	
                                msg2.close();
                                this.getParent().close(); 
                            })
                        }, {
                            label: '取消',
                            onClick: lang.hitch(this,function(){
                                msg2.close();
                            })
                        }
                    ]
                });
        		
        	}
        	
        	if(this.currentStep==2){
        		var msg2 = new Message({
                    titleLabel:"提示",
                    message: '取消组件选择,可在管理应用重新选择',
                    width:400,
                    height:170,
                    buttons: [
                        {
                            label: '确定',
                            onClick:lang.hitch(this,function(){ 
                            	topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                                this.getParent().close(); 
                            })
                        }, {
                            label: '取消',
                            onClick: lang.hitch(this,function(){
                                topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                            })
                        }
                    ]
                });
        	}
        	
        	if(this.currentStep==3){
        		var msg2 = new Message({
                    titleLabel:"提示",
                    message: '取消组件设置,可在管理应用重新设置',
                    width:400,
                    height:170,
                    buttons: [
                        {
                            label: '确定',
                            onClick:lang.hitch(this,function(){ 
                            	topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                                this.getParent().close(); 
                            })
                        }, {
                            label: '取消',
                            onClick: lang.hitch(this,function(){
                                topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                            })
                        }
                    ]
                });
        	}
        	
        	if(this.currentStep==4){
        		var msg2 = new Message({
                    titleLabel:"提示",
                    message: '取消页面配置,可在管理应用重新配置',
                    width:400,
                    height:170,
                    buttons: [
                        {
                            label: '确定',
                            onClick:lang.hitch(this,function(){
                            	topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                                this.getParent().close(); 
                            })
                        }, {
                            label: '取消',
                            onClick: lang.hitch(this,function(){
                                topic.publish("base/admin/AppListView/applistUpdate");
                                msg2.close();
                            })
                        }
                    ]
                });
        	}
            
            

        },
        currentStep:1,
        _nextStep:function(){
            //判断是进行到那个步骤了
            if(this.currentStep==1){
                if(this.stepPanel1.validate()){
                    this.stepPanel1.save().then(lang.hitch(this,this.moveToStep2));
                }
            }else if(this.currentStep==2){
                if(this.stepPanel2.validate()){
                    this.stepPanel2.save().then(lang.hitch(this,this.moveToStep3));
                }
            }else if(this.currentStep==3){
                if(this.stepPanel3.validate()){
                   // this.stepPanel3.save().then(lang.hitch(this,this.moveToStep4));
                   this.moveToStep4();
                }
            }else if(this.currentStep==4){

            }
        },
        _appId:null,
        moveToStep2:function(appId){

            this._appId = appId;

            //进行第二个步骤，选择组件
            html.setStyle(this.divNode1, 'display', 'none');
            this.navToStep(2);

            this.stepPanel2 = new AppCompsPanel({"appId":this._appId});
            domConstruct.place( this.stepPanel2.domNode, this.divNode2);
            html.setStyle(this.divNode2, 'display', 'block');

            //上一步的按钮显示
            //html.setStyle(this.stepLast, 'display', 'block');
            //走到第二步了
            this.currentStep = 2;

        },
        moveToStep3:function(selectComps){

            //this._appId = appId;
            //进行第三个步骤，组件设置
            html.setStyle(this.divNode2, 'display', 'none');
            this.navToStep(3);

            this.stepPanel3 = new AppCompsSetting({"appId":this._appId,"selectComps":selectComps});

            domConstruct.place( this.stepPanel3.domNode, this.divNode3);
            html.setStyle(this.divNode3, 'display', 'block');

            //走到第三步了
            this.currentStep = 3;

        },
        moveToStep4:function(appId){

            //this._appId = appId;

            //进行第四个步骤，页面配置
            html.setStyle(this.divNode3, 'display', 'none');
            this.navToStep(4);

            this.stepPanel4 = new AppPagesConfig({"appId":this._appId});

            domConstruct.place( this.stepPanel4.domNode, this.divNode4);
            html.setStyle(this.divNode4, 'display', 'block');

            //走到第4步了
            this.currentStep = 4;


        },
        //导航的
        navToStep:function(step){
            var dom = dojo.byId("app_manag_navStep"+step);
            html.setStyle(dom, 'color', '#1AA4CA');

            var node = query('.cirlce',dom)[0];
            //html.setStyle(dom, 'font-weight', 'bold');
            htmlUtil.addClass(node, 'cirlceSelect');

            if(step ==4){
                //'下一步'隐藏，
                html.setStyle(this.nextStepNode, 'display', 'none');
                html.setStyle(this.finishNode, 'display', 'block');
            }


        },
        setAppName:function(name){
            this.appNameNode.innerHTML = name;
        },
        _finishCreateApp:function(e){
            //  生成应用，返回主界面
        	if(this.isManage){
        		 var msg2 = new Message({
                     titleLabel:"提示",
                     message: '保存页面修改吗？',
                     width:400,
                     height:170,
                     buttons: [
                         {
                             label: '确定',
                             onClick:lang.hitch(this,function(){
                                 msg2.close();
                                 commonUtils.mask("保存中，请稍后·····");
                                 setTimeout(lang.hitch(this,function(){
                                     topic.publish("base/admin/AppListView/applistUpdate");

                                     commonUtils.mask("已完成·····");
                                     this.getParent().close();

                                 }),4000);

                             })
                         }, {
                             label: '取消',
                             onClick: lang.hitch(this,function(){
                            	 topic.publish("base/admin/AppListView/applistUpdate");
                                 msg2.close();
                             })
                         }
                     ]
                 });
        	}else{
        		 var msg2 = new Message({
                     titleLabel:"提示",
                     message: '现在就创建应用吗？',
                     width:400,
                     height:170,
                     buttons: [
                         {
                             label: '确定',
                             onClick:lang.hitch(this,function(){
                                 msg2.close();
                                 commonUtils.mask("创建应用中，请稍后·····");
                                 setTimeout(lang.hitch(this,function(){
                                     topic.publish("base/admin/AppListView/applistUpdate");

                                     commonUtils.mask("已创建完成·····");
                                     this.getParent().close();

                                 }),4000);

                             })
                         }, {
                             label: '取消',
                             onClick: lang.hitch(this,function(){
                            	 topic.publish("base/admin/AppListView/applistUpdate");
                                 msg2.close();
                             })
                         }
                     ]
                 });
        	}
           

        }

    });
});