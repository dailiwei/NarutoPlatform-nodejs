/**
 * Created by dailiwei on 16/4/19.
 * map plugin Icon类型的基类，抽取公共代码资源。负责构造map,部件位置的指定，显示等
 */

define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        'base/map/dijit/utils',
        "base/utils/commonUtils",
        "./MapPlugin"
    ],
    function (declare,
              lang,
              html,
              utils,
              commonUtils,
              MapPlugin
    ) {
        var clazz = declare([MapPlugin], {
            templateString:"<div></div>",

            icons:{},
            constructor:function(args){

            },
            postCreate:function(){
                this.inherited(arguments);
                this.uuid = commonUtils.UUID();
                this.icons[lang.clone(this.uuid)]="----";
                if(this.parameters.position){
                    this.setPosition(this.parameters.position);
                }else{
                    if(this.position){
                        Logger.log("需要配置position,使用默认配置");
                        this.setPosition(this.position);
                    }else{
                        Logger.log("无配置position,无默认配置,隐藏了哦");
                        html.setStyle(this.domNode,"display","none");
                    }

                }
            },
            startup:function(){
                this.inherited(arguments);

            },
            setPosition: function(position){
                this.position = position;
                var style = utils.getPositionStyle(this.position);
                style.position = 'absolute';

                html.setStyle(this.domNode, style);

                this.resize();
            },

            getPosition: function(){
                return this.position;
            },
            resize:function(){

            },
            destroy:function(){

                delete this.icons[this.uuid];//删除当前的

                this.inherited(arguments);
            }
        });
        return clazz;
    });