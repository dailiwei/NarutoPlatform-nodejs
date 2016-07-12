define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        "dojo/topic",
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/on',
        'dojo/mouse',
        'dojo/query'
    ],
    function (declare, lang, html,topic, _WidgetBase, _TemplatedMixin,_WidgetsInTemplateMixin, on, mouse, query) {
        return declare("base.admin.dijit.CustomEditor",[_WidgetBase, _TemplatedMixin,_WidgetsInTemplateMixin], {

            templateString:
                '<div><div> <label><input id="checkNode" data-dojo-attach-point="checkNode2" type="checkbox"  checked> 允许</label></div> </div>'
                //'<div><input type="checkbox" checked data-toggle="toggle" data-dojo-attach-point="checkNode"/></div>'
             ,
            constructor: function () {
                this.inherited(arguments);
                //$('[type="checkbox"]').bootstrapSwitch();

            },
            postCreate: function () {
                this.inherited(arguments);

            },

            _setValueAttr: function (value) {
                if(value=="允许"){
                    this.checkNode2.checked = true;
                    //$('#checkNode').bootstrapSwitch('setState', true); //
                }else{
                    this.checkNode2.checked = false;

                    //$('#checkNode').bootstrapSwitch('setState', false); //
                }
            },
            _getValueAttr: function (value) {
                //alert(this.checkNode2.checked);
                topic.publish("base/admin/AppCompsSetting/UpdateField",this.checkNode2.checked)
                return  (this.checkNode2.checked);

            },
            focus: function () {
                //this.checkNode.focus();
                Logger.log("focus"+ this.checkNode2.checked);
                //$('#checkbox').bootstrapSwitch();
                //$('#checkbox').wrap('<div class="switch" />').parent().bootstrapSwitch();
            },
            startup:function(){
                this.inherited(arguments);
            }



        });
    });