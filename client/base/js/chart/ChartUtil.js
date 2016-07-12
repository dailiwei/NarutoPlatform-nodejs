/**********Echarts组件工具类************/
/**用于Echarts基础的展示*/
define([],function(){
	return {
		noDataLoadingOption:{
			text : "没有相关数据",
			effect : 'bubble',
			effectOption : {
				effect : {n : 0}
			},
			textStyle : {fontSize : 14}
		},
		legend:{x: 'center',y:'bottom'}, 
		color_blue:'#69C9FB',
		color_blue_deep:'#12B6E3',
		color_green:'#2EC7C9',
		color_warn:'#FFB980',
		color_error:'#D87A80',
		colors:[],
		setColors:function(colors){this.colors=colors.split(',');}, 
		getColors:function(){return colors;},
		getColor:function(index){
			if(this.colors.length>0&&index<this.colors.length){ 
				return this.colors[index];
			}else{
				var colorDefault=['#69C9FB','#12B6E3','#2EC7C9','#FFB980','#D87A80',        '#69C9FB','#12B6E3','#2EC7C9','#FFB980','#D87A80','#69C9FB','#12B6E3','#2EC7C9','#FFB980','#D87A80','#69C9FB','#12B6E3','#2EC7C9','#FFB980','#D87A80'];
				if(index<colorDefault.length)
					return colorDefault[index];
				else
					return '#69C9FB';
			}
		},
		/*降雨累积曲线，调用方法参照：ChartWall.js*/ 
		RainHistory:function(target,url,queryparam,config){ 
			/*var config={title:'最近24小时降雨过程',lbx1:'时间',lbx2:'',lby1:'降雨量(mm)',lby2:'',x1:'ltm',x2:'',y1:'drp',y2:''};*/
			var dayrainchart=null;
			var _that=this;
			$.ajax({
			     type: 'GET',
			     url: url,
			     data: queryparam,
			     dataType : "json", 
			     success : function(result) {
			    	 if(result.success==true){
		            	 var ydata=[]; 
		            	 var y2data=[];
		            	 var tempData=[]; 
		            	  
		            	 dojo.forEach(result["data"], function(entry, i){
		            		 //ydata.push([new Date(entry[config.x1]),entry[config.y1]]);
		            		 ydata.push([((!isNaN(entry[config.x1]))?new Date(entry[config.x1]):entry[config.x1].parseDate()),entry[config.y1]]);
		            		 /*计算累积降雨*/
		            		 if (i==0)
		            		 {
		            			 tempData.push(entry[config.y1]);
		            			 y2data.push([((!isNaN(entry[config.x1]))?new Date(entry[config.x1]):entry[config.x1].parseDate()),entry[config.y1]]);
		            		 }else{
		            			 tempData.push(tempData[i-1]+entry[config.y1]);  
		            		     y2data.push([((!isNaN(entry[config.x1]))?new Date(entry[config.x1]):entry[config.x1].parseDate()),tempData[i-1]+entry[config.y1]]);
		            		 }
		            	});
		            	 
			    		 var option = {
			         		    title : {
			         		    	text: config.title,
			         		        x:'center',
			         		        textStyle:{fontSize: 12,fontWeight: 'bolder',color: '#333'}
			         		   },
			         		   tooltip : {
				       				trigger : 'axis',
				       				formatter : function(params) { 
				       					var date = new Date(params.value[0]);
				       					var strDt = date.Format("yyyy-MM-dd hh:mm");  
				       					var val=(typeof(params.value[1])=='undefined')?'-':params.value[1].toFixed(1);
				       					return  strDt + '<br/>'+ params.seriesName+':'+ val 
				       				},
				       				backgroundColor:'rgba(197,100,75,0.9)',
				       				axisPointer : {
				                           type : 'line',  
				                           lineStyle : {  color : '#0f0',width : 2,type : 'solid'}  
				                    }
				       			},
				       			noDataLoadingOption :_that.noDataLoadingOption, 
			         		    calculable : false,
			         		    grid:{x:"35px",y:"40px",x2:"30px",y2:"60px"},
			         		    xAxis : [{
			        				type : 'time',
			        				axisLine : {onZero : true},
			        				name:config.lbx1,
			        				axisLabel : {
			        					formatter : function(value) {
			        						try {
			        							var date = new Date(value);
			        							var strDt = date.Format("MM-dd hh:mm");
			        							return strDt; 
			        						} catch (e) {
			        							return value;
			        						}
			        					},
			        					rotate : 35
			        				} 
			        			}],
			         		    yAxis : [{
			        				name : config.lby1, 
			        				type : 'value', 
			        				scale : true,
			        				precision:1,
			        				boundaryGap : [ 0.02, 0.02 ],
			        				min:0
			        			}, {
			        				type : 'value',
			        				scale : true, 
			        				precision:1,
			        				boundaryGap : [ 0.02, 0.02 ],
			        				min:0 
			        			}],
			         		    series : [
			         		        {
			         		            name:'小时降雨量',
			         		            type:'bar',
			         		            itemStyle: {normal: {color:_that.color_blue},emphasis: {color:_that.color_blue}}, 
			         		            data:ydata 
			         		        },
			         		       {
			         		            name:'降雨累积曲线',
			         		            type:'line',
			         		            showAllSymbol : true, 
			         		            itemStyle : {
			         						normal : {
			         							color : _that.color_green, 
			         							lineStyle : {width : 2},
			         							label : {
			         								show : false, 
			         								position : 'right',
			         								textStyle : {fontStyle : 'bolder',fontSize : 12}
			         							}
			         						}
			         					}, 
			         					symbol : 'emptyRectangle', 
			         					symbolSize : 2,
			         		            data:y2data 
			         		        }
			         		    ]
			         		}; 
			    		if(typeof(target)=="string")
			    			dayrainchart = echarts.init(document.getElementById(target));
			    		else
			    			dayrainchart = echarts.init(target);
			 			dayrainchart.setOption(option);
			 			window.onresize = dayrainchart.resize; 
			    	 }
				}
			});
			return dayrainchart;
		},
		WaterHistory:function(target,url,queryparam,config){ 
			/*var config={title:'最近24小时降雨过程',lbx1:'时间',lbx2:'',lby1:'降雨量(mm)',lby2:'',x1:'ltm',x2:'',y1:'drp',y2:''};*/
			var rsvrchart=null;
			var _that=this;
			$.ajax({
			     type: 'GET',
			     url: url,
			     data: queryparam,
			     dataType : "json", 
			     success : function(result) {
			    	 if(result.success==true){
			    		 /*需要判断传过来的y1是不是有多个，如果多个需要处理成二维数组进行数据绑定*/
			    		 (config.y1==null||typeof(config.y1)=="undefined")?(config.y1=''):config.y1;
			    		 (config.y2==null||typeof(config.y2)=="undefined")?(config.y2=''):config.y2;
			    		 (config.ynm1==null||typeof(config.ynm1)=="undefined")?(config.ynm1=''):config.ynm1;
			    		 (config.ynm2==null||typeof(config.ynm2)=="undefined")?(config.ynm2=''):config.ynm2;
			    		 var listY1=(config.y1==''?null:config.y1.split(','));
			    		 var listY2=(config.y2==''?null:config.y2.split(','));
			    		 var listNmY1=(config.ynm1==''?null:config.ynm1.split(','));
			    		 var listNmY2=(config.ynm2==''?null:config.ynm2.split(',')); 
			    		 
		            	 var ydata= new Array(); 
		            	 for(var k=0;k<listY1.length;k++){
		            		 ydata[k]=new Array();
		            		 dojo.forEach(result["data"], function(entry, i){
		            			 ydata[k].push([new Date(entry[config.x1]),entry[listY1[k]]]);
			            	 });
		            	 }
		            	 /*图例配置*/ 
		            	 var lengend=listNmY1.concat(); 
		            	 lengend.push(config.ynm2);
		            	 var y2data=[];
		            	 dojo.forEach(result["data"], function(entry, i){
		            		 y2data.push([new Date(entry[config.x1]),entry[config.y2]]);
		            	 });
			    		 var option = {
			         		    title : {
			         		    	text: config.title, 
			         		    	subtext:config.subtext,
			         		        x:'center',
			         		        textStyle:{fontSize: 12,fontWeight: 'bolder',color: '#333'}
			         		   },
			         		   legend: _that.legend, 
			         		   tooltip : {
				       				trigger : 'axis',
				       				formatter : function(params) { 
				       					var date = new Date(params.value[0]); 
				       					var strDt = date.Format("yyyy-MM-dd hh:mm");   
				       					var val=(typeof(params.value[1])=='undefined')?'-':params.value[1].toFixed(2);
				       					return  strDt + '<br/>'+ params.seriesName+':'+ val 
				       				},
				       				backgroundColor:'rgba(197,100,75,0.9)',
				       				axisPointer : {
				                           type : 'line',  
				                           lineStyle : {  color : '#0f0',width : 2,type : 'solid'}  
				                    }
				       			},
				       			noDataLoadingOption :_that.noDataLoadingOption, 
			         		    calculable : false,
			         		    grid:{x:"35px",y:"40px",x2:"30px",y2:"60px"},
			         		    xAxis : [{
			        				type : 'time',
			        				splitNumber:10,
			        				axisLine : {onZero : true},
			        				axisTick:{show:true}, 
			        				splitLine:{show:true},
			        				name:config.lbx1,
			        				axisLabel : {
			        					formatter : function(value) {
			        						try {
			        							var date = new Date(value);
			        							var strDt = date.Format("MM-dd \n hh时"); 
			        							return strDt;
			        						} catch (e) {
			        							return value;
			        						} 
			        					}
			        				} 
			        			}],
			         		    yAxis : [{
			        				name : config.lby1, 
			        				type : 'value', 
			        				scale : true,
			        				precision:1,
			        				boundaryGap : [ 0.02, 0.02 ]
			        			}, {
			        				name : config.lby2, 
			        				type : 'value',
			        				scale : true,
			        				precision:1,
			        				boundaryGap : [ 0.02, 0.02 ],
			        			}],
			         		    series : [{
			         		            name:config.ynm2,
			         		            type:'line', 
			         		            yAxisIndex:1,
			         		            showAllSymbol : true, 
			         		            itemStyle : {
			         						normal : {
			         							color : _that.color_green,
			         							lineStyle : {width : 2},
			         							label : {
			         								show : false,
			         								position : 'right',
			         								textStyle : {fontStyle : 'bolder',fontSize : 12}
			         							}
			         						}
			         					}, 
			         					symbol : 'emptyRectangle',
			         					symbolSize : 2,
			         		            data:y2data 
			    		 		}]
			         		};
			    		 option.legend.data=lengend;
			    		 /*将数据放入series中*/
			    		 for(var i=0;i<listNmY1.length;i++){
			    			 var seri={
		    					name:listNmY1[i],
	         		            type:'line', 
	         		            showAllSymbol : true, 
	         		            itemStyle : {
	         						normal : {
	         							color : (i==0?_that.color_blue:(i==1?_that.color_warn:(i==2?_that.color_error:'#12B6E3'))),
	         							lineStyle : {width : 2},
	         							label : {
	         								show : false, 
	         								position : 'right',
	         								textStyle : {fontStyle : 'bolder',fontSize : 12}
	         							}
	         						}
	         					}, 
	         					symbol : 'emptyCircle',
	         					symbolSize : 2,
	         		            data:ydata[i] 
			    			 }
			    			 option.series.push(seri);
			    		 }
			    		if(typeof(target)=="string")
			    			 rsvrchart = echarts.init(document.getElementById(target));
				    	else
				    		 rsvrchart = echarts.init(target);
			 			rsvrchart.setOption(option);
			 			window.onresize = rsvrchart.resize; 
			    	 }
				}
			});
			return rsvrchart;
		},
		/*不支持time模式的横轴*/
		CommonChart:function(target,url,queryparam,config){ 
			/*var config={title:'最近24小时降雨过程',lbx1:'时间',lbx2:'',lby1:'降雨量(mm)',lby2:'',x1:'ltm',x2:'',y1:'drp',y2:''};*/
			var commonChart=null;
			var _that=this;
			this.bindChart=function(result){
				if(result.success==true){
		    		 /*需要判断传过来的y1是不是有多个，如果多个需要处理成二维数组进行数据绑定*/
		    		 (config.y1==null||typeof(config.y1)=="undefined")?(config.y1=''):config.y1;
		    		 (config.y2==null||typeof(config.y2)=="undefined")?(config.y2=''):config.y2;
		    		 (config.ynm1==null||typeof(config.ynm1)=="undefined")?(config.ynm1=''):config.ynm1;
		    		 (config.ynm2==null||typeof(config.ynm2)=="undefined")?(config.ynm2=''):config.ynm2;
		    		 var listY1=(config.y1==''?null:config.y1.split(','));
		    		 var listY2=(config.y2==''?null:config.y2.split(','));
		    		 var listNmY1=(config.ynm1==''?null:config.ynm1.split(','));
		    		 var listNmY2=(config.ynm2==''?null:config.ynm2.split(',')); 
		    		 /*X轴信息*/
		    		 var xdata= new Array();
		    		 dojo.forEach(result["data"], function(entry, i){
		    			 xdata.push(entry[config.x1]);
	            	 });
		    		 /*Y1轴信息*/
	            	 var ydata= new Array(); 
	            	 for(var k=0;k<listY1.length;k++){
	            		 ydata[k]=new Array();
	            		 dojo.forEach(result["data"], function(entry, i){
	            			 ydata[k].push(entry[listY1[k]]);
		            	 });
	            	 }
	            	 /*Y2轴信息*/ 
		    	 	 if(listY2!=null&&typeof(listY2)!="undefined"){
		            	 var y2data= new Array(); 
		            	 for(var k=0;k<listY2.length;k++){
		            		 y2data[k]=new Array();
		            		 dojo.forEach(result["data"], function(entry, i){
		            			 y2data[k].push(entry[listY2[k]]);
			            	 });
		            	 }
		    	 	 }
	            	 /*图例配置*/ 
	            	 var lengend=listNmY1.concat();
	            	 if(listNmY2!=null&&typeof(listNmY2)!="undefined"){
		            	 var lengend2=listNmY2.concat();
		            	 for(var i=0;i<lengend2.length;i++){
		            		 lengend.push(lengend2[i]);
		            	 }
	            	 }
		    		 var option = {
		         		    title : {
		         		    	text: config.title, 
		         		    	subtext:config.subtext,
		         		        x:'center',
		         		        textStyle:{fontSize: 12,fontWeight: 'bolder',color: '#333'}
		         		   },
		         		   //legend:{data:lengend,x: 'center',y:'bottom'},
		         		  legend:_that.legend,
		         		   tooltip : {
			       				trigger : 'axis', 
			       				backgroundColor:'rgba(197,100,75,0.9)',
			       				axisPointer : {
			                           type : 'line',  
			                           lineStyle : {  color : '#0f0',width : 2,type : 'solid'}  
			                    }
			       			},
			       			noDataLoadingOption :_that.noDataLoadingOption, 
		         		    calculable : false,
		         		    grid:{x:"35px",y:"40px",x2:"30px",y2:"60px"},
		         		    xAxis : [{
		        				type :((config.typex==null||typeof(config.typex)=='undefined')?'category':config.typex),
		        				splitNumber:10,
		        				axisLine : {onZero : true},
		        				axisTick:{show:true}, 
		        				splitLine:{show:true},
		        				name:config.lbx1,
		        				data:xdata
		        			}],
		         		    yAxis : [{
		        				name : config.lby1, 
		        				type : 'value', 
		        				scale : true,
		        				//precision:1,
		        				boundaryGap : [ 0.00, 0.02 ]
		        			}, {
		        				name : config.lby2, 
		        				type : 'value',
		        				scale : true, 
		        				//precision:1, 
		        				boundaryGap : (config.typey1=='line'?[ 0.02, 0.02 ]:'')
		        			}],
		         		    series : []
		         		};
		    		 /*将数据放入series中*/
		    		 for(var i=0;i<listNmY1.length;i++){
		    			 var seri={
	    					name:listNmY1[i],
	    					type:((config.typey1==null||typeof(config.typey1)=='undefined')?'line':config.typey1), 
        		            showAllSymbol : true, 
        		            barMaxWidth:20, 
        		            itemStyle : {
        						normal : {
        							color : _that.getColor(i),//(i==0?_that.color_blue:(i==1?_that.color_warn:(i==2?_that.color_error:'#12B6E3'))),
        							lineStyle : {width : 2},
        							label : {
        								show : false, 
        								position : 'right',
        								textStyle : {fontStyle : 'bolder',fontSize : 12}
        							}
        						}
        					}, 
        					symbol : 'emptyCircle',
        					symbolSize : 2, 
        		            data:ydata[i] 
		    			 }
		    			 option.series.push(seri);
		    		 }
		    		 if(listNmY2!=null&&typeof(listNmY2)!="undefined"){
		    			 for(var i=0;i<listNmY2.length;i++){
			    			 var seri={
		    					name:listNmY2[i],
	         		            type:((config.typey2==null||typeof(config.typey2)=='undefined')?'line':config.typey2), 
	         		            yAxisIndex:1,
	         		            barMaxWidth:20, 
	         		            showAllSymbol : true, 
	         		            itemStyle : {
	         						normal : {
	         							color :_that.getColor(i),// (i==0?_that.color_blue:(i==1?_that.color_warn:(i==2?_that.color_error:'#12B6E3'))),
	         							lineStyle : {width : 2},
	         							label : {
	         								show : false, 
	         								position : 'right',
	         								textStyle : {fontStyle : 'bolder',fontSize : 12}
	         							}
	         						}
	         					}, 
	         					symbol : 'emptyRectangle',
	         					symbolSize : 2,
	         		            data:y2data[i] 
			    			 }
			    			 option.series.push(seri);
			    		 }
		    		 } 
		    		option.legend.data=lengend;
		    		if(typeof(target)=="string")
		    			commonChart = echarts.init(document.getElementById(target));
			    	else
			    		commonChart = echarts.init(target);
		 			commonChart.setOption(option);
		 			window.onresize = commonChart.resize; 
		    	 }
			};
			if(url!=''){
				$.ajax({ 
				     type: 'GET',
				     url: url,
				     data: queryparam,
				     dataType : "json",
				     success :this.bindChart
				});
			}else{
				/*此时queryparam为data对象*/
				this.bindChart(queryparam);
			}
			return commonChart;
		}
	};
});