/**
 * Created by NarutoGIS on 15/3/4.
 *//**
 * Created by richway on 2015/3/4.
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

        },
       headHeightFactor:  0.15,
       headWidthFactor: 0.4,
       neckHeightFactor: 0.75,
       neckWidthFactor: 0.15,
       tailWidthFactor: 0.1,
       swallowTailFactor: 1,
       headRightPnt:null,
       neckPnt:null,
       swallowTailPnt:null,
        plotState:"drawing",
        getPoints: function(points) {
            var point2  = null;
            var point3  = null;
            var point4  = null;
            var arry1  = null;
            var arry2  = null;
            var point7  = null;
            var point8  = null;
            var num  = NaN;
            var num1  = NaN;
            var num2  = NaN;
            var arry3  = null;
            var arry4  = null;
            var arry5  = null;
            var arry6  = null;
            var arry7  = null;
            var  count = points.length;
            if ( count >= 3 && points[( count - 1)] != points[ count - 2])
            {
                point2 = points[0];
                point3 = points[1];
                point4 = PlotUtil.getMidPoint(point2, point3);
                arry1 = [point4];
                arry1 = arry1.concat(points.slice(2));
                arry2 = PlotUtil.getArrowHeadPoints(arry1, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor);
                point7 = arry2[0];
                point8 = arry2[4];
                num = PlotUtil.getBaseLength(arry1);
                num1 = PlotUtil.distance(point2, point3);
                num2 = num1 / 2 / num;
                arry3 = PlotUtil.getArrowBodyPoints(arry1, point7, point8, num2);
                if (this.plotState == "drawing")
                {
                    this.swallowTailPnt = PlotUtil.getThirdPoint(arry1[1], arry1[0], 0, num * this.tailWidthFactor * this.swallowTailFactor, PlotUtil.LEFT_SIDE);
                }
                 count = arry3.length;
                arry4 = arry3.slice(0,  count / 2);
                arry5 = arry3.slice( count / 2,  count);
                arry4.push(point7);
                arry5.push(point8);
                arry4 = arry4.reverse();
                arry4.push(point2);
                arry5 = arry5.reverse();
                arry5.push(point3);
                arry4 = PlotUtil.getBSplinePoints(arry4);
                arry5 = PlotUtil.getBSplinePoints(arry5);
                arry6 = arry4.reverse().concat(arry2, arry5);
                arry6.push(this.swallowTailPnt);
                return arry6;
            }

            return null;
        }

    });
    return clazz;
});