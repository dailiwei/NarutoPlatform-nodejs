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
            var distanceNum = NaN;
            var x1 = NaN;
            var x2 = NaN;
            var x3 = NaN;
            var x4 = NaN;
            var list = null;
            var index = 0;
            var rings = null;
            var lengthNum = points.length;
            if (lengthNum >= 2 && points[(lengthNum - 1)] != points[lengthNum - 2])
            {
                point1 = points[0];
                point2 = points[1];
                distanceNum = PlotUtil.distance(point1, point2);
                list = [];
                index = 0;
                while (index < 100)
                {

                    x1 = Math.sin(Math.PI * 2 * index / 100);
                    x2 = Math.cos(Math.PI *  2* index / 100);
                    x3 = point1.x + distanceNum * x1;
                    x4 = point1.y + distanceNum * x2;
                    list.push(new Point(x3, x4));
                    index++;
                }
                return list.splice(0,list.length/2);
            }
        }

    });
    return clazz;
});