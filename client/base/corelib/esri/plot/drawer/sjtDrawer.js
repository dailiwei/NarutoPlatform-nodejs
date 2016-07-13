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

        dnoo04: null,
        mdtdoo0oo: null,
        o0hhftdoo0oo: 0.2,
        o0hwftdoo0oo: 0.4,
        o0onhoo0oo: 0.75,
        o0onwfoo0oo: 0.15,
        dddddd: null,
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
        plotState:"drawing",
        connPoint:null,
        tempPoint4:null,
        headHeightFactor: 0.2,
        headWidthFactor: 0.4,
        neckHeightFactor : 0.75,
        neckWidthFactor : 0.15,
        getPoints: function(points) {
            var point2 = null;
            var point3 = null;
            var point4 = null;
            var arry1 = null;
            var arry2 = null;
            var num1 = 0;
            var num2 = 0;
            var arry3 = null;
            var arry4 = null;
            var arry5 = null;
            var arry6 = null;
            var arry7 = null;
            var arry8 = null;
            var arry9 = null;
            var arry10 = null;
            var lengthNum = points.length;
            if (lengthNum >= 3 && points[(lengthNum - 1)] != points[lengthNum - 2])
            {
                point2 = points[0];
                point3 = points[1];
                point4 = points[2];
                if (lengthNum == 3)
                {
                    this.tempPoint4 = this.getTempPnt4(point2, point3, point4);
                }
                else
                {
                    this.tempPoint4 = points[3];
                }
                //if (this.plotState == DRAWING)
                if (this.plotState == "drawing")
                {
                    this.connPoint = PlotUtil.getMidPoint(point2, point3);
                }
                arry1 = this.getArrowPoints(point2, this.connPoint, this.tempPoint4, PlotUtil.LEFT_SIDE);
                arry2 = this.getArrowPoints(this.connPoint, point3, point4, PlotUtil.RIGHT_SIDE);
                num1 = arry1.length;
                num2 = (num1 - 5) / 2;
                arry3 = arry1.slice(0, num2);
                arry4 = arry1.slice(num2, num2 + 5);
                arry5 = arry1.slice(num2 + 5, num1);
                arry6 = arry2.slice(0, num2);
                arry7 = arry2.slice(num2, num2 + 5);
                arry8 = arry2.slice(num2 + 5, num1);
                arry3 = PlotUtil.getBezierPoints(arry3);
                arry9 = PlotUtil.getBezierPoints(arry5.concat(arry6));
                arry8 = PlotUtil.getBezierPoints(arry8);
                return arry3.concat(arry4, arry9, arry7, arry8);
            }

            return null;

        },
        getTempPnt4:function(param1, param2, param3){
            var point11 = null;
            var num11 = NaN;
            var num22 = NaN;
            var point22 = null;
            var point55  = PlotUtil.getMidPoint(param1, param2);
            var point66  = PlotUtil.distance(point55, param3);
            var point77  = PlotUtil.getAngleOfThreePoints(param1, point55, param3);
            if (PlotUtil.getAngleOfThreePoints(param1, point55, param3) < Math.PI / 2)
            {
                num11 = point66 * Math.sin(point77);
                num22 = point66 * Math.cos(point77);
                point22 = PlotUtil.getThirdPoint(param1, point55, Math.PI * 1.5, num11, PlotUtil.LEFT_SIDE);
                point11 = PlotUtil.getThirdPoint(point55, point22, Math.PI * 1.5, num22, PlotUtil.RIGHT_SIDE);
            }
            else if (point77 >= Math.PI / 2 && point77 < Math.PI)
            {
                num11 = point66 * Math.sin(Math.PI - point77);
                num22 = point66 * Math.cos(Math.PI - point77);
                point22 = PlotUtil.getThirdPoint(param1, point55, Math.PI * 1.5, num11, PlotUtil.LEFT_SIDE);
                point11 = PlotUtil.getThirdPoint(point55, point22, Math.PI * 1.5, num22, PlotUtil.LEFT_SIDE);
            }
            else if (point77 >= Math.PI && point77 < Math.PI * 1.5)
            {
                num11 = point66 * Math.sin(point77 - Math.PI);
                num22 = point66 * Math.cos(point77 - Math.PI);
                point22 = PlotUtil.getThirdPoint(param1, point55, Math.PI * 1.5, num11, PlotUtil.RIGHT_SIDE);
                point11 = PlotUtil.getThirdPoint(point55, point22, Math.PI * 1.5, num22, PlotUtil.RIGHT_SIDE);
            }
            else
            {
                num11 = point66 * Math.sin(Math.PI * 2 - point77);
                num22 = point66 * Math.cos(Math.PI * 2 - point77);
                point22 = PlotUtil.getThirdPoint(param1, point55, Math.PI * 1.5, num11, PlotUtil.RIGHT_SIDE);
                point11 = PlotUtil.getThirdPoint(point55, point22, Math.PI * 1.5, num22, PlotUtil.LEFT_SIDE);
            }
            return point11;
        }
        ,
        getArrowPoints:function(param1, param2, param3, param4){
            var _loc_5 =  PlotUtil.getMidPoint(param1, param2);
            var _loc_6 =  PlotUtil.distance(_loc_5, param3);
            var _loc_7 =  PlotUtil.getThirdPoint(param3, _loc_5, 0, _loc_6 * 0.3,  PlotUtil.LEFT_SIDE);
            var _loc_8 =  PlotUtil.getThirdPoint(param3, _loc_5, 0, _loc_6 * 0.5,  PlotUtil.LEFT_SIDE);
            var _loc_9 =  PlotUtil.getThirdPoint(param3, _loc_5, 0, _loc_6 * 0.7,  PlotUtil.LEFT_SIDE);
            _loc_7 =  PlotUtil.getThirdPoint(_loc_5, _loc_7, Math.PI * 1.5, _loc_6 / 4, param4);
            _loc_8 =  PlotUtil.getThirdPoint(_loc_5, _loc_8, Math.PI * 1.5, _loc_6 / 4, param4);
            _loc_9 =  PlotUtil.getThirdPoint(_loc_5, _loc_9, Math.PI * 1.5, _loc_6 / 4, param4);
            var _loc_10 = [_loc_5, _loc_7, _loc_8, _loc_9, param3];
            var _loc_11 =  PlotUtil.getArrowHeadPoints(_loc_10, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor);
            var _loc_12 =  PlotUtil.getArrowHeadPoints(_loc_10, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor)[0];
            var _loc_13 = _loc_11[4];
            var _loc_14 =  PlotUtil.distance(param1, param2) /  PlotUtil.getBaseLength(_loc_10) / 2;
            var _loc_15 = param4 ==  PlotUtil.LEFT_SIDE ? (1) : (0.01);
            var _loc_16 = param4 ==  PlotUtil.LEFT_SIDE ? (0.01) : (1);
            var _loc_17 =  PlotUtil.getArrowBodyPoints(_loc_10, _loc_12, _loc_13, _loc_14, _loc_15, _loc_16);
            var _loc_18 =  PlotUtil.getArrowBodyPoints(_loc_10, _loc_12, _loc_13, _loc_14, _loc_15, _loc_16).length;
            var _loc_19 = _loc_17.slice(0, _loc_18 / 2);
            var _loc_20 = _loc_17.slice(_loc_18 / 2, _loc_18);
            _loc_19.push(_loc_12);
            _loc_20.push(_loc_13);
            _loc_19 = _loc_19.reverse();
            _loc_19.push(param1);
            _loc_20 = _loc_20.reverse();
            _loc_20.push(param2);
            return _loc_19.reverse().concat(_loc_11, _loc_20);
        }


    });
    return clazz;
});