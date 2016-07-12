/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2013 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 */
define([
    "dojo/_base/array", // array.filter, array.forEach, array.some
    "dojo/_base/declare",
    "dojo/_base/lang", // lang.getObject, lang.hitch, lang.setObject
    "dojo/topic",
    "base/JSLogger",
    "base/Library",
    "base/admin/AppCommon",
    "base/utils/commonUtils"
], function(
    array,
    declare,
    lang,
    topic,
    JSLogger,
    Library,
    AppCommon,
    commonUtils) {
    return declare("base.admin.page.ConfigMixin", null, {


        constructor: function(args) {
            this._logger = new JSLogger({
                name: "ConfigMixin"
            });


            declare.safeMixin(this, args);

            this.Library = new Library();
            this.getWidgetsUrl = "";

        },
        // createWidgetContainer: function(id) {
        //     var _div = document.createElement('div');
        //     _div.id = "configWidget" + id;
        //     var layoutContainer = document.getElementsByClassName("layoutContainer")[0];
        //     _div.style.width = layoutContainer.offsetWidth;
        //     _div.style.height = layoutContainer.offsetHeight;
        //     //_div.style.height = document.documentElement.offsetHeight - 50 - 41 * 2 - 5;
        //     _div.style.display = "block";
        //     _div.style.position = "absolute";
        //     _div.style.left = 0;
        //     _div.style.top = 0;
        //     layoutContainer.appendChild(_div);
        // },
        openModal: function() {
            // body...

            var currentModalId = "#modalDiv" + this.id;
            $(currentModalId).css({
                opacity: 1
            });
            $(currentModalId).css("background-color", "#fff");
            $(currentModalId).css("position", "absolute");
            $(currentModalId).css("left", 0);
            $(currentModalId).css("top", 0);
            var pageLayoutConfig = document.getElementsByClassName("PageLayoutConfig")[0];
            // Logger.log("page layout config width and height");
            // Logger.log(pageLayoutConfig.offsetWidth);
            // Logger.log(pageLayoutConfig.offsetHeight);
            $(currentModalId).css("right", 0);
            $(currentModalId).css("bottom", 0);
           // $(currentModalId).css("overflow", "auto");
            // $(currentModalId).css("width", pageLayoutConfig.offsetWidth+"px");

            // $(currentModalId).css("height", pageLayoutConfig.offsetHeight-36+"px");
            $(currentModalId).css("z-index", this.getMaxZIndex() + 10);
            // var parentModalId = "#modalDiv" + this.parentWidgetId;
            // var parentModal = $(parentModalId);
            // if (parentModal) {
            //     parentModal.css("display","none");
            // };
            this.goTop();
        },
        closeModal: function() {
            // body...
            var parentModalId = "#modalDiv" + this.parentWidgetId;
            $(parentModalId).removeAttr("style");
            $(parentModalId + ">div").empty();
            this.goTop();

        },

        getWdigetsLists: function(componentList) {
            var url;
            if (window.testApp) {
                url = APP_ROOT + "base/data/app_comps_widgets_list.json";
            } else {
                url = AppCommon.getWidgetsByComponents;
            }
            // url = APP_ROOT+"base/data/app_comps_widgets_list.json";
            var dataObj = {
                "sqlid": "com.ibm.rich.framework.persistence.CfgWidgetMapper.getWidgetsByArrayCmptId",
                "array": componentList ? componentList : []
            };
            var dataStr = JSON.stringify(dataObj);
            return commonUtils.post(url, dataStr).then(lang.hitch(this, function(json) {
                return json.data;
            }));
        },
        goTop: function() {
            // body...
            $('body,html').animate({
                scrollTop: 0
            }, 500);
        },
        getMaxZIndex: function() {
            //TODO move common method to Mixin
            return Math.max.apply(null, $.map($('.PageLayoutConfig div[style]'), function(e, n) {

                return parseInt($(e).css('zIndex')) || 1;
            }));
        }

























    });
});
