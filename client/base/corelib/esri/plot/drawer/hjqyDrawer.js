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
            var point2 = null;
            var point3 = null;
            var dis1 = NaN;
            var point5 = null;
            var point6 = null;
            var point7 = null;
            var point8 = null;
            var point9 = null;
            var point10 = null;
            var point11 = null;
            var point12 = null;
            
            var list = null;
            var lengthNum = points.length;
            if (lengthNum >= 2 && points[(lengthNum - 1)] != points[lengthNum - 2])
            {
                point2 = points[0];
                point3 = points[1];
                dis1 = PlotUtil.distance(point2, point3);
                point5 = PlotUtil.getMidPoint(point2, point3);
                point6 = PlotUtil.getThirdPoint(point2, point5, Math.PI * 1.5, dis1 / 4.5, PlotUtil.RIGHT_SIDE);
                point7 = PlotUtil.getThirdPoint(point2, point3, 0, dis1 * 0.8, PlotUtil.LEFT_SIDE);
                point8 = PlotUtil.getThirdPoint(point2, point7, Math.PI * 1.5, dis1 / 5, PlotUtil.LEFT_SIDE);
                point9 = PlotUtil.getThirdPoint(point2, point3, 0, dis1 * 0.45, PlotUtil.LEFT_SIDE);
                point10 = PlotUtil.getThirdPoint(point2, point9, Math.PI * 1.5, dis1 / 10, PlotUtil.LEFT_SIDE);
                point11 = PlotUtil.getThirdPoint(point2, point3, 0, dis1 * 0.15, PlotUtil.LEFT_SIDE);
                point12 = PlotUtil.getThirdPoint(point2, point11, Math.PI * 1.5, dis1 / 7, PlotUtil.LEFT_SIDE);
          
                list = [];
                list.push(point2, point6, point3, point12, point10, point8);
            
            }
            return PlotUtil.getAdvancedBezierPoints(list);
        }

    });
    return clazz;
});