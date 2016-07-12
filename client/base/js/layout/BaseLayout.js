/**
 * Created by dailiwei on 16/4/11.
 * layout类型的基类，抽取公共代码资源。
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/html",
    "dojo/on",
    "base/Library",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin"
], function (declare,
             lang,
             domConstruct,
             html,
             on,
             Library,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin
) {

    return declare("base.layout.BlankLayout", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString:"<div style='width: 100%;height: 100%'></div>",

        _library: null,

        isResize:false,
        manual:null,

        constructor: function (args) {
            this._library = new Library();
        },

        placeAt: function (divId) {
            var main = dojo.byId(divId);
            domConstruct.place(this.domNode, main);
        },

        postCreate:function() {
            this.inherited(arguments);

        },
        startup: function () {
            this.inherited(arguments);
            this.own(on(window, 'resize', lang.hitch(this, this.resize)));
        },

        resize: function () {

        },

        destroy:function(){
            this.inherited(arguments);
        }


    });
});