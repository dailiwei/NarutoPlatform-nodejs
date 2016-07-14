define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        "dojo/topic", 
        'base/_BaseWidget',
        'dijit/_TemplatedMixin',
        'base/widget/Popup'
    ],
    function (
        declare,
        lang,
        html,
        topic, 
        _WidgetBase,
        _TemplatedMixin,
        Popup
    ) {
        return declare('simple.gisWidget.ChartPanel',[_WidgetBase, _TemplatedMixin], {
            templateString: '<div style="width:100%; height: 100%; ">'+
            '<div style="width: 100%;height:100%;" data-dojo-attach-point="chartContainer"></div>'+
            '</div>',
          
            constructor: function (args) { 
                declare.safeMixin(this, args);
            },

            postCreate: function () {
                this.inherited(arguments);

            },
            startup:function(){
                this.inherited(arguments);

                html.setStyle(this.chartContainer,"height",this.panelHeight+"px");
                html.setStyle(this.chartContainer,"width",this.panelWidth+"px");

                //主要修改这个代码
                this.createChart();
            },
             
            activate : function() { 
			},
			deactivate : function() { 
				
			},
			resize:function(){
				 if(this._chart){
                     this._chart.resize();
                 }
			},
            destroy:function(){

                if(this._chart){
                    this._chart.dispose();
                }

                this.inherited(arguments);
            },
            createChart:function(){
                // 基于准备好的dom，初始化echarts图表
                this._chart = echarts.init(this.chartContainer);

                var option =  {
                    calculable : false,
                    series : [
                        {
                            name:'访问来源',
                            type:'pie',
                            itemStyle : {
                                normal : {
                                    label : {
                                        show : false
                                    },
                                    labelLine : {
                                        show : false
                                    }
                                },
                                emphasis : {
                                    label : {
                                        show : true,
                                        position : 'center',
                                        textStyle : {
                                            fontSize : '12',
                                            fontWeight : 'bold'
                                        }
                                    }
                                }
                            },
                            data:[
                                {value:335, name:'直接访问'},
                                {value:310, name:'邮件营销'},
                                {value:234, name:'联盟广告'},
                                {value:135, name:'视频广告'},
                                {value:1548, name:'搜索引擎'}
                            ]
                        }
                    ]
                };

                // 为echarts对象加载数据
                this._chart.setOption(option);
            }
			
        });
    });