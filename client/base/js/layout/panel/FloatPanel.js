/**
 * Created by richway on 2015/6/3.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/_base/html",
    "dojo/dom",
    "dojo/_base/xhr",
    "dojo/topic",
    "dojo/text!../template/FloatPanel.html",
    "dojo/text!../css/TabPanel.css",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dojo/parser",
    "dojo/ready",
    "base/Library",
    "dojo/Deferred",
    'dojo/_base/fx',
    'dojo/on',
    'dojo/query',
    'rdijit/utils',
    'dojo/mouse',
    'dojo/fx',
    'dojo/dnd/move'

],function(
    declare,
    lang,
    array,
    domConstruct,
    domStyle,
    html,
    dom,
    xhr,
    topic,
    template,
    css,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ContentPane,
    parser,
    ready,
    Library,
    Deferred,
    baseFx,
    on,
    query,
    utils,
    mouse,
    fx,
    Move
){

    return declare("base.layout.panel.FloatPanel", [_WidgetBase, _TemplatedMixin], {
        templateString:template,

        constructor:function(args){
            lang.mixin(this,args);

            this.titleName = this.title;
        },

        postCreate:function() {
            this.inherited(arguments);
        },
        addWidget:function(domNode){
            domConstruct.place(domNode, this.widgetContainer);
        },
        startup: function(){
            this.inherited(arguments);

            //设置成可拖拽
            this.makeMable4This();
        },
        makeMable4This:function(){
            //添加可拖拽
            this.makePositionInfoBox();
            var handleNode = this.createHandleNode();
            this.makeMoveable(handleNode, this._positionInfoBox.w, this._positionInfoBox.w * 0.25);
        },
        disableMoveable: function() {
            if (this.moveable) {
                this.moveable.destroy();
                this.moveable = null;
            }
        },
        moveable:null,
        makeMoveable: function(handleNode, width, tolerance) {
            this.disableMoveable();
            var containerBox = html.getMarginBox("main");
            containerBox.l = containerBox.l - width + tolerance;
            containerBox.w = containerBox.w + 2 * (width - tolerance);

            this.moveable = new Move.boxConstrainedMoveable(this.domNode, {
                box: containerBox,
                handle: handleNode || this.titleNode,
                within: true
            });
            this.own(on(this.moveable, 'Moving', lang.hitch(this, this.onMoving)));
            this.own(on(this.moveable, 'MoveStop', lang.hitch(this, this.onMoveStop)));
        },
        onMoving: function(mover) {
            html.setStyle(mover.node, 'opacity', 0.9);
        },
        onMoveStop: function(mover) {
            html.setStyle(mover.node, 'opacity', 1);
            var panelBox = html.getMarginBox(mover.node);
            var _pos = {
                left: panelBox.l,
                top: panelBox.t,
                width: panelBox.w,
                height: panelBox.h
            };

            this._normalizePositionObj(lang.clone(_pos));
            this.makePositionInfoBox();
        },
        _normalizePositionObj: function(position) {
            var layoutBox = this._getLayoutBox();
            position.left = position.left || layoutBox.w - position.right;
            position.top = position.top || layoutBox.h - position.bottom;

            delete position.right;
            delete position.bottom;
            this.position = lang.mixin(lang.clone(this.position), position);
        },
        _getLayoutBox: function() {
            var pid = "main";
            return html.getMarginBox(pid);
        },
        _positionInfoBox:null,
        makePositionInfoBox: function() {
            this._positionInfoBox = {
                w: this.position.width || 400,
                h: this.position.height || 400,
                l: this.position.left || 0,
                t: this.position.top || 0
            };
        },
        createHandleNode: function() {
            return this.titleContainer;
        },
        _closeSelf:function(evt){

            baseFx.animateProperty(
                {
                    node:this.domNode ,
                    properties: {
                        opacity: {start: 1, end: 0}
                    },
                    duration: 300,
                    onEnd: lang.hitch(this,function(){
                        html.setStyle(this.domNode, 'display', 'none');

                    })
                }).play();
        }


    });
});