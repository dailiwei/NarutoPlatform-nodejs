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
        ldddddd: null,
        rdddddd: null,
        edddddd: null,
        two0odddddd: null,
        lfto0odddddd: null,
        rgto0odddddd: null,
        tpco0odddddd: null,
        btco0odddddd: null,
        arwvo0odddddd: null,
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
          headHeightFactor :0.15,
      headWidthFactor: 0.4,
      neckHeightFactor : 0.75,
      neckWidthFactor:0.15,
      tailWidthFactor: 0.1,
      headRightPnt:null,
      neckPnt:null,
        getPoints: function(points) {
            this.createControlPoints(points);

            var _loc_1 = points.length;
            if (_loc_1 >= 2 && points[(_loc_1 - 1)] != points[_loc_1 - 2])
            {
                return PlotUtil.getArrowPlot(points, false, 0, PlotUtil.USE_BSPLINE_FIT,
                    this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                    this.neckWidthFactor, this.tailWidthFactor);
            }
            return null;
        } ,
        createControlPoints:function (points){
            var _loc_1 = PlotUtil.getBaseLength( points);
            var _loc_2 = _loc_1 * this.headHeightFactor;
            var _loc_3 = _loc_2 * this.headWidthFactor;
            var _loc_4 =  points.length;
            var _loc_5 =  points[(_loc_4 - 1)];
            var _loc_6 = PlotUtil.distance(_loc_5,  points[_loc_4 - 2]);
            _loc_2 = _loc_2 > _loc_6 ? (_loc_6) : (_loc_2);
            var _loc_7 = _loc_2 * this.neckHeightFactor;
            var _loc_8 = PlotUtil.getThirdPoint( points[_loc_4 - 2], _loc_5, 0, _loc_2, PlotUtil.LEFT_SIDE);
            var _loc_9 = PlotUtil.getThirdPoint( points[_loc_4 - 2], _loc_5, 0, _loc_7, PlotUtil.LEFT_SIDE);
            var _loc_10 = PlotUtil.getThirdPoint(_loc_5, _loc_8, Math.PI * 1.5, _loc_3, PlotUtil.LEFT_SIDE);
            this.headRightPnt = _loc_10;
            this.neckPnt = _loc_9;
            return;
        }

    });
    return clazz;
});