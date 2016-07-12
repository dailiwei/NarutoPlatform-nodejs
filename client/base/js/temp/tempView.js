///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway&IBM. All Rights Reserved.
// create by dailiwei 2015-10-08 16:22
///////////////////////////////////////////////////////////////////////////
define(
    ["dojo/_base/declare",
        "dojo/_base/lang",
        'dojo/_base/html',
        "dijit/_TemplatedMixin",
        "base/_BaseWidget"
    ],
    function (
        declare,
        lang,
        html,
        _TemplatedMixin,
        _Widget
    ) {

        return declare("base.temp.tempView",[_Widget, _TemplatedMixin],
            {
                templateString: '<div style="width:100%;height:100%;padding:0px;background-color:gray"></div>',
                name: "测试",

                color: "gray",
                constructor: function (args) {

                    if(args.parameters){
                        this.color = args.parameters.color ? args.parameters.color : this.color;
                    }
                },
                postCreate: function () {
                    this.inherited(arguments);
                    html.setStyle(this.domNode, "background-color", this.color);
                },

                startup: function () {
                    this.inherited(arguments);
                },
                destroy:function(){
                    this.color = null;

                    this.inherited(arguments);
                }

            });
    });