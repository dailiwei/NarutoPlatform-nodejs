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
 * Tree Filter Pane Widget
 */

define(
    ["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/json",
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
        "dojo/text!./template/PageLayoutConfig.css",
        "dojo/text!./template/PageLayoutConfig.html",

        "base/admin/page/AddWidgetDialog",
        "base/admin/page/ConfigMixin",
        'base/admin/AppCommon',
        "base/utils/commonUtils",
        "base/admin/page/CommonWidgetConfig"

    ],
    function(declare, lang, array, JSON, ready, when, topic, parser, JSLogger,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin, css,
        template, AddWidgetDialog, ConfigMixin, AppCommon, commonUtils, CommonWidgetConfig) {
        ready(function() {
            // Call the parser manually so it runs after our widget is defined, and page has finished loading
            parser.parse();
        });
        return declare(
            "base.admin.page.PageLayoutConfig", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin, ConfigMixin], {
                templateString: template,
                id: null,
                selectedComponents: [],
                //showButton: false,
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";

                    this._logger = new JSLogger({
                        name: "PageLayoutConfig"
                    });
                    this._logger.traceEntry(fn);

                    lang.mixin(this, kwArgs);
                    this.setCss(css);

                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid()
                    }

                    //                          this.addTopics();
                    this._logger.traceExit(fn);
                },
                setupSubscribe: function() {
                    topic.subscribe(this.changeBreadCrumbCallbackTopic, lang.hitch(this, function(message) {
                        if (message && message.mode) {
                            switch (message.mode) {
                                case "add":
                                    this.vm.breadcrumb.push(message.title);
                                    break;
                                case "remove":
                                    this.vm.breadcrumb.pop();
                                    break;
                                case "modify":
                                    this.vm.breadcrumb.pop();
                                    this.vm.breadcrumb.push(message.title);
                                    break;
                                default:
                                    break;

                            }

                        }

                    }));
                },
                postCreate: function() {

                    this.inherited(arguments);
                    this.changeBreadCrumbCallbackTopic = "/rich/base/admin/page/pageConfig/breadcrumb" + this.id;
                    this.setupSubscribe();






                },

                createLayoutConfig: function() {
                    var widgetList = this.pageConfig;
                    var selectedWidgets = this.selectedWidgets;
                    var widgetArrayObject = {};

                    array.forEach(widgetList, function(widget) {

                        // for (var i = 0; i < selectedWidgets.length; i++) {
                        //     var widgetTemplate = selectedWidgets[i];
                        //     if (widgetTemplate.widget_id == widget.widget_id) { //把meta属性加到widget对象上面
                        //         for (var _pro in widgetTemplate) {
                        //             if (_pro[0] == '#') {
                        //                 widget[_pro] = widgetTemplate[_pro];
                        //             }

                        //         }
                        //         break; // 找到template 就跳出循�?
                        //     }
                        // }

                        var widgetTemplates = array.forEach(selectedWidgets, function(template_widget) {
                            if (template_widget.widget_id === widget.widget_id) {
                                for (var _pro in template_widget) {
                                    if (_pro[0] == '#') {
                                        widget[_pro] = template_widget[_pro];
                                    }
                                }
                            }
                        });

                        if (widget.regions) {
                            widget["regionArray"] = [];
                            var regionMeta = widget["#regionsMeta"];
                            array.forEach(widget.regions, function(region) {


                                var tmpRegionObj = {};
                                if (regionMeta) {
                                    var regionTemplate = regionMeta[region];
                                    tmpRegionObj = {
                                        "region_id": region,
                                        "name": regionTemplate.name,
                                        "Maximum": regionTemplate.Maximum,
                                        "widget_types": regionTemplate.widget_types,
                                        "widgets": []
                                    };
                                } else {
                                    tmpRegionObj = {
                                        "region_id": region,
                                        "name": region,
                                        "Maximum": -1,
                                        "widget_types": [],
                                        "widgets": []
                                    };
                                }



                                widget.regionArray.push(tmpRegionObj);
                            });
                        }


                        widgetArrayObject[widget.id] = widget;

                    });

                    function ConstructTree(startWidget) {
                        if (startWidget.regions) {
                            for (var widget in widgetArrayObject) {
                                var widgetObj = widgetArrayObject[widget];
                                if (widgetObj.container == startWidget.id) {
                                    array.forEach(startWidget.regionArray, function(region) {
                                        if (region.region_id == widgetObj.parameters.region) {
                                            region.widgets.push(ConstructTree(widgetObj));
                                        };
                                    });
                                }
                            }
                        }
                        return startWidget;


                    }

                    this.widgetArrayObject = widgetArrayObject;

                    this.layoutWidget = ConstructTree(this.widgetArrayObject[this.layout.layout_id]);


                    this.layoutWidgetConfig = new CommonWidgetConfig({
                        "widget": this.layoutWidget,
                        "parentWidgetId": this.id,
                        "selectedComponents": this.selectedComponents,
                        "selectedWidgets": this.selectedWidgets,
                        "showButton": false,
                        "changeBreadCrumbCallbackTopic": this.changeBreadCrumbCallbackTopic
                    });
                    if (this.layoutWidgetConfig.startup) {
                        this.layoutWidgetConfig.startup();
                    };
                    if (this.layoutWidgetConfig.initAvalon) {
                        this.layoutWidgetConfig.initAvalon();
                    };
                    this.contentDiv.appendChild(this.layoutWidgetConfig.domNode);
                },
                getPageConfig: function() {
                    var decodeLayoutArray = [];

                    function DeConstructTree(startWidget) {
                        if (startWidget.regionArray) {
                            array.forEach(startWidget.regionArray, function(region) {
                                array.forEach(region.widgets, function(widget) {
                                    DeConstructTree(widget);
                                });
                            });
                        }
                        var tmpObj = lang.clone(startWidget);
                        if (tmpObj.regionArray) {
                            delete tmpObj.regionArray;
                        };
                        for (var p in tmpObj) {
                            if (p[0] == '#') {
                                delete tmpObj[p];
                            }
                        }
                        decodeLayoutArray.push(tmpObj);
                    }
                    var modifiedLayoutWidget = this.layoutWidgetConfig.getCurrentWidget();
                    DeConstructTree(modifiedLayoutWidget);
                    // Logger.log(decodeLayoutArray);
                    return JSON.stringify(decodeLayoutArray);
                },
                /*savePageConfig: function() {

                    var decodeLayoutArray = [];

                    function DeConstructTree(startWidget) {
                        if (startWidget.regionArray) {
                            array.forEach(startWidget.regionArray, function(region) {
                                array.forEach(region.widgets, function(widget) {
                                    DeConstructTree(widget);
                                });
                            });
                        }
                        var tmpObj = lang.clone(startWidget);
                        if (tmpObj.regionArray) {
                            delete tmpObj.regionArray;
                        };
                        for (var p in tmpObj) {
                            if (p[0] == '#') {
                                delete tmpObj[p];
                            }
                        }
                        decodeLayoutArray.push(tmpObj);
                    }
                    var modifiedLayoutWidget = this.layoutWidgetConfig.getCurrentWidget();
                    DeConstructTree(modifiedLayoutWidget);
                    Logger.log(decodeLayoutArray);


                    var url = AppCommon.saveAppPageConfig;

                    var dataObj = {
                        "sqlid": "com.ibm.rich.framework.persistence.CfgAppPageMapper.updateCfgAppPage",
                        "list": [{

                            "pageId": this.pageId,
                            "config": JSON.stringify(decodeLayoutArray)
                        }]
                    };

                    var dataStr = JSON.stringify(dataObj);
                    return commonUtils.put(url, dataStr);
                },*/
                startup: function() {
                    this.initAvalon();
                    this.createLayoutConfig();

                },
                initAvalon: function() {
                    this.vm = avalon.define({
                        $id: "PageLayoutConfig" + this.id,
                        "breadcrumb": []
                            //    "showButton": this.showButton,
                            // "saveWidget": lang.hitch(this, function() {
                            //     this.savePageConfig();
                            // })
                    });
                    avalon.scan(this.domNode);
                },
                reset: function() {

                },

                resize: function() {},

                destroy: function() {

                    this.inherited(arguments);
                    delete avalon.vmodels["PageLayoutConfig" + this.id];
                    this.layoutWidget = null;
                    this.layoutWidgetConfig.destroy();
                    this.layoutWidgetConfig = null;
                }
            });
    });
