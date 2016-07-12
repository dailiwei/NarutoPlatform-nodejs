/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/chartView.html",
        "dojo/topic",
        "dojo/Deferred",
        "base/Library"
        ],function(
        	declare,
        	lang,
			html,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
    		Deferred,
    		Library
    	 
        ){
	return declare("base.chart.ChartView", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		chart:null,

	 
		constructor: function(args){
			var methodName = "constructor"; 
			 this._library = new Library();
			declare.safeMixin(this, args);

			topic.subscribe("/ibm/ioc/viewcontainer/showViewByTabName",lang.hitch(this,this.createFirst))
		},
		
		postCreate:function(){
			var methodName = "postCreate";
        
			this._library.lazyLoadJs(APP_ROOT+"base/vendor/echarts/echarts-all.js");//异步加载echart
		 
			this.domNode.title = "chart图";
			
			this.inherited(arguments);


			//setTimeout(lang.hitch(this,function(){
			//	this.createFirst("contentViewTab-Chart");
			//}),2000)
			//
		},
		firstLoad:true,
		createFirst:function(name){
			if(this.firstLoad){
				if(name=="contentViewTab-Chart"){
					this.createChart();
					this.firstLoad = false;
				}
			
			}
		},
		testData:"{\"success\":true,\"data\":[{\"stcd\":\"60106600\",\"tm\":\"2012-05-27 08:00:00\",\"charttm\":\"05-27 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-05-28 08:00:00\",\"charttm\":\"05-28 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-05-29 08:00:00\",\"charttm\":\"05-29 08\",\"dyp\":14.5},{\"stcd\":\"60106600\",\"tm\":\"2012-05-30 08:00:00\",\"charttm\":\"05-30 08\",\"dyp\":37.5},{\"stcd\":\"60106600\",\"tm\":\"2012-05-31 08:00:00\",\"charttm\":\"05-31 08\",\"dyp\":50.8},{\"stcd\":\"60106600\",\"tm\":\"2012-06-01 08:00:00\",\"charttm\":\"06-01 08\",\"dyp\":45},{\"stcd\":\"60106600\",\"tm\":\"2012-06-02 08:00:00\",\"charttm\":\"06-02 08\",\"dyp\":30},{\"stcd\":\"60106600\",\"tm\":\"2012-06-03 08:00:00\",\"charttm\":\"06-03 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-06-04 08:00:00\",\"charttm\":\"06-04 08\",\"dyp\":1},{\"stcd\":\"60106600\",\"tm\":\"2012-06-05 08:00:00\",\"charttm\":\"06-05 08\",\"dyp\":0.5}]}",

		createChart:function(){
			var json = dojo.fromJson(this.testData);

			var list = json.data;

		    this.chart = echarts.init(this.chartNode);

			var tm = [];
			var x = [];
			var y = [];
			var sumDyp = 0;
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				x.push(item["dyp"]);
				sumDyp = item["dyp"]+sumDyp;
				y.push(sumDyp);
				tm.push(item["tm"]);
			}

			var option = {
				//title: {
				//    x:"center",
				//    text:     MyManager.getInstance().rainLineData["stnm"]+'日降雨累积曲线',
				//    subtext:"最近一周",
				//    textStyle:{
				//        fontSize: 14,
				//        fontWeight: 'bolder',
				//        color:'gray'
				//    },
				//    subtextStyle:{
				//        fontSize: 10
				//    }
				//},
				tooltip: {
					trigger: 'axis'
				},
				//legend: {
				//    x: 'left',
				//    data: ['日降雨', '累计降雨']
				//},
				dataZoom: {
					show: false,
					realtime: false,//true为拖动的时候就变化
					start: 0,
					end: 100//设置成整体样式的某个位置
				},
				grid:{
					y2:30,y:30,x2:40,x:40
				},

				toolbox: {
					show: false,
					feature: {
						//mark : {show: true},
						//dataView : {show: true, readOnly: false},
						//magicType : {show: true, type: ['line', 'bar']},
						//restore : {show: true},
						saveAsImage: {show: true}
					}
				},
				calculable: true,
				xAxis: [
					{
						type: 'category',
						data: tm
					}
				],
				yAxis : [
					{ name:"时段降雨(mm)", type : 'value'},
					{
						name:"累计降雨(mm)",
						type : 'value'
					} ],

				series: [
					{
						name: '时段降雨',
						type: 'bar',
						data: x,
						itemStyle: {
							normal: {
								color:"#29B2FA",//设置颜色
								label: {
									show: false,//柱子上现实label的
									position: 'top',
									formatter: '{b}\n{c}'//c是数值，b是横轴对应的值
								}
							}
						}
					},
					{
						name: '累计降雨',
						type: 'line',
						data: y,
						yAxisIndex:1,
						smooth: true,//设置平滑
						itemStyle: {
							normal: {
								color:"#5cbb87",//设置颜色
								label: {
									show: false,//柱子上现实label的
									position: 'top',
									formatter: '{b}\n{c}'//c是数值，b是横轴对应的值
								}
							}
						}
					}
				]
			};



			this.chart.setOption(option);
		}
		
	});
});