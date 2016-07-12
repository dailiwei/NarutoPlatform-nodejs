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

], function (declare, lang, array, connect, Point,PlotUtil) {
    var clazz = declare([], {
        ldddddd: null,
        rdddddd: null,
        edddddd: null,
        two0odddddd: null,
        lfto0odddddd: null,
        rgto0odddddd: null,
        tpco0odddddd: null,
        btco0odddddd: null,
        arwvo0odddddd: null,
        doveTailPoint: null,
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
        headHeightFactor: 0.15,
        headWidthFactor: 0.4,
        neckHeightFactor: 0.75,
        neckWidthFactor: 0.15,
        tailWidthFactor: 0.1,
        swallowTailFactor: 1,
        headRightPnt: Point,
        neckPnt: Point,
        tailPnt: Point,
        tailLeftPnt: Point,
        tailRightPnt: Point,
        getPoints: function (points) {
            var _loc_1 = points.length;
            if (_loc_1 >= 2 && points[(_loc_1 - 1)] != points[_loc_1 - 2])
            {

                return PlotUtil.getArrowPlot(points, true, this.swallowTailFactor, PlotUtil.USE_BSPLINE_FIT, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor, this.tailWidthFactor);
            
            }
            return null;
        }

    });
    return clazz;
});