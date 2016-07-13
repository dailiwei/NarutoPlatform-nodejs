/**
 * Created by dailiwei on 15/1/27.
 */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/connect',
    'esri/geometry/Point',
    './PlotUtil'
], function (declare, lang, array, connect,Point,PlotUtil) {
    var clazz = declare([], {

        constructor: function (heoo0ohe1) {
            if (this.id == null) {
                this.id = "ddddsdsdsds";//Giscafer.Util.createUniqueID(this.CLASS_NAME + _$[3])
            }
            //this.events = new Giscafer.Events(this, null, this.EVENT_TYPES);
            //if (this.eventListeners instanceof Object) {
            //    this.events.on(this.eventListeners)
            //};
            //this.map = map;
        },
        getPoints: function(points) {
            var point1 = null;
            var point2 = null;
            var point3 = null;
            var point4 = null;
            var point5 = null;
            var list = null; 
            var lengthNum = points.length;
            if (lengthNum >= 2 && points[(lengthNum - 1)] != points[lengthNum - 2])
            {
                point1 = points[0];
                point2 = points[1];
                point3 = new Point(point1.x, point2.y);
                point4 = PlotUtil.getMidPoint(point1, point3);
                point5 = new Point(point2.x, point4.y);
                list = [point3, point1, point5, point4];
            }
            return list;
        }

    });
    return clazz;
});