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
        "dojo/when",
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
        "dojo/text!./template/CommonWidgetConfig.css",
        "dojo/text!./template/CommonWidgetConfig.html",
        "base/admin/page/ConfigMixin",
        "dojo/domReady!"

    ],
    function(declare, when, lang, html, array, ready, topic, parser, JSLogger, domGeom, dom,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin, css,
        template, ConfigMixin
        //, CommonWidgetConfig1
    ) {
        ready(function() {
            // Call the parser manually so it runs after our widget is defined, and page has finished loading
            parser.parse();

        });
        return declare(
            "base.admin.page.CommonWidgetConfig", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin, ConfigMixin], {
                id: null,
                parentWidgetId: null,
                callbackParameters: {},
                templateString: template,
                parameters: null,
                showButton: true,
                showBreadcrumb: true,
                regionIndex: null,
                widgetIndex: null,
                validateObjArray: [],
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";

                    this._logger = new JSLogger({
                        name: "CommonWidgetConfig"
                    });
                    this._logger.traceEntry(fn);
                    this.callbackParameters = {};
                    lang.mixin(this, kwArgs);
                    lang.mixin(this.callbackParameters, kwArgs); //将当前的参数传到下一级的widget当中用于返回的时候处理
                    this.setCss(css);

                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid();
                    }
                    this.addCallbackTopic = "";
                    this.modifyCallbackTopic = "";
                    //   this.widget = null;
                    this._logger.traceExit(fn);
                },

                postCreate: function() {

                    this.inherited(arguments);
                    this.addCallbackTopic = "/rich/base/admin/page/CommonConfig/add/" + this.id;
                    this.modifyCallbackTopic = "/rich/base/admin/page/CommonConfig/modify/" + this.id;
                    this.setupSubscribe();





                },
                getCurrentWidget: function() {
                    this.updateCurrentWidget();
                    return this.widget;
                },
                setupSubscribe: function() {
                    //从addwidgetdialog处得到添加widget的更新
                    var addSub = topic.subscribe(this.addCallbackTopic, lang.hitch(this, function(message) {

                        var _widget = message.widget;
                        _widget.order = this.regionsVm.regionArray[message.regionIndex].widgets.length;
                        this.regionsVm.regionArray[message.regionIndex].widgets.push(_widget);
                        _widget = {};
                        avalon.scan(this.domNode);


                    }));
                    // this.own(addSub);
                    var modifySub = topic.subscribe(this.modifyCallbackTopic, lang.hitch(this, function(message) {

                        var _widget = message.widget;
                        // this.regionsVm.regionArray[message.regionIndex].widgets.set(message.widgetIndex,_widget);
                        // TODO  这里有问题，用直接更新或者set的方法，avalon都没有办法更新视图，只能删了重加，会引起顺序的改变
                        this.regionsVm.regionArray[message.regionIndex].widgets.removeAt(message.widgetIndex);
                        this.regionsVm.regionArray[message.regionIndex].widgets.push(_widget);
                        // this.regionsVm.regionArray[message.regionIndex].widgets[message.widgetIndex] =_widget;
                        // this.regionsVm.regionArray[message.regionIndex].widgets[message.widgetIndex]["#name"] = _widget.parameters.i18nLabel;
                        _widget = {};
                        avalon.scan(this.domNode);
                        this.regionsVm.regionArray[message.regionIndex].widgets.sort(function(obj1, obj2) {
                            return obj1.order > obj2.order;
                        });


                        //   topic.publish(this.callbackTopic, this.callbackParameters);
                    }));
                    // this.own(modifySub);
                },
                updateCurrentWidget: function() {

                    this.widget.regionArray = this.regionsVm.$model.regionArray;
                    var tempParameters = lang.clone(this.parametersVM.$model);
                    var _template = this.widget["#parametersMeta"];
                    if (_template) {
                        for (var p in _template) {
                            if (_template[p].inputType == "object") {
                                tempParameters[p] = JSON.parse(tempParameters[p]);
                            };
                        }
                    };

                    this.widget.parameters = tempParameters;
                },
                saveWidget: function() {
                    this.updateCurrentWidget();
                    this.callbackParameters.widget = this.widget;
                    this.callbackParameters.regionIndex = this.regionIndex;
                    this.callbackParameters.widgetIndex = this.widgetIndex;

                    topic.publish(this.callbackTopic, this.callbackParameters);

                    this.closeModal();




                    this.destroy();
                },

                initAvalon: function() {

                    topic.publish(this.changeBreadCrumbCallbackTopic, {
                        "mode": "add",
                        "title": (this.widget.parameters && (this.widget.parameters.i18nLabel || this.widget.parameters.label)) ? this.widget.parameters.i18nLabel || this.widget.parameters.label : this.widget["#name"]
                    });


                    function isEmpty(obj) {
                        for (var name in obj) {
                            return false;
                        }
                        return true;
                        // body...
                    }
                    var _parameter = this.widget.parameters;
                    var emptyRegion = isEmpty(this.widget.regions);
                    var emptyParam = isEmpty(_parameter);
                    var onlyRegion = false;
                    if (!emptyParam && _parameter.region) {
                        var _obj = lang.clone(_parameter);
                        delete _obj.region;
                        if (_obj.selectedIcon) {
                            delete _obj.selectedIcon;
                        };
                        onlyRegion = isEmpty(_obj);
                        _obj = null;

                    }

                    //  Logger.log(this.widget.parameters);


                    var CommonWidgetConfigVm = avalon.define({
                        $id: "CommonWidgetConfig" + this.id,
                        hasRegions: !emptyRegion,
                        showParam: !emptyParam,
                        showNoContent: emptyRegion && onlyRegion,
                        showButton: this.showButton,
                        showBreadcrumb: this.showBreadcrumb,
                        saveWidget: lang.hitch(this, function() {

                        }),
                        cancelWidget: lang.hitch(this, function() {
                            this.closeModal();



                            this.destroy();
                        })
                    });
                    // this.own(CommonWidgetConfigVm);

                    var _regionArray = this.widget.regionArray;
                    array.forEach(_regionArray, function(region) {
                        if (region.widgets) {
                            var _widgets = region.widgets;
                            for (var i = 0, _length = _widgets.length; i < _length; i++) {
                                if (!_widgets[i].order) {
                                    _widgets[i].order = i;
                                };

                            };
                        };


                    });
                    this.regionsVm = avalon.define({
                        $id: "ctrl_regions" + this.id,
                        regionArray: _regionArray,
                        getImage: function(imageUrl) {
                            var reg = /.*\.(jpg|png|gif|GIF|PNG|JPG)$/; // 判断是不是标准的图片的地址
                            return reg.test(imageUrl) ? imageUrl : APP_ROOT + "base/images/map_icons/icons/dark/facilityManagement.png";


                        },
                        remove: function(el, index) {

                            for (var i = index + 1, _length = el.widgets.length; i < _length; i++) {
                                el.widgets[i].order--;
                            };
                            el.widgets.removeAt(index);

                        },
                        move_left: lang.hitch(this, function(el, elm, index) {
                            elm.order--;
                            el.widgets[index - 1].order++;
                            el.widgets.sort(function(obj1, obj2) {
                                return obj1.order > obj2.order;
                            });
                        }),
                        move_right: lang.hitch(this, function(el, elm, index) {
                            elm.order++;
                            el.widgets[index + 1].order--;
                            el.widgets.sort(function(obj1, obj2) {
                                return obj1.order > obj2.order;
                            });
                        }),
                        openAddDialog: lang.hitch(this, function(regionItem, regionIndex) {
                            // Logger.log(regionItem);
                            if (this.newRegionItemDialog) {
                                this.newRegionItemDialog = null;
                            }
                            var _regionItem = regionItem.$model;

                            var widgetReady = this.Library.loadWidget("base", APP_ROOT + "base/js", "base/admin/page/AddWidgetDialog");
                            when(widgetReady, lang.hitch(this, function(widgetModule) {
                                if (this.newRegionItemDialog) {
                                    this.newRegionItemDialog = null;
                                }
                                this.newRegionItemDialog = new widgetModule({
                                    "container": this.widget.id,
                                    "parentWidgetId": this.id,
                                    "allow_types": _regionItem.widget_types,
                                    "regionIndex": regionIndex,
                                    "region": _regionItem.region_id,
                                    "selectedComponents": this.selectedComponents,
                                    "selectedWidgets": this.selectedWidgets,
                                    "callbackTopic": this.addCallbackTopic,
                                    "changeBreadCrumbCallbackTopic": this.changeBreadCrumbCallbackTopic
                                });
                                // this.own(this.newRegionItemDialog);

                                domConstruct.place(this.newRegionItemDialog.domNode, this.modalContent);
                                if (this.newRegionItemDialog.startup) {
                                    this.newRegionItemDialog.startup();
                                }
                                avalon.scan(this.newRegionItemDialog.domNode);
                                this.openModal();
                            }));






                            // this.newRegionItemDialog = new AddWidgetDialog({
                            //     "container": this.widget.id,
                            //     "parentWidgetId": this.id,
                            //     "allow_types": _regionItem.widget_types,
                            //     "regionIndex": regionIndex,
                            //     "region": _regionItem.region_id,
                            //     "selectedComponents": this.selectedComponents,
                            //     "selectedWidgets": this.selectedWidgets,
                            //     "callbackTopic": this.addCallbackTopic,
                            //     "changeBreadCrumbCallbackTopic": this.changeBreadCrumbCallbackTopic
                            // });
                            // this.modalContent.appendChild(this.newRegionItemDialog.domNode);
                            // this.newRegionItemDialog.startup();
                            // this.openModal();
                        }),
                        //打开编辑窗口
                        openModifyDialog: lang.hitch(this, function(widget, regionIndex, widgetIndex) {


                            var widgetReady = this.Library.loadWidget("base", APP_ROOT + "base/js", "base/admin/page/CommonWidgetConfig");
                            when(widgetReady, lang.hitch(this, function(widgetModule) {
                                if (this.openedWidget) {
                                    this.openedWidget = null;
                                }
                                this.openedWidget = new widgetModule({
                                    "parentWidgetId": this.id,
                                    "widget": widget.$model || widget,
                                    "selectedComponents": this.selectedComponents,
                                    "selectedWidgets": this.selectedWidgets,
                                    "regionIndex": regionIndex.$index,
                                    "widgetIndex": widgetIndex,
                                    "callbackTopic": this.modifyCallbackTopic,
                                    "changeBreadCrumbCallbackTopic": this.changeBreadCrumbCallbackTopic
                                });
                                // this.own(this.openedWidget);
                                if (this.openedWidget.startup()) {
                                    this.openedWidget.startup();
                                }

                                domConstruct.place(this.openedWidget.domNode, this.modalContent);
                                if (this.openedWidget.initAvalon()) {
                                    this.openedWidget.initAvalon();
                                }
                                avalon.scan(this.openedWidget.domNode);
                                this.openModal();
                            }));


                        })
                    });

                    // this.own(this.regionsVm);

                    var tempParameters = lang.clone(this.widget.parameters);

                    for (var p in tempParameters) {
                        if (typeof tempParameters[p] == "object") {
                            tempParameters[p] = JSON.stringify(tempParameters[p]);
                        };

                    }
                    if (this.widget && this.widget["#parametersMeta"]) {
                        var tempParametersMeta = lang.clone(this.widget["#parametersMeta"]);
                        for (var p in tempParametersMeta) {
                            var pObj = tempParametersMeta[p];
                            if (pObj && pObj.rules) {
                                var validateObj = {
                                    "name": "bp_" + p,
                                    "display": pObj.displayLabel ? pObj.displayLabel : p,
                                    "rules": pObj.rules
                                };
                                this.validateObjArray.push(validateObj);
                            }
                        }
                    }

                    var binds = {

                        changeProp: lang.hitch(this, function(args) {
                            //TODO 此处this 传的不对，这种写法很恶心

                            this.parametersVM[args.nm] = this.parametersVM[args.nm] + (args.op == "add" ? 1 : -1);
                            //TODO 这里应该跟规则的range 范围绑定 , 为了bug 295 先改成不允许为负
                            if (this.parametersVM[args.nm] < 0) {
                                this.parametersVM[args.nm] = 0;
                            }

                        })
                    }

                    var testEvent = function(event) {
                        event = event || window.event;
                        var src = event.srcElement || event.target;
                        var bind, args = {};
                        while (src && src !== event.currentTarget.parentNode && src.tagName.toLowerCase() != "body") {
                            var attrs = src.attributes;
                            if (attrs) {
                                for (var i = 0, l = attrs.length; i < l; i++) {
                                    var nm = attrs[i].name;
                                    if (nm.indexOf("event") == 0) {
                                        var words = nm.split("-");
                                        if (words[1] == "args") {
                                            args[words[2]] = attrs[i].value;
                                        } else if (!bind && words[1] == event.type) {
                                            bind = attrs[i].value;
                                        }
                                    }
                                }
                            }
                            src = src.parentNode;
                        }

                        if (bind && typeof binds[bind] === "function")
                            binds[bind].apply(this, [args]);
                        if (event.stopPropagation) {
                            //W3C取消冒泡事件
                            event.stopPropagation();
                        } else {
                            //IE取消冒泡事件
                            event.cancelBubble = true;
                        }
                    }

                    // this.own(testEvent);

                    var vm = lang.mixin({
                        $id: "ctrl_parameters" + this.id
                    }, tempParameters);
                    vm.event = lang.hitch(function() {
                        return testEvent.apply(this.parametersVM, arguments);
                    });
                    this.parametersVM = avalon.define(vm);
                    if (tempParameters && tempParameters.i18nLabel) {
                        this.parametersVM.$watch("i18nLabel", lang.hitch(this, function(newValue) {
                            topic.publish(this.changeBreadCrumbCallbackTopic, {
                                "mode": "modify",
                                "title": newValue
                            });

                        }));
                    }
                    // this.own(this.parametersVM);
                    this.createLayout();
                    this.validateForm("commonForm" + this.id, this.validateObjArray, "saveWidget");
                    avalon.scan(this.domNode);



                },
                createLayout: function() {
                    //根据parameter里面的数据项生成界面的layout
                    for (var p in this.widget.parameters) {
                        if (p == "region") {
                            continue;
                        };
                        var htmlString = "";
                        var widgetTemplate = {};
                        if (this.widget["#parametersMeta"] && this.widget["#parametersMeta"][p]) {
                            widgetTemplate = this.widget["#parametersMeta"][p];
                        }

                        if (!widgetTemplate) { //TODO 补全
                            continue;
                        }
                        var labelString = widgetTemplate.displayLabel;
                        switch (widgetTemplate.inputType) {
                            case "textbox":
                                htmlString = "<div class=\"form-group\"> <label class=\"col-sm-4 form-label\" for=\"bp_" + p + "\">" + labelString + "：</label>  <div class=\"col-sm-8\"> <input type=\"text\" ms-duplex=\"" + p + "\" class=\"form-control\" id=\"bp_" + p + "\" /> </div>";
                                break;

                            case "radio":
                                var radioString = "<ul style=\"list-style: none;\"> ";
                                if (widgetTemplate.data) {
                                    for (var i = 0; i < widgetTemplate.data.length; i++) {
                                        radioString += "<li style=\"width:50px; float: left\"> <input type=\"radio\" value=\"" + widgetTemplate.data[i] + "\" ms-duplex-string=\"" + p + "\" name=\"bp_" + p + "\" />" + widgetTemplate.data[i] + " </li>";
                                    }
                                } else {
                                    radioString += "<li style=\"width:50px; float: left\"> <input type=\"radio\" value=true ms-duplex-string=\"" + p + "\" name=\"bp_" + p + "\" />是</li>";
                                    radioString += "<li style=\"width:50px; float: left\"> <input type=\"radio\" value=false ms-duplex-string=\"" + p + "\" name=\"bp_" + p + "\" />否 </li>";
                                };

                                radioString += "</ul>";
                                htmlString = "<div class=\"form-group\"><label for=\"bp_" + p + "\" class=\"form-label col-sm-4\">" + labelString + "：</label> <div class=\"col-sm-8 radio\"> " + radioString + "</div> </div>"

                                break;
                            case "select":
                                var selectString = "<select  ms-duplex=\"" + p + "\" class=\"form-control\"  name=\"bp_" + p + "\">";
                                if (widgetTemplate.data) {
                                    for (var i = 0; i < widgetTemplate.data.length; i++) {
                                        var _value = widgetTemplate.data[i];
                                        selectString += "<option  value=\"" + _value + "\">" + _value + "</option>";
                                    }
                                };

                                selectString += "</select>";



                                htmlString = "<div class=\"form-group\"><label for=\"bp_" + p + "\" class=\"form-label col-sm-4\">" + labelString + "：</label> <div class=\"col-sm-8 \"> " + selectString + "</div> </div>"

                                break;
                            case "checkbox":
                                htmlString = "<div class=\"form-group\"> <label class=\"col-sm-4 form-label\" for=\"bp_" + p + "\">" + labelString + "：</label>  <div class=\"col-sm-8\"> <input type=\"checkbox\" ms-duplex-checked=\"" + p + "\" class=\"checkbox\"  id=\"bp_" + p + "\"/>  </div>";
                                break;
                            case "textarea":
                                htmlString = "<div class=\"form-group\"> <label class=\"col-sm-4 form-label\" for=\"bp_" + p + "\">" + labelString + "：</label>  <div class=\"col-sm-8\"> <textarea  ms-duplex=\"" + p + "\" class=\"form-control\"  id=\"bp_" + p + "\"  rows=\"5\"> </textarea>  </div>";
                                break;
                            case "image": //TODO 图片
                                htmlString = "<div class=\"form-group\"> <label class=\"col-sm-4 form-label\" for=\"bp_" + p + "\">" + labelString + "：</label>  <div class=\"col-sm-8\"> <input type=\"text\" ms-duplex=\"" + p + "\" class=\"form-control\" id=\"bp_" + p + "\" /> </div>";
                                break;
                            case "datarange":
                                htmlString = "<div class=\"form-group\">         <label for=\"\" class=\"form-label col-sm-4\">" + labelString + "：</label>        <div class=\"col-sm-8\">          <div class=\"input-group spinner\">           <input type=\"text\" class=\"form-control\" ms-duplex-number=\"" + p + "\"  />           <div class=\"input-group-btn-vertical\">            <button class=\"btn btn-default\" type=\"button\" event-args-nm=\"" + p + "\" event-args-op=\"add\" event-click=\"changeProp\"><i class=\"fa fa-caret-up\"></i></button>            <button class=\"btn btn-default\" type=\"button\" event-args-nm=\"" + p + "\" event-args-op=\"reduce\" event-click=\"changeProp\"><i class=\"fa fa-caret-down\"></i></button>           </div>          </div>         </div>         </div>";
                                break;
                            case "object":
                                htmlString = "<div class=\"form-group\"> <label class=\"col-sm-4 form-label\" for=\"bp_" + p + "\">" + labelString + "：</label>  <div class=\"col-sm-8\"> <textarea  ms-duplex=\"" + p + "\" class=\"form-control\"  id=\"bp_" + p + "\"  rows=\"5\"> </textarea>  </div>";
                                break;
                            default:
                                break;
                        }

                        $("#" + this.id + " .common_widget_parameters").append(htmlString);
                    }
                },

                startup: function() {





                },

                reset: function() {

                },

                resize: function() {},

                destroy: function() {
                    topic.publish(this.changeBreadCrumbCallbackTopic, {
                        "mode": "remove"

                    });
                    this.inherited(arguments);
                    if (avalon.vmodels["CommonWidgetConfig" + this.id]) {
                        delete avalon.vmodels["CommonWidgetConfig" + this.id];
                    }
                    if (avalon.vmodels["ctrl_parameters" + this.id]) {
                        delete avalon.vmodels["ctrl_parameters" + this.id];
                    }
                    if (avalon.vmodels["ctrl_regions" + this.id]) {
                        delete avalon.vmodels["ctrl_regions" + this.id];
                    }
                    this.regionIndex = null;
                    this.widgetIndex = null;
                    this.selectedWidgets = null;
                    this.selectedComponents = null;
                    this.openedWidget = null;
                    this.newRegionItemDialog = null;
                    this.regionsVm = null;
                    this.parametersVM = null;
                    this.callbackParameters = null;
                    //this.destroyRecursive();
                }
            });
    });
