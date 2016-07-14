///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway&IBM. All Rights Reserved.
// create by dailiwei 2015-08-11 01:43
///////////////////////////////////////////////////////////////////////////
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/html",
    "dojo/topic",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!./template/demoView.html",//名称要和文件名字都统一
    "dojo/text!./css/demoView.css",//名称要和文件名字都统一，这几个名字都要统一，别问为什么
    "base/utils/commonUtils",
    "../service/Common"
], function (declare,
             lang,
             html,
             topic,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             template,
             css,
             commonUtils,
             Common) {
    return declare("simple.demo.demoView", [_Widget, _TemplatedMixin], {

        'baseClass': "simple-demo-demoView",
        templateString: template,

        name: null,

        types:null,
        constructor: function (args) {

            declare.safeMixin(this, args);
            this.setCss(css);

            this.initVars();
            this.initEvents();

        },
        initVars: function () {
            //简单属性无所谓，在不在这块指定下值
            this.name = "成员变量";

            //数据或者对象等高级类型，必须
            this.types = [];
        },

        postCreate: function () {
            this.inherited(arguments);
            Logger.log("postCreate执行");

            //这个代码执行的时候有可能没附加到dom,做些逻辑处理到东西
            this.initLayout();//有时会放到startup
        },
        initLayout: function () {
            //进行一些布局的修改，宽高设置，动态创建元素
            var box = html.getContentBox("main");//展示区域main
            html.setStyle(this.domNode, {//this.domNode就是当前的widget的dom
                height: 200 + 'px'
            });
        },
        startup: function () {
            this.inherited(arguments);
            Logger.debug("startup执行");

            //这里面的代码执行时候，当前的widget已经附加到dom
        },
        resize: function () {
        },
        //这个方法必须写，不然有些销毁的东西没发搞
        destroy: function () {

            /*
            这个区域写 销毁的方法，比如，手动移除监听
            对于特殊的子widget 对象的手动销毁


             */


            // 下边这句必须带着，不然会无法销毁子的东西
            this.inherited(arguments);
        },

        //示例代码 add by dailiwei
        /**********widget 监听来自html的click事件 start**********/
        testClick: function (evt) {//
             alert("ok");
        },
        /**********widget 监听来自html的click事件 end**********/

        /**********widget 后台交互 start**********/
        getAppList: function () {
            //如果ajax错误异常，框架会管理,then里面是回调函数，dojo的写法,组件开发人员只需要写回调成功的结果函数
            //组件里面的service的地址，必须在Common.js里面统一管理
            //get 查询
            commonUtils.get(Common.getApps,{}).then(lang.hitch(this, this.AppListHandler));

            //post 新增 dojox.uuid.generateRandomUuid()－－UUID
            commonUtils.post("////",{id:dojox.uuid.generateRandomUuid(),name:"测试"}).then(lang.hitch(this, this.AppListHandler));
            //put 更新
            commonUtils.put("////id",{name:"修改"}).then(lang.hitch(this, this.AppListHandler));
            //del 删除
            commonUtils.del("/////id").then(lang.hitch(this, this.AppListHandler));
        },
        AppListHandler: function (json) {
            Logger.console(json);
            //全局提示框 有几种方式
            topic.publish("base/manager/message", {
                state: "info",
                title: "返回成功",
                content: "<div> 成功返回数据</div>"
            });

        },
        /**********widget 后台交互 end**********/

        /**********widget 模块通信 start**********/
        initEvents: function () {
            //subscribe 必须在publish派发之前监听，this.own是负责管理监听的，在widget销毁的时候会自动销毁own的监听
            this.own(topic.subscribe('simple/demo/demoView/someTopic', lang.hitch(this, this.someTopicHandler)));


            //给别的模块发送消息
            topic.publish("simple/demo/demoViewMin/someTopic");//无参数
            topic.publish("simple/demo/demoViewMin/someTopic",{"name":"simple/demo/demoView"});//有参数
        },
        someTopicHandler: function (data) {
            //do something
        }
        /**********widget 模块通信 end**********/


    });
});