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

], function (declare, lang, array, connect, Point, PlotUtil) {
    var clazz = declare([], {
        headHeightFactor: 0.1,
        headWidthFactor: 1.2,
        neckHeightFactor: 1,
        neckWidthFactor: 0.7,
        tailWidthFactor:0.07,
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

        getPoints: function (points) {
            
            var count = points.length;
            if (count >= 2 && points[(count - 1)] != points[count - 2]) {
       
               return PlotUtil.getArrowPlot(points, false, 0, PlotUtil.USE_BSPLINE_FIT, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor, this.tailWidthFactor);
            }
            return null;
        }

    });
    return clazz;
});