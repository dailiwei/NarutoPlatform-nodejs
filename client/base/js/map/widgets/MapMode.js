/*
 Richway dlw
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/text!./template/MapMode.html",
    "dojo/topic" ,
    "./MapPlugin"
], function (declare,
             lang,
             html,
             template,
             topic ,
             MapPlugin

) {
    return declare("base.map.widgets.MapMode", [MapPlugin], {
        templateString: template,

        //测量 放大，缩小，漫游，前后视图，全图）
        constructor: function (args) {
        },

        postCreate: function () { 
            this.inherited(arguments);
        }, 
        changeMode: function () { 
            topic.publish("gis/map/changeMapMode");
        }
        

    });
});