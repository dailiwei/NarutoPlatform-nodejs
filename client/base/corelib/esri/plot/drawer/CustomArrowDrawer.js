/**
 * Created by richway on 2015/3/4.
 */
/**
 * Created by NarutoGIS on 15/3/4.
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
        headHeightFactor: 0.15,
        headWidthFactor: 0.4,
        neckHeightFactor: 0.75,
        neckWidthFactor: 0.15,
        headRightPnt:null,
        neckPnt:null,
        getPoints: function(points) {
            var points11 = null;
            var points3 = null;
            var points4 = null;
            var arry  = null;
            var arry1  = null;
            var points5 = null;
            var points6 = null;
            var num  = NaN;
            var arry10  = null;
            var arry11  = null;
            var arry12  = null;
            var arry13  = null;
            var count = points.length;
            if (count >= 3 && points[(count - 1)] != points[count - 2])
            {
                points11 = points[0];
                points3 = points[1];
                points4 = PlotUtil.getMidPoint(points11, points3);
                arry = [points4];
                arry = arry.concat(points.slice(2));
                arry1 =  PlotUtil.getArrowHeadPoints(arry, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor);
                points5 = arry1[0];
                points6 = arry1[4];
                num =  PlotUtil.distance(points11, points3) / 2 /  PlotUtil.getBaseLength(arry);
                arry10 =  PlotUtil.getArrowBodyPoints(arry, points5, points6, num);
                count = arry10.length;
                arry11 = arry10.slice(0, count / 2);
                arry12 = arry10.slice(count / 2, count);
                arry11.push(points5);
                arry12.push(points6);
                arry11 = arry11.reverse();
                arry11.push(points11);
                arry12 = arry12.reverse();
                arry12.push(points3);
                arry11 =  PlotUtil.getBSplinePoints(arry11);
                arry12 =  PlotUtil.getBSplinePoints(arry12);
               
                return arry11.reverse().concat(arry1, arry12);
            }
           
            return null;
        }

    });
    return clazz;
});