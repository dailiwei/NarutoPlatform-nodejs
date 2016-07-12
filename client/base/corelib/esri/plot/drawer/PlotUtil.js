/**
 * Created by dailiwei on 15/1/27.
 */
define(['dojo/_base/lang',
        'dojo/_base/array',
        'dojo/on',
        'dojo/aspect',
        'dojo/Deferred',
        'dojo/cookie',
        'dojo/json',
        'dojo/topic',
        'dojo/sniff',
        'dojo/_base/url',
        'dojo/io-query',
        'esri/geometry/Point'
    ],

    function (lang, array, on, aspect, Deferred, cookie, json, topic, sniff, Url, ioquery,Point) {
        var plotUtil = {};//标绘的创建的工具类

        plotUtil.LEFT_SIDE = "left";
        plotUtil.RIGHT_SIDE = "right";
        plotUtil.USE_BEZIER_FIT = "useBezierFit";
        plotUtil.USE_BSPLINE_FIT = "useBSplieFit";

        //两点的距离
        plotUtil.distance=function(point1,point2) {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        };

        //两点中点的
        plotUtil.getMidPoint=function(point1,point2) {
            return new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
        };

        //三分点
        plotUtil.getThirdPoint =  function (param1, param2, param3, param4, param5){
            var _loc_7 = NaN;
            var _loc_6 = this.getAzimuthAngle(param1, param2);
            if (param5 == this.LEFT_SIDE)
            {
                _loc_7 = _loc_6 + param3;
            }
            else
            {
                _loc_7 = _loc_6 - param3;
            }
            var _loc_8 = param4 * Math.cos(_loc_7);
            var _loc_9  = param4 * Math.sin(_loc_7);
            return new Point(param2.x + _loc_8, param2.y + _loc_9);
        };

        plotUtil.getAzimuthAngle =  function(point1, point2){
            var aztha = NaN;
            var lengthDis = Math.asin(Math.abs(point2.y - point1.y) / this.distance(point1, point2));
            if (point2.y >= point1.y && point2.x >= point1.x)
            {
                aztha = lengthDis + Math.PI;
            }
            else if (point2.y >= point1.y && point2.x < point1.x)
            {
                aztha = 2 * Math.PI - lengthDis;
            }
            else if (point2.y < point1.y && point2.x < point1.x)
            {
                aztha = lengthDis;
            }
            else if (point2.y < point1.y && point2.x >= point1.x)
            {
                aztha = Math.PI - lengthDis;
            }
            return aztha;
        };

        //根据数组生成贝塞尔点
        plotUtil.getBezierPoints = function (list){
            var num1 = NaN;
            var num6 = NaN;
            var int7 = 0;
            var num8 = NaN;
            var num9 = NaN;
            var num10 = NaN;
            if (list.length <= 2)
            {
                return list;
            }
            var array2 = [];
            var lengthNum = list.length - 1;
            var count = 0;
            while (count <= 1)
            {
                num1 = 0;
                num6 = 0;
                int7 = 0;
                while (int7 <= lengthNum)
                {
                    num8 = this.getBinomialFactor(lengthNum, int7);
                    num9 = Math.pow(count, int7);
                    num10 = Math.pow(1 - count, lengthNum - int7);
                    num1 = num1 + num8 * num9 * num10 * list[int7].x;
                    num6 = num6 + num8 * num9 * num10 * list[int7].y;
                    int7++;
                }
                array2.push(new Point(num1, num6));
                count = count + 0.01;
            }
            array2.push(list[lengthNum]);
            return array2;
        };
        plotUtil.getBinomialFactor = function (param1,param2){
            return this.getFactorial(param1) / (this.getFactorial(param2) * this.getFactorial(param1 - param2));

        };

        plotUtil.getFactorial = function (length){
            if (length <= 1)
            {
                return 1;
            }
            if (length == 2)
            {
                return 2;
            }
            if (length == 3)
            {
                return 6;
            }
            if (length == 4)
            {
                return 24;
            }
            if (length == 5)
            {
                return 120;
            }
            var num = 1;
            var count = 1;
            while (count <= length)
            {

                num = num * count;
                count++;
            }
            return num;
        };

        plotUtil.getAdvancedBezierPoints = function(param1){
            var _loc_9 = NaN;
            var _loc_10 = NaN;
            var _loc_11 = NaN;
            var _loc_12 = NaN;
            var _loc_13 = NaN;
            var _loc_14 = NaN;
            param1 = param1.slice();
            var _loc_2  = param1.length;
            param1.push(param1[0]);
            var _loc_3 = [];
            var _loc_4 = 0;
            while (_loc_4 < _loc_2)
            {
                _loc_3.push(this.getMidPoint(param1[_loc_4], param1[(_loc_4 + 1)]));
                _loc_4++;
            }
            _loc_3.push(_loc_3[0]);
            param1.push(param1[1]);
            var _loc_5 = [];
            _loc_4 = 0;
            while (_loc_4 < _loc_2)
            {
                _loc_9 = this.distance(param1[_loc_4], param1[(_loc_4 + 1)]);
                _loc_10 = this.distance(param1[(_loc_4 + 1)], param1[_loc_4 + 2]);
                _loc_11 = this.distance(_loc_3[_loc_4], _loc_3[(_loc_4 + 1)]);
                _loc_12 = _loc_11 * _loc_9 / (_loc_9 + _loc_10);
                _loc_5.push(this.getThirdPoint(_loc_3[(_loc_4 + 1)], _loc_3[_loc_4], 0, _loc_12, this.LEFT_SIDE));
                _loc_4++;
            }
            var _loc_6 = [];
            _loc_4 = 0;
            while (_loc_4 < _loc_2)
            {
                _loc_13 = param1[(_loc_4 + 1)].x - _loc_5[_loc_4].x;
                _loc_14 = param1[(_loc_4 + 1)].y - _loc_5[_loc_4].y;
                _loc_6.push(new Point(_loc_3[_loc_4].x + _loc_13, _loc_3[_loc_4].y + _loc_14));
                _loc_6.push(param1[(_loc_4 + 1)]);
                _loc_6.push(new Point(_loc_3[(_loc_4 + 1)].x + _loc_13, _loc_3[(_loc_4 + 1)].y + _loc_14));
                _loc_4++;
            }
            var _loc_7 = [];
            var _loc_8 = _loc_6.slice();
            _loc_6.slice().push(_loc_6[0], _loc_6[1]);
            _loc_4 = 1;
            while (_loc_4 < _loc_8.length)
            {
                _loc_7 = _loc_7.concat(this.getBezierPoints(_loc_8.slice(_loc_4, _loc_4 + 4)));
                _loc_4 = _loc_4 + 3;
            }
            return _loc_7;
        };

        //计算三个点形成的角度
        plotUtil.getAngleOfThreePoints = function(param1, param2, param3){
            var _loc_4 = this.getAzimuthAngle(param2, param1) - this.getAzimuthAngle(param2, param3);
            if (this.getAzimuthAngle(param2, param1) - this.getAzimuthAngle(param2, param3) < 0)
            {
                _loc_4 = _loc_4 + Math.PI * 2;
            }
            return _loc_4;
        };

        plotUtil.getArrowHeadPoints = function(param1, param2, param3, param4, param5){
            var _loc_6 = this.getBaseLength(param1);
            var _loc_7 =  this.getBaseLength(param1) * param2;
            var _loc_8 =  this.getBaseLength(param1) * param2 * param3;
            var _loc_9 = _loc_7 * param5;
            var _loc_10 = param1.length;
            var _loc_11 = param1[(_loc_10 - 1)];
            var _loc_12 =  this.distance(_loc_11, param1[_loc_10 - 2]);
            _loc_7 = _loc_7 > _loc_12 ? (_loc_12) : (_loc_7);
            var _loc_13 = _loc_7 * param4;
            var _loc_14 =  this.getThirdPoint(param1[_loc_10 - 2], _loc_11, 0, _loc_7, this.LEFT_SIDE);
            var _loc_15 =  this.getThirdPoint(param1[_loc_10 - 2], _loc_11, 0, _loc_13, this.LEFT_SIDE);
            var _loc_16 =  this.getThirdPoint(_loc_11, _loc_14, Math.PI * 1.5, _loc_8, this.RIGHT_SIDE);
            var _loc_17 = this.getThirdPoint(_loc_11, _loc_15, Math.PI * 1.5, _loc_9, this.RIGHT_SIDE);
            var _loc_18 =  this.getThirdPoint(_loc_11, _loc_14, Math.PI * 1.5, _loc_8, this.LEFT_SIDE);
            var _loc_19 =  this.getThirdPoint(_loc_11, _loc_15, Math.PI * 1.5, _loc_9, this.LEFT_SIDE);
            var _loc_20 = [];
            _loc_20.push(_loc_17, _loc_16, _loc_11, _loc_18, _loc_19);
            return _loc_20;
        };

        plotUtil.getBaseLength = function(param1){
            var _loc_2 = this.wholeDistance(param1);
            return _loc_2;
        };

        plotUtil.wholeDistance = function (param1){
            if (param1.length <= 1)
            {
                return 0;
            }
            var _loc_2 = 0;
            var _loc_3 = 0;
            while (_loc_3 < (param1.length - 1))
            {

                _loc_2 = _loc_2 + this.distance(param1[_loc_3], param1[(_loc_3 + 1)]);
                _loc_3++;
            }
            return _loc_2;
        };

        plotUtil.getArrowBodyPoints = function (param1, param2, param3, param4){

           // param5=1,param6 =1;//以前的默认值
            var _loc_16 = NaN;
            var _loc_17 = NaN;
            var _loc_7 = this.wholeDistance(param1);
            var _loc_8 = this.getBaseLength(param1);
            var _loc_9 = this.getBaseLength(param1) * param4;
            var _loc_10 = this.distance(param2, param3);
            var _loc_11 = _loc_9 - _loc_10 / 2;
            var _loc_12 = 0;
            var _loc_13 = [];
            var _loc_14 = [];
            var _loc_15 = 1;
            while (_loc_15 < (param1.length - 1))
            {
                _loc_16 = this.getAngleOfThreePoints(param1[(_loc_15 - 1)], param1[_loc_15], param1[(_loc_15 + 1)]) / 2;
                _loc_12 = _loc_12 + this.distance(param1[(_loc_15 - 1)], param1[_loc_15]);
                _loc_17 = (_loc_9 - _loc_12 / _loc_7 * _loc_11) / Math.sin(_loc_16);
                _loc_13.push(this.getThirdPoint(param1[(_loc_15 - 1)], param1[_loc_15], _loc_16, _loc_17 * 1, this.RIGHT_SIDE));
                _loc_14.push(this.getThirdPoint(param1[(_loc_15 - 1)], param1[_loc_15], Math.PI - _loc_16, _loc_17 * 1, this.LEFT_SIDE));
                _loc_15++;
            }
            return _loc_13.concat(_loc_14);
        };

        plotUtil.getArrowPlot = function (cps, hasThirdPoint, param3, param4, param5, param6, param7, param8, param9){
            cps = cps.slice();
            var _loc_10 = this.getArrowHeadPoints(cps, param5, param6, param7, param8);
            var _loc_11 = _loc_10[0];
            var _loc_12 = _loc_10[4];
            var _loc_13 = this.getArrowBodyPoints(cps, _loc_11, _loc_12, param9);
            var _loc_14 = this.getArrowTailPoints(cps, param9, hasThirdPoint, param3);
            var _loc_15 = _loc_14[0];
            var _loc_16 = _loc_14.length == 3 ? (_loc_14[1]) : (null);
            var _loc_17 = _loc_14.length == 3 ? (_loc_14[2]) : (_loc_14[1]);
            var _loc_18 = _loc_13.length;
            var _loc_19 = _loc_13.slice(0, _loc_18 / 2);
            var _loc_20 = _loc_13.slice(_loc_18 / 2, _loc_18);
            _loc_19.push(_loc_11);
            _loc_20.push(_loc_12);
            _loc_19 = _loc_19.reverse();
            _loc_19.push(_loc_15);
            _loc_20 = _loc_20.reverse();
            _loc_20.push(_loc_17);
            if (param4 == this.USE_BEZIER_FIT)
            {
                _loc_19 = this.getBezierPoints(_loc_19);
                _loc_20 = this.getBezierPoints(_loc_20);
            }
            else
            {
                _loc_19 = this.getBSplinePoints(_loc_19);
                _loc_20 = this.getBSplinePoints(_loc_20);
            }
            if (_loc_16)
            {
                _loc_19.push(_loc_16);
                _loc_20.push(_loc_16);
            }
            var arrs =_loc_19.reverse().concat(_loc_10, _loc_20);
            var index = null;
            for(var i=0;i<arrs.length;i++){
                if(index==null){
                    index = arrs[0];
                    continue;
                }

                if(index==arrs[i]){

                }else{
                    index=arrs[i];
                }

            }

            return arrs;//_loc_19.reverse().concat(_loc_10, _loc_20);
        };
        
        plotUtil.getBSplinePoints = function (param1, param2){
            //蛋疼这里折腾了几个小时，默认
            param2 = 2;
            var _loc_6   = NaN;
            var _loc_7   = NaN;
            var _loc_8   = NaN;
            var _loc_9 = 0;
            var _loc_10   = NaN;
            if (param1.length <= 2 || param1.length <= param2)
            {
                return param1;
            }
            var _loc_3 = [];
            var _loc_4  = param1.length - param2 - 1;
            _loc_3.push(param1[0]);
            var _loc_5 = 0;
            while (_loc_5 <= _loc_4)
            {
                _loc_6 = 0;
                while (_loc_6 <= 1)
                {
                    _loc_7 = 0;
                    _loc_8 = 0;
                    _loc_9 = 0;
                    while (_loc_9 <= param2)
                    {
                        _loc_10 = this.getBSplineFFactor(_loc_9, param2, _loc_6);
                        _loc_7 = _loc_7 + _loc_10 * param1[_loc_5 + _loc_9].x;
                        _loc_8 = _loc_8 + _loc_10 * param1[_loc_5 + _loc_9].y;
                        _loc_9++;
                    }
                    _loc_3.push(new Point(_loc_7, _loc_8));
                    _loc_6 = _loc_6 + 0.05;
                }
                _loc_5++;
            }
            _loc_3.push(param1[(param1.length - 1)]);
            return _loc_3;
        };

        plotUtil.getBSplineFFactor = function (param1,param2,param3){
            var _loc_7 = NaN;
            if (param2 == 2)
            {
                return this.getQuadricBSplineFactor(param1, param3);
            }
            var _loc_4 = 0;
            var _loc_5 = this.getFactorial(param2);
            var _loc_6 = 0;
            while (_loc_6 <= param2 - param1)
            {
                _loc_7 = _loc_6 % 2 == 0 ? (1) : (-1);
                _loc_4 = _loc_4 + _loc_7 * this.getBinomialFactor((param2 + 1), _loc_6) * Math.pow(param3 + param2 - param1 - _loc_6, param2);
                _loc_6++;
            }
            return _loc_4 / _loc_5;
        };

        plotUtil.getQuadricBSplineFactor = function (param1, param2){
            if (param1 == 0)
            {
                return Math.pow((param2 - 1), 2) / 2;
            }
            if (param1 == 1)
            {
                return (-2 * Math.pow(param2, 2) + 2 * param2 + 1) / 2;
            }
            if (param1 == 2)
            {
                return Math.pow(param2, 2) / 2;
            }
            return 0;
        };

        plotUtil.getArrowTailPoints = function (param1, param2, param3, param4){
            var _loc_10 = NaN;
            var _loc_11 = null;
            var _loc_5 = this.getBaseLength(param1);
            var _loc_6  = this.getBaseLength(param1) * param2;
            var _loc_7 = [];
            var _loc_8 = this.getThirdPoint(param1[1], param1[0], Math.PI * 1.5, _loc_6, this.RIGHT_SIDE);
            var _loc_9 = this.getThirdPoint(param1[1], param1[0], Math.PI * 1.5, _loc_6, this.LEFT_SIDE);
            if (param3)
            {
                _loc_10 = _loc_6 * param4;
                _loc_11 = this.getThirdPoint(param1[1], param1[0], 0, _loc_10, this.LEFT_SIDE);
                _loc_7.push(_loc_8, _loc_11, _loc_9);
                return _loc_7;
            }
            _loc_7.push(_loc_8, _loc_9);
            return _loc_7;
        };

        return plotUtil;
    });