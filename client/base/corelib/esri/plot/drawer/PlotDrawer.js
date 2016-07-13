/**
 * Created by richway on 2015/3/6.
 */


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
        'esri/geometry/Point', 
        "dojo/json",
        "esri/geometry/Polygon",
        'esri/SpatialReference',
        'esri/graphic',
        "esri/symbols/SimpleFillSymbol",

        './ptjtDrawer',
        './ywjtDrawer',
        './sjtDrawer',
        './njtDrawer',
        './hjqyDrawer', 
        './TriangleFlagDrawer',
        './RectFlagDrawer',
        './CustomTailedArrowDrawer',
        './CustomArrowDrawer',
        './StraightArrowDrawer',
        './HalfCircleDrawer',

        './PlotTypes'
    ],

    function (lang,
              array,
              on,
              aspect,
              Deferred,
              cookie,
              json,
              topic,
              sniff,
              Url,
              ioquery,
              Point,
              JSON,
              Polygon,
              SpatialReference,
              Graphic,
              SimpleFillSymbol,
              ptjtDrawer,
              ywjtDrawer,
              sjtDrawer,
              njtDrawer,
              hjqyDrawer,
              TriangleFlagDrawer,
              RectFlagDrawer,
              CustomTailedArrowDrawer,
              CustomArrowDrawer,
              StraightArrowDrawer,
              HalfCircleDrawer,

              PlotTypes
    ) {
        var PlotDrawer = {};//标绘的图形的工具类,根据字符串创建

        //将图形输出为JSON字符串
        PlotDrawer.createDrawer=function(plotType) {

            var drawControl = null;
            switch (plotType) {
                case PlotTypes.SIMPLE_ARROW:
                {
                    drawControl = new ptjtDrawer();
                    break
                }
                case PlotTypes.STRAIGHT_ARROW:
                {
                    drawControl = new StraightArrowDrawer();
                    break
                }
                case PlotTypes.CUSTOM_ARROW:
                {
                    drawControl = new CustomArrowDrawer();
                    break
                }
                case PlotTypes.TAILED_ARROW:
                {
                    drawControl = new ywjtDrawer();
                    break
                }
                case PlotTypes.CUSTOM_TAILED_ARROW:
                {
                    drawControl = new CustomTailedArrowDrawer();
                    break
                }
                case PlotTypes.DOUBLE_ARROW:
                {
                    drawControl = new sjtDrawer();
                    break
                }
                case PlotTypes.MULTI_ARROW:
                {
                    drawControl = new njtDrawer();
                    break
                }
                case PlotTypes.ASSEMBLY_AREA:
                {
                    drawControl = new hjqyDrawer();
                    break
                }
                case PlotTypes.TRIANGLE_FLAG:
                {
                    drawControl = new TriangleFlagDrawer();
                    break
                }
                case PlotTypes.RECT_FLAG:
                {
                    drawControl = new RectFlagDrawer();
                    break
                }
                case PlotTypes.HALF_CIRCLE:
                {
                    drawControl = new HalfCircleDrawer();
                    break
                }
            }
            

            return drawControl;
        };

        PlotDrawer.createDrawPoints = function (type,points){
            var drawer = this.createDrawer(type);
            var list = drawer.getPoints(points);
            list.push(lang.clone(list[0]));
            return list;
        };


        return PlotDrawer;
    });