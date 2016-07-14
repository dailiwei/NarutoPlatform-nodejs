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
    "base/JSLogger"
], function (declare,
             lang,
             html,
             topic,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             template,
             css,
             JSLogger ) {
    return declare("simple.demo.demoViewMmin", [_Widget, _TemplatedMixin], {
        'baseClass': "simple-demo-demoViewMin",
        templateString: template,

        name: null,
        _logger: null,
        constructor: function (args) {

            this._logger = new JSLogger({name: "simple/demo/demoViewMmin"});//widget的包路径
            this._logger.traceEntry("constructor");

            declare.safeMixin(this, args);
            this.setCss(css);

            this.initVars();
            this.initEvents();

            this._logger.traceExit("constructor");
        },
        initVars: function () {
            
            this.name = "成员变量";
        },

        initEvents: function () {
        },
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);
        },
        resize: function () {
            //缩放的方法
        },
        destroy: function () {

        },
        testClick: function (evt) {
        }
    });
});