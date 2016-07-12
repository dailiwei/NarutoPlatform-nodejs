/**
 * Created by dailiwei on 16/4/11.
 * map plugin类型的基类，抽取公共代码资源。负责构造map,部件位置的指定，显示等
 */

define([
        'dojo/_base/declare',
        'dojo/on',
        'base/_BaseWidget',
        "dijit/_TemplatedMixin",
        'dijit/_WidgetsInTemplateMixin'
    ],
    function (declare,
              on,
              BaseWidget,
              _TemplatedMixin,
              _WidgetsInTemplateMixin
    ) {
        var clazz = declare([BaseWidget,_TemplatedMixin,_WidgetsInTemplateMixin], {
            templateString:"<div></div>",

            constructor:function(args){

            },
            postCreate:function(){
                this._initEvent();
            },

            _initEvent:function(){
                this.own(on(this.domNode,"click",this._selfClick))
            },

            //需要子去覆盖的
            _selfClick:function(e){

            }
        });
        return clazz;
    });