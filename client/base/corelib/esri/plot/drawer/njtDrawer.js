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

        state:"editing",//"drawing"，当前正在绘制还是编辑，默认是绘制
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
        headpoints:null,
        secendheadpoints:null,
        threeheadpoints:null,
        firstLeftPoints:null,
        firstRightPoints:null,
        secendRightPoints:null,

        firstPoint:null,
        getPoints: function(points) {
            var lengthNum = points.length;
            if ((lengthNum == 2||lengthNum ==3) && points[(lengthNum - 1)] != points[lengthNum - 2])
            {
                this.firstPoint = points[0];
                this.headpoints = PlotUtil.getArrowHeadPoints(points,  this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                    this.neckWidthFactor);

                var _loc_11 =   this.headpoints[0];
                var _loc_12 =   this.headpoints[4];
                var _loc_13 = PlotUtil.getArrowBodyPoints(points, _loc_11, _loc_12, this.tailWidthFactor);
                var _loc_14 = PlotUtil.getArrowTailPoints(points, this.tailWidthFactor, false, 0);
                var _loc_15 = _loc_14[0];
                var _loc_18 = _loc_13.length;
                var _loc_19 = _loc_13.slice(0, _loc_18 / 2);
                _loc_19.push(_loc_11);
                _loc_19 = _loc_19.reverse();
                _loc_19.push(_loc_15);
                this.firstLeftPoints = PlotUtil.getBSplinePoints(_loc_19);
                this.firstLeftPoints.reverse();

                return PlotUtil.getArrowPlot(points, false, 0, PlotUtil.USE_BEZIER_FIT,
                    this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                    this.neckWidthFactor, this.tailWidthFactor);
            }else if(lengthNum ==4 ){

            }
            else if(lengthNum==5||lengthNum==6){
                if(this.state=="editing"){
                    var cps = points.slice();
                    cps = cps.splice(0,3);
                    this.firstPoint = points[0];
                    this.headpoints = PlotUtil.getArrowHeadPoints(cps,  this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                        this.neckWidthFactor);

                    var _loc_11 =   this.headpoints[0];
                    var _loc_12 =   this.headpoints[4];
                    var _loc_13 = PlotUtil.getArrowBodyPoints(cps, _loc_11, _loc_12, this.tailWidthFactor);
                    var _loc_14 = PlotUtil.getArrowTailPoints(cps, this.tailWidthFactor, false, 0);
                    var _loc_15 = _loc_14[0];
                    var _loc_18 = _loc_13.length;
                    var _loc_19 = _loc_13.slice(0, _loc_18 / 2);
                    _loc_19.push(_loc_11);
                    _loc_19 = _loc_19.reverse();
                    _loc_19.push(_loc_15);
                    this.firstLeftPoints = PlotUtil.getBSplinePoints(_loc_19);
                    this.firstLeftPoints.reverse();
                }
                ///////////////////////////////////////////////////////
                //var arrs = [];
                //arrs.push( this.headpoints[4],points[(lengthNum - 2)] ,points[(lengthNum - 1)] );
                //this.firstRightPoints = PlotUtil.getBSplinePoints(arrs);
                //
                //return this.firstLeftPoints.reverse().concat(this.headpoints,this.firstRightPoints.reverse());
                points =  points.slice(3,points.length);//把前3个删除

                this.secendheadpoints = PlotUtil.getArrowHeadPoints(points, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                    this.neckWidthFactor);
                var _loc_11 =    this.secendheadpoints[0];
                var _loc_12 =    this.secendheadpoints[4];
                var _loc_13 = PlotUtil.getArrowBodyPoints(points, _loc_11, _loc_12,  this.tailWidthFactor);
                var _loc_14 = PlotUtil.getArrowTailPoints(points, this.tailWidthFactor, false, 0);

                var _loc_17 = _loc_14.length == 3 ? (_loc_14[2]) : (_loc_14[1]);
                var _loc_18 = _loc_13.length;
                var _loc_20 = _loc_13.slice(_loc_18 / 2, _loc_18);
                _loc_20.push(_loc_12);
                _loc_20 = _loc_20.reverse();
                _loc_20.push(_loc_17);
                this.secendRightPoints = PlotUtil.getBezierPoints(_loc_20);
                this.secendPoint =   this.secendRightPoints[  this.secendRightPoints.length-1];
                var arrs = [];
                if(lengthNum==5) arrs.push( this.headpoints[4], this.firstPoint, points[0] ,this.secendheadpoints[0] );
                if(lengthNum==6) arrs.push( this.headpoints[4], this.firstPoint, points[0],  points[1],this.secendheadpoints[0] );

                this.firstRightPoints = PlotUtil.getBezierPoints(arrs);

                var arss = this.firstLeftPoints.concat(this.headpoints,this.firstRightPoints ,this.secendheadpoints,this.secendRightPoints);

                return  arss;

            } else if(lengthNum==7)
            {
            } else if(lengthNum==8||lengthNum==9)
            {
                if(this.state=="editing"){
                    this.firstPoint = points[0];
                    var cps1 = points.slice();
                    cps1 = cps1.splice(0,3);
                    this.headpoints = PlotUtil.getArrowHeadPoints(cps1,  this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                        this.neckWidthFactor);

                    var _loc_11 =   this.headpoints[0];
                    var _loc_12 =   this.headpoints[4];
                    var _loc_13 = PlotUtil.getArrowBodyPoints(cps1, _loc_11, _loc_12, this.tailWidthFactor);
                    var _loc_14 = PlotUtil.getArrowTailPoints(cps1, this.tailWidthFactor, false, 0);
                    var _loc_15 = _loc_14[0];
                    var _loc_18 = _loc_13.length;
                    var _loc_19 = _loc_13.slice(0, _loc_18 / 2);
                    _loc_19.push(_loc_11);
                    _loc_19 = _loc_19.reverse();
                    _loc_19.push(_loc_15);
                    this.firstLeftPoints = PlotUtil.getBSplinePoints(_loc_19);
                    this.firstLeftPoints.reverse();


                    /////////////////////

                    var cps = points.slice();
                    cps = cps.splice(3,lengthNum==8?2:3);
                    this.secendheadpoints = PlotUtil.getArrowHeadPoints(cps, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                        this.neckWidthFactor);
                    var _loc_11 =    this.secendheadpoints[0];
                    var _loc_12 =    this.secendheadpoints[4];
                    var _loc_13 = PlotUtil.getArrowBodyPoints(cps, _loc_11, _loc_12,  this.tailWidthFactor);
                    var _loc_14 = PlotUtil.getArrowTailPoints(cps, this.tailWidthFactor, false, 0);

                    var _loc_17 = _loc_14.length == 3 ? (_loc_14[2]) : (_loc_14[1]);
                    var _loc_18 = _loc_13.length;
                    var _loc_20 = _loc_13.slice(_loc_18 / 2, _loc_18);
                    _loc_20.push(_loc_12);
                    _loc_20 = _loc_20.reverse();
                    _loc_20.push(_loc_17);
                    this.secendRightPoints = PlotUtil.getBezierPoints(_loc_20);
                    this.secendPoint =   this.secendRightPoints[  this.secendRightPoints.length-1];

                    var arrs = [];
                    if(lengthNum==8) arrs.push( this.headpoints[4], this.firstPoint, cps[0] ,this.secendheadpoints[0] );
                    if(lengthNum==9) arrs.push( this.headpoints[4], this.firstPoint, cps[0],  cps[1],this.secendheadpoints[0] );

                    this.firstRightPoints = PlotUtil.getBezierPoints(arrs);

                }
                //////////////////////////////////////
                points =  points.slice(6,points.length);//把前6个删除

                this.threeheadpoints = PlotUtil.getArrowHeadPoints(points, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor,
                    this.neckWidthFactor);
                var _loc_11 =    this.threeheadpoints[0];

                var arrs = [];
                if(lengthNum==8) arrs.push( this.secendheadpoints[4], this.secendPoint, points[0] ,this.threeheadpoints[0] );
                if(lengthNum==9) arrs.push( this.secendheadpoints[4], this.secendPoint, points[0],  points[1],this.threeheadpoints[0] );
                this.secendRightPoints = PlotUtil.getBezierPoints(arrs);

                var _loc_12 =    this.threeheadpoints[4];

                var _loc_13 = PlotUtil.getArrowBodyPoints(points, _loc_11, _loc_12,  this.tailWidthFactor);
                var _loc_14 = PlotUtil.getArrowTailPoints(points, this.tailWidthFactor, false, 0);

                var _loc_17 = _loc_14.length == 3 ? (_loc_14[2]) : (_loc_14[1]);
                var _loc_18 = _loc_13.length;
                var _loc_20 = _loc_13.slice(_loc_18 / 2, _loc_18);
                _loc_20.push(_loc_12);
                _loc_20 = _loc_20.reverse();
                _loc_20.push(_loc_17);
                this.threeRightPoints = PlotUtil.getBezierPoints(_loc_20);
                var arss = this.firstLeftPoints.concat(this.headpoints,this.firstRightPoints ,this.secendheadpoints,this.secendRightPoints,this.threeheadpoints,this.threeRightPoints);

                return arss;


            }

            if (lengthNum == 0){

            }
            return null;
        }

    });
    return clazz;
});