/**
 * Created by NarutoGIS on 15/3/3.
 */
define([],
    //标绘的类型类
    function () {
        var PlotTypes = {};
        //汇集区域
        PlotTypes.ASSEMBLY_AREA = "assemblyarea";
        //半圆形
        PlotTypes.HALF_CIRCLE = "halfcircle";
        //双箭头
        PlotTypes.DOUBLE_ARROW = "doublearrow";
        //三箭头,n
        PlotTypes.MULTI_ARROW = "multiarrow";
        //简单箭头/平头箭头
        PlotTypes.SIMPLE_ARROW = "simplearrow";
        //自定义箭头
        PlotTypes.CUSTOM_ARROW = "customarrow";
        //燕尾箭头
        PlotTypes.TAILED_ARROW = "tailearrow";
        //自定义燕尾箭头
        PlotTypes.CUSTOM_TAILED_ARROW = "customtailedarrow";
        //直箭头
        PlotTypes.STRAIGHT_ARROW = "straightarrow";
        //曲线旗标
        PlotTypes.CURVE_FLAG = "curveflag";
        //矩形旗标
        PlotTypes.RECT_FLAG = "rectflag";
        //三角旗标
        PlotTypes.TRIANGLE_FLAG = "triangleflag";
        //雨伞形状
        PlotTypes.UMBRELLA_SHAPE = "umbrellashape";
        //扇形
        PlotTypes.FAN_SHAPE = "fanshape";

        return PlotTypes;
    });