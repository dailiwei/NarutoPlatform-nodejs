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
    "dojo/text!./template/demoViewMin.html",
    "dojo/text!./css/demoViewMin.css",
    "base/JSLogger",
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
             JSLogger,
             commonUtils,
             Common) {
    return declare("simple.demo.demoViewMin", [_Widget, _TemplatedMixin], {
        'baseClass': "simple-demo-demoViewMin",
        templateString: template,

        /*
        * js编写建议：
        * －dom元素不需要动态创建的，尽量在html模版里面写，在js里面写逻辑交互，分离出来
        * －dojo框架现在的话，做为框架，搭建使用，工具类可以使用dojo的，也可使用jquery(默认直接可用)
        * －样式的话，在CSS里面不建议写关于颜色的，平台会定义一系列有含义的颜色库，直接引用即可，建议使用boostrap提供的样式
        * －模块间widget的通信现在使用的是dojo的topic.subscribe ，以及publish
        *
        * */

        //如果不使用"dojo/text!./template/demoView.html",引入也可以，直接写到这里面
        //templateString: '<div></div>',

        //监听的方法不写匿名函数
        //＊＊＊＊全局变量必须在constructor里面赋值，在这里必须设置为null
        name: null,
        _logger: null,
        //构造方法，args做为widget的参数
        constructor: function (args) {

            //初始化日志器,调试输出的话，不允许自己调用console，需要使用该logger,做控制台输出
            this._logger = new JSLogger({name: "simple/demo/demoViewMin"});//widget的包路径
            this._logger.traceEntry("constructor");

            //将参数做为对象变量 safeMixin
            declare.safeMixin(this, args);
            //设置样式,declare("simple.demo.demoViewMin"),根据widget名称确保样式只引用一次
            this.setCss(css);

            //初始化全局变量
            this.initVars();
            //初始化事件，监听
            this.initEvents();

            //动态参数，this.parameters里面是基础配置的参数
            this._logger.trace("constructor", "动态参数,来自parameters[regionName]" + this.parameters.regionName);

            this._logger.traceExit("constructor");
        },
        //变量的话必须在这个进行初始化，不能直接赋值
        initVars: function () {
            this.name = "成员变量";//成员变量在成员函数里面使用需要 "this."

            var name = "内部变量";
            this._logger.trace("initVars", this.name);
            this._logger.trace("initVars", name);

            //获取widget的需要外部的跳转，或者初始化的业务参数数据
            if(window.global&&window.global.hasOwnProperty("simple/demo/demoViewMin")){
                this._logger.trace("获取外部参数", window.global["simple/demo/demoViewMin"]);
            }
        },

        //初始化事件
        initEvents: function () {
            //监听住一些方法，作出相关的相应,不能使用匿名函数，做为回调方法。lang.hitch(this,这是dojo的作用域
            var subscription = topic.subscribe('simple/demo/demoViewMin/someTopic', lang.hitch(this, this.someTopicHandler));
            // register subscription.remove() to be called when this widget is destroyed
            this.own(subscription);
        },
        someTopicHandler: function (data) {
            //do something
        },
        //postCreate在startup,之前运行
        postCreate: function () {
            this.inherited(arguments);
            this._logger.trace("postCreate", "执行");

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
            this._logger.debug("startup", "执行");
        },

        //widget容器DIV变化后会父容器会调用这个方法
        resize: function () {
            //缩放的方法

        },
        //有些监听事件，或者需要销毁的变量，需要在这个方法里面销毁
        destroy: function () {

        },
        //监听来自html的click事件
        testClick: function (evt) {
            //获取测试数据
            this.getAppList();
        },
        //其他代码
        getAppList: function () {
            //如果ajax错误异常，框架会管理,then里面是回调函数，dojo的写法,组件开发人员只需要写回调成功的结果函数
            //组件里面的service的地址，必须在Common.js里面统一管理
            commonUtils.get(Common.getApps).then(lang.hitch(this, this.AppListHandler));
        },
        AppListHandler: function (json) {
            alert(json.data.length);
            //统一走这个输出方法，框架自动管理关闭输出console
            this._logger.info("AppListHandler", "返回成功");
        }
    });
});