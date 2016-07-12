/*
 * Licensed Materials - Property of IBM
 *
 * 5725D71
 *
 * (C) Copyright IBM Corp. 2013 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/**
 * Widget Config Dialog
 */

define(
    ["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/ready",
        "dojo/when",
        "dojo/topic",
        "dojo/parser",
        "base/JSLogger",
        "dojo/dom-class", // domClass.toggle
        "dojo/dom-construct", // domConstruct.place
        "dojo/dom-style",

        "base/_BaseWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/Library",
        "dojo/text!./template/AddWidgetDialog.css",
        "dojo/text!./template/AddWidgetDialog.html",
        "base/admin/page/ConfigMixin",
        "base/admin/AppCommon",
        "base/utils/commonUtils",
        "base/admin/page/CommonWidgetConfig",
        "dojo/domReady!"

    ],
    function(declare, lang, array, ready,
        when,
        topic, parser, JSLogger,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin, Library, css,
        template, ConfigMixin, AppCommon, commonUtils, CommonWidgetConfig) {
        ready(function() {
            // Call the parser manually so it runs after our widget is
            // defined, and page has finished loading
            parser.parse();

        });
        return declare(
            "base.admin.page.AddWidgetDialog", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin, ConfigMixin], {

                templateString: template,
                id: null,
                parentWidgetId: null,
                callbackParameters: {},
                regionIndex: null,
                widgetIndex: null,
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";

                    this._logger = new JSLogger({
                        name: "AddWidgetDialog"
                    });
                    this._logger.traceEntry(fn);

                    lang.mixin(this, kwArgs);
                    lang.mixin(this.callbackParameters, kwArgs);
                    this.setCss(css);
                    //  this.Library = new Library();
                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid()
                    }

                    // this.addTopics();
                    this._logger.traceExit(fn);
                },
                setupSubscribe: function() {
                    // body...
                    topic.subscribe(this.saveTopic, lang.hitch(this, function(message) {
                        this.vm.addWidget = message.widget;
                        if (this.callbackParameters.widget) {
                            this.callbackParameters.widget = this.vm.addWidget;
                        } else {
                            lang.mixin(this.callbackParameters, {
                                "widget": this.vm.addWidget
                            });
                        }
                        this.callbackParameters = message;
                        topic.publish(this.callbackTopic, this.callbackParameters);
                    }));

                },
                postCreate: function() {

                    this.inherited(arguments);
                    this.saveTopic = "/rich/base/admin/page/AddWidgetDialog/save" + this.id;

                    this.setupSubscribe();

                },

                initAvalon: function() {


                    if (this.vm) {
                        this.vm = null;
                    }
                    //TODO 加入指示当前状态的面包屑
                    this.vm = avalon.define({
                        $id: "AddDialog" + this.id,
                        regionlist: [],
                        addWidget: null,
                        widgets: [],
                        cancelBtnVisible: false,
                        saveBtnVisible: false,
                        labelVisible: false,
                        selected: -1,
                        saveWidget: lang.hitch(this, function() {
                            if (this.callbackParameters.widget) {
                                this.callbackParameters.widget = null;
                            }

                            lang.mixin(this.callbackParameters, {
                                "widget": this.vm.addWidget
                            });
                            topic.publish(this.callbackTopic, this.callbackParameters);
                            this.closeModal();
                            //$("#modalDiv").append("<div data-dojo-attach-point='modalContent'></div>");



                            this.destroy();
                        }),
                        cancelAdd: lang.hitch(this, function(argument) {
                            // body...
                            this.closeModal();



                            this.destroy();
                        })


                    });
                    avalon.scan(this.domNode);

                    // this.getWdigetsLists(this.selectedComponents).then(lang.hitch(this, function(widgetList) {
                    var allowWidgets = [];
                    allowWidgets = array.filter(this.selectedWidgets, lang.hitch(this, function(widget) {
                        if (!widget["#widget_type"]) {
                            return false;
                        }
                        return array.some(widget["#widget_type"], lang.hitch(this, function(widgetType) {
                            return array.some(this.allow_types, function(_widgetType) {
                                return _widgetType === widgetType;

                            })

                        }));

                    }));
                    this.vm.widgets = lang.clone(allowWidgets);
                    if (allowWidgets.length > 0) {
                        this.vm.selected = 0;
                        this.openWidget(0);
                    };

                    //  }));



                    this.vm.$watch("selected", lang.hitch(this, function(v) {

                        //Logger.log(this.vm.$model.widgets[v]);


                        this.openWidget(v);



                    }));

                },
                openWidget: function(v) {
                    this.vm.addWidget = null;
                    this.vm.addWidget = lang.clone(this.vm.$model.widgets[v]);
                    this.vm.addWidget.module = this.vm.addWidget.module.moduleName;
                    this.vm.addWidget.id = dojox.uuid.generateRandomUuid();
                    this.vm.addWidget.container = this.parentWidgetId;
                    if (this.widgetConfigDiv.childNodes && this.widgetConfigDiv.childNodes.length > 0) {
                        this.widgetConfigDiv.removeChild(this.widgetConfigDiv.childNodes[0]);
                    }

                    this.vm.cancelBtnVisible = false;
                    this.vm.saveBtnVisible = false;
                    this.vm.labelBtnVisible = false;
                    //TODO add destroy exisiting modify widget
                    if (this.vm.addWidget["#regionsMeta"] && !this.vm.addWidget.regions) {
                        this.vm.addWidget.regions = [];
                        this.vm.addWidget.regionArray = [];
                        for (var region in this.vm.addWidget["#regionsMeta"]) {

                            this.vm.addWidget.regions.push(region);
                            var regionTemplate = this.vm.addWidget["#regionsMeta"][region];
                            var tmpRegionObj = {
                                "region_id": region,
                                "name": regionTemplate.name,
                                "Maximum": regionTemplate.Maximum,
                                "widget_types": regionTemplate.widget_types,
                                "widgets": []
                            };
                            this.vm.addWidget.regionArray.push(tmpRegionObj);
                        }
                    } else if (this.vm.addWidget["#regionsMeta"] && this.vm.addWidget.regions) {
                        this.vm.addWidget.regionArray = [];
                        for (var region in this.vm.addWidget["#regionsMeta"]) {

                            // this.vm.addWidget.regions.push(region);
                            var regionTemplate = this.vm.addWidget["#regionsMeta"][region];
                            var tmpRegionObj = {
                                "region_id": region,
                                "name": regionTemplate.name,
                                "Maximum": regionTemplate.Maximum,
                                "widget_types": regionTemplate.widget_types,
                                "widgets": []
                            };
                            this.vm.addWidget.regionArray.push(tmpRegionObj);
                        }
                    } else {
                        //this.widgetConfigDiv.appendChild();
                        this.vm.labelBtnVisible = true;
                    }
                    this.vm.addWidget.id = dojox.uuid.generateRandomUuid();
                    this.vm.addWidget.container = this.container;
                    if (this.vm.addWidget["#parametersMeta"]) {
                        if (!this.vm.addWidget.parameters) {
                            this.vm.addWidget.parameters = {};
                        }

                        for (var parameter in this.vm.addWidget["#parametersMeta"]) {
                            // if (!typeof(this.vm.addWidget["#parametersMeta"][parameter].defaultValue)==undefined) {
                            //     this.vm.addWidget.parameters[parameter] = this.vm.addWidget["#parametersMeta"][parameter].defaultValue;

                            // }

                            this.vm.addWidget.parameters[parameter] = (typeof(this.vm.addWidget["#parametersMeta"][parameter].defaultValue) == undefined) ? null : this.vm.addWidget["#parametersMeta"][parameter].defaultValue;
                        }

                    }
                    if (this.vm.addWidget.parameters) {
                        this.vm.addWidget.parameters.region = this.region;
                    } else {
                        this.vm.addWidget.parameters = {
                            "region": this.region
                        }
                    }


                    var widgetReady = this.Library.loadWidget("base", APP_ROOT + "base/js", "base/admin/page/CommonWidgetConfig");
                    when(widgetReady, lang.hitch(this, function(widgetModule) {
                        var widget = new widgetModule({
                            "parentWidgetId": this.id,
                            "widget": this.vm.$model.addWidget,
                            "parentWidgetId": this.parentWidgetId,
                            "regionIndex": this.regionIndex,
                            "widgetIndex": this.widgetIndex,
                            "selectedWidgets": this.selectedWidgets,
                            "selectedComponents": this.selectedComponents,
                            "callbackTopic": this.saveTopic,
                            "showBreadcrumb": false,
                            "changeBreadCrumbCallbackTopic": this.changeBreadCrumbCallbackTopic
                        });
                        if (widget.startup()) {
                            widget.startup();
                        }

                        this.widgetConfigDiv.appendChild(widget.domNode);

                        //domConstruct.place(widget.domNode,this.widgetConfigDiv);
                        if (widget.initAvalon()) {
                            widget.initAvalon();
                        }
                        avalon.scan(widget.domNode);
                    }));

                    // body...
                },
                startup: function() {
                    // $("#myModal").modal({
                    this.initAvalon();
                    // $("#"+this.id).toggleClass("in");
                },

                reset: function() {

                },

                resize: function() {},

                destroy: function() {

                    this.inherited(arguments);
                    if (avalon.vmodels["AddDialog" + this.id]) {
                        delete avalon.vmodels["AddDialog" + this.id];
                    }
                    this.vm = null;
                    this.regionIndex = null;
                    this.widgetIndex = null;
                    this.callbackParameters = null;
                }
            });
    });
