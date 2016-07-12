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
 * App Component Config Widget
 */

define(
    ["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/html",
        "dojo/_base/array",
        "dojo/ready",
        "dojo/topic",
        "dojo/parser",
        "base/JSLogger",
        "dojo/dom-geometry",
        "dojo/dom",
        "dojo/dom-class", // domClass.toggle
        "dojo/dom-construct", // domConstruct.place
        "dojo/dom-style",
        "base/_BaseWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!base/admin/dijit/template/AppCompConfig.html",
        "base/admin/AppCommon",
        "base/Library",
        "dojo/request/xhr",
        "dojo/when",
        "dojo/domReady!"

    ],
    function(declare, lang, html, array, ready, topic, parser, JSLogger, domGeom, dom,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin,
        template, AppCommon, Library, xhr, when) {
        ready(function() {
            // Call the parser manually so it runs after our widget is defined, and page has finished loading
            parser.parse();

        });
        return declare(
            "base.admin.dijit.AppCompConfig", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
                id: null,
                parentWidgetId: null,
                templateString: template,
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";
                    this.Library = new Library();
                    this._logger = new JSLogger({
                        name: "BaseMap"
                    });
                    this._logger.traceEntry(fn);

                    lang.mixin(this, kwArgs);


                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid()
                    }


                    this._logger.traceExit(fn);
                },

                postCreate: function() {

                    this.inherited(arguments);

                },
                setupSubscribe: function() {
                    topic.subscribe("base/admin/AppCompsSetting/AppCompServiceList", lang.hitch(this, function(message) {

                        if (this.contentDiv && this.contentDiv.childNodes && this.contentDiv.childNodes.length > 0) {
                            this.contentDiv.removeChild(this.contentDiv.childNodes[0]);
                        }
                        if (this.configWidget) {
                            this.configWidget = null;
                        }
                        var componentId = message.cmpt.cmptId;
                        this.getComponentConfigModule(componentId).then(lang.hitch(this, function(response) {
                            if (response.data && response.data[0] && response.data[0].config_module && response.data[0].config_module.name) {
                                var config_module = response.data[0].config_module;

                                var widgetReady = this.Library.loadWidget(config_module.package, config_module.location, config_module.name);
                                when(widgetReady, lang.hitch(this, function(widgetModule) {
                                    this.configWidget = new widgetModule();
                                    if (this.configWidget.startup) {
                                        this.configWidget.startup();
                                    }
                                    this.contentDiv.appendChild(this.configWidget.domNode);
                                }));
                            } else {

                                var objLabel = dojo.create("label", {
                                    innerHTML: "当前组件没有可配置的公共参数。"
                                });
                                this.contentDiv.appendChild(objLabel);
                            }
                        }));
                    }));
                },
                getComponentConfigModule: function(componentId) {
                    var _url = AppCommon.Component + "/" + componentId;
                    return xhr.get(_url, {
                        handleAs: "json"
                    });
                },
                startup: function() {
                    this.inherited(arguments);
                    this.setupSubscribe();
                },

                reset: function() {

                },

                resize: function() {},

                destroy: function() {

                    this.inherited(arguments);


                }
            });
    });
