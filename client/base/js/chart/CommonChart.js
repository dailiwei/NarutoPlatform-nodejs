///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Richway. All Rights Reserved.
// create by dailiwei 2016-3-14 19:13:23
///////////////////////////////////////////////////////////////////////////

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/_base/fx",
    "dojo/dom-construct",
    "dijit/_TemplatedMixin",
    "base/_BaseWidget",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/on",
    "base/utils/commonUtils"
], function (declare,
             lang,
             html,
             fx,
             domConstruct,
             _TemplatedMixin,
             _Widget,
             topic,
             Deferred,
             on,
             commonUtils) {
    return declare("base.chart.CommonChart", [_Widget, _TemplatedMixin], {
        templateString: '<div style="width:100%;height:100%;">'+
        	                '<div style="width:100%;height:100%;" data-dojo-attach-point="chartContainer"></div>'+
        	                '<div class="loading" style="display:none;" data-dojo-attach-point="loadDiv"><i class="fa fa-spinner fa-spin"></i></div>'+
                        '</div>' ,

//        parameters: {
//        	 url: "busi/drought/monitor/main/QgHQFB/hisPContrast",
//             data: {
//                 adcd: "000000",
//                 years:"2011,2012,2013,2014,2015,2016"
//             },
//             title: {
//                 text: '气温变化曲线',
//                 x: 'center',
//                 textStyle: {
//                     fontSize: 13,
//                     fontWeight: 'bolder'
//                 }
//             },
//             xField: "year",
//             yAxis: [
//                 {type: 'value', name: '温度℃'},
//                 {type: 'value', name: '温度2℃'}
//             ],
//             series: [
//                 {
//                     dataField: "crdra",
//                     type: 'line',
//                     itemStyle: {
//                         normal: {
//                             color: "#29B2FA"
//                         }
//                     }
//                 },
//                 {
//                     dataField: "drhwp",
//                     type: 'line',
//                     yAxisIndex: 1,
//                     itemStyle: {
//                         normal: {
//                             color: "#FFB84A"
//                         }
//                     }
//                 }
//             ]
//
//        },
        constructor: function (args) {
        	 this.inherited(arguments);
             declare.safeMixin(this, args);
        },

        postCreate: function () {
            this.inherited(arguments);
        }, 

        startup: function () {
            this.inherited(arguments);
            this.init();
        },
        resize:function(){
        	 try {
                 this._chart.resize(); 
             } catch (e) {
             }
        },

        init: function () {
        	html.setStyle(this.loadDiv,"display","block");
            this.getData().then(lang.hitch(this, function (list) {
            	html.setStyle(this.loadDiv,"display","none");
                if (list && list.length > 0) {
                    this.createChart(list);
                } else {
                	this.createChart([]);
                }
            }));
        },
        setData:function(data){
        	this.parameters.data = data;
        	this.init();
        },
        
        getData: function () {  
            return commonUtils.post(this.parameters.url, this.parameters.data).then(lang.hitch(this, function (json) {
                return json.data;
            }));
        },
        createChart: function (list) {
            var xs = [];

            for(var k=0;k<this.parameters.series.length;k++){
                this.parameters.series[k].data=[];
            }

            var series = this.parameters.series;

            var xField = this.parameters.xField;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                xs.push(item[xField]);
                for(var k=0;k<series.length;k++){
                    series[k].data.push(item[series[k].dataField]);
                }
            }
            // 基于准备好的dom，初始化echarts图表
            if (!this._chart) {
                this._chart = echarts.init(this.chartContainer);
            }

            var option = {

                title:this.parameters.title,
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    y2: 55, y: 30, x2: 30, x: 50
                },
                dataZoom:this.parameters.dataZoom ,
                
                toolbox: {//小工具的，保存的
                    show: false,
                    feature: {
                        saveAsImage: {show: true}
                    }
                },
                calculable: true,
                xAxis: [
                    {
                        type: 'category',//
                        axisLabel: {
                            show: true,
                            interval: 'auto',    // {number}
                            margin: 8,
                            formatter: function (value) {
                                return value;//.substring(5);
                            },
                            textStyle: {
                                color: '#23527c',
                                fontFamily: 'sans-serif',
                                fontSize: 11,
                                fontWeight: 'bold'
                            }
                        },
                        data: xs
                    }
                ],
                yAxis: this.parameters.yAxis,
                series:  series
            };
            // 为echarts对象加载数据
            this._chart.setOption(option);
        },
        
        destroy: function () {
        	 this.inherited(arguments);
            try {
                this._chart.dispose();
                this._chart = null;
            } catch (e) {
            }
        }
    });
});