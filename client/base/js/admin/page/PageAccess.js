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
        "dojo/promise/all",
        "dojo/request/xhr",
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
        "dojo/text!./template/PageAccess.css",
        "dojo/text!./template/PageAccess.html",


        "base/admin/page/ConfigMixin",
        'base/admin/AppCommon',
        "base/utils/commonUtils"

    ],
    function(declare, lang, array, JSON, ready,
        all, xhr, when, topic, parser, JSLogger,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin, css,
        template, ConfigMixin, AppCommon, commonUtils) {
        ready(function() {
            // Call the parser manually so it runs after our widget is defined, and page has finished loading
            parser.parse();
        });
        return declare(
            "base.admin.page.PageAccess", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin, ConfigMixin], {
                templateString: template,
                id: null,
                appId: null,
                pageId: null,

                showButton: false,
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";

                    this._logger = new JSLogger({
                        name: "PageAccess"
                    });
                    this._logger.traceEntry(fn);

                    lang.mixin(this, kwArgs);
                    this.setCss(css);

                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid();
                    }


                    this._logger.traceExit(fn);
                },

                postCreate: function() {

                    this.inherited(arguments);







                },


                savePageAccess: function() {

                    var selectedGroupUrl = AppCommon.getCurrentPageAccess;
                    selectedGroupUrl = selectedGroupUrl.replace(/{appId}/i, this.appId);
                    selectedGroupUrl = selectedGroupUrl.replace(/{pageId}/i, this.pageId);
                    var _groupList = this.vm.selectedGroup;
                    var _groupObjArray = [];
                    array.forEach(_groupList, function(group) {
                        var _obj = {
                            "GRP": group,
                            "rAccess": true,
                            "cAccess": false,
                            "uAccess": false,
                            "dAccess": false

                        };
                        _groupObjArray.push(_obj);
                    });
                    var xhrArgs = {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(_groupObjArray),
                        handleAs: "json",
                        load: function(data) {

                        },
                        error: function(error) {

                            topic.publish("base/manager/message", {
                                state: "error",
                                title: "权限保存",
                                content: "<div> 页面权限保存失败</div>"
                            });
                        }
                    }

                    return xhr.put(selectedGroupUrl, xhrArgs);

                },
                startup: function() {
                    this.initAvalon();


                },
                initAvalon: function() {
                    //  var groupListUrl = APP_ROOT+"base/data/groupList.json";
                    var groupListUrl = AppCommon.getOrg;
                    var groupListDefer = xhr.get(
                        groupListUrl, {
                            handleAs: "json"
                        });

                    //this.listPropertyRangeUrl="/ibm/ife/api/cim-service/propertyRange?resourceType="+assetClassId;
                    //  var selectedGroupUrl = APP_ROOT+"base/data/selectedGroup.json";
                    var selectedGroupUrl = AppCommon.getCurrentPageAccess;
                    selectedGroupUrl = selectedGroupUrl.replace(/\{appId\}/i, this.appId);
                    selectedGroupUrl = selectedGroupUrl.replace(/\{pageId\}/i, this.pageId);
                    var selectedGroupDefer = xhr.get(
                        selectedGroupUrl, {
                            handleAs: "json"
                        });

                    all([groupListDefer, selectedGroupDefer]).then(lang.hitch(this, function(data) {
                        var groupList = data[0] && data[0].data ? data[0].data : [];
                        var selectedGroup = data[1] && data[1].data ? data[1].data : [];
                        var _selectedGroup = []; // 取读权限为真的分组，多做一次判断
                        _selectedGroup = array.filter(selectedGroup, function(group) {
                            return group.rAccess == true;

                        });
                        var _seletectedGroupId = [];
                        array.forEach(_selectedGroup, function(group) {
                            _seletectedGroupId.push(group.grp);
                        });
                        this.vm = avalon.define({
                            $id: "PageAccess" + this.id,
                            $groupList: groupList,
                            showButton: this.showButton,
                            selectedGroup: _seletectedGroupId,
                            "saveWidget": lang.hitch(this, function() {
                                this.savePageAccess();
                            })
                        });
                        avalon.scan(this.domNode);
                    }));

                },
                reset: function() {

                },

                resize: function() {},

                destroy: function() {

                    this.inherited(arguments);
                    delete avalon.vmodels["PageAccess" + this.id];

                }
            });
    });
