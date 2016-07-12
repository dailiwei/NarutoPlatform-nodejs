define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/on',
        'dojo/mouse',
        'dojo/query',
        'dojo/request/xhr',
        'dojo/topic',
        'dojo/json',
        "dojo/dom-construct"
    ],
    function (declare, lang, html, _WidgetBase, _TemplatedMixin,
              on, mouse, query, xhr, topic, JSON,domConstruct) {
        return declare([_WidgetBase, _TemplatedMixin], {

            templateString: '<div style="width:100%;height:100%;"><div data-dojo-attach-point="boxNode"  style="width:100%;height:100%;" >' +
            '<div style="width:100%;height:30px;padding-left:45px;" data-dojo-attach-point="hNode" >' +
                '<div data-dojo-attach-point="stmContainer" style="float: left"><h3 style=" float: left;margin-top: 5px;height: 25px;vertical-align: middle;text-align: left;color: #527191;font-family: "微软雅黑";font-weight: bold;font-size: 11px;">开始时间: </h3></div>' +
                '<div data-dojo-attach-point="etmContainer" style="float: left"><h3 style=" float: left;margin-top: 5px;height: 25px;vertical-align: middle;text-align: left;color: #527191;font-family: "微软雅黑";font-weight: bold;font-size: 11px;">结束时间: </h3></div>' +
                '<div class="jimu-btn" style="float: right;margin-right:30px;padding-top:3px;"  data-dojo-attach-point="queryDivNode" data-dojo-attach-event="click:query" >查询</div>'+
            '</div>' +
            '<div data-dojo-attach-point="boxNode" style="width:100%;height:290px;border-top:0px solid #caccdd" ></div>' +
            '</div>' +
            '</div>',

            constructor: function (options, dom) {


            },
            isResize:true,
            postCreate: function () {
                //if(this.isResize){
                //    html.setStyle(this.domNode, 'width', 715+"px");
                //    html.setStyle(this.domNode, 'height', 415+"px");
                //}
                this.initDijit();
                this.query();
            },
            hours: [
                {"label": "0  时", "value": "00"},
                {"label": "1  时", "value": "01"},
                {"label": "2  时", "value": "02"},
                {"label": "3  时", "value": "03"},
                {"label": "4  时", "value": "04"},
                {"label": "5  时", "value": "05"},
                {"label": "6  时", "value": "06"},
                {"label": "7  时", "value": "07"},
                {"label": "8  时", "value": "08"},
                {"label": "9  时", "value": "09"},
                {"label": "10时", "value": "10"},
                {"label": "11时", "value": "11"},
                {"label": "12时", "value": "12"},
                {"label": "13时", "value": "13"},
                {"label": "14时", "value": "14"},
                {"label": "15时", "value": "15"},
                {"label": "16时", "value": "16"},
                {"label": "17时", "value": "17"},
                {"label": "18时", "value": "18"},
                {"label": "19时", "value": "19"},
                {"label": "20时", "value": "20"},
                {"label": "21时", "value": "21"},
                {"label": "22时", "value": "22"},
                {"label": "23时", "value": "23"}
            ],
            initDijit:function(){
                //解析配置文件内容，初始化时间选择的
                var hours1 = lang.clone(this.hours);
                var hours2 = lang.clone(this.hours);

                var nowDate = new Date();
                var hour = nowDate.getHours();
                var startTm = new Date();
                startTm.setDate(nowDate.getDate()-15);
                var endTm;
                var index1;
                var index2;
                if ((hour > 2 || hour == 2) && hour < 8) {
                    endTm = nowDate;
                    nowDate.setDate(nowDate.getDate() - 1);
                    index1 = 8;
                    index2 = hour + 1;
                }
                else if ((hour > 8 || hour == 8) && hour < 14) {
                    endTm = nowDate;
                    index1 = 8;
                    index2 = hour + 1;
                }
                else if ((hour > 14 || hour == 14) && hour < 20) {
                    endTm = nowDate;
                    index1 = 8;
                    index2 = hour + 1;
                }
                else if (hour > 20 || hour == 20) {
                    endTm = nowDate;
                    index1 = 8;
                    index2 = hour + 1;
                }
                else if ((hour > 0 && hour < 2) || hour == 0) {
                    nowDate.setDate(nowDate.getDate() - 1);
                    endTm = nowDate;
                    index1 = 8;
                    index2 = hour + 1;
                }
                //时间选择的
                var sdateStr = dojo.date.locale.format(startTm, {datePattern: "yyyy-MM-dd", selector: "date"});

                this.sdate = sdateStr;
                this.sdatePicker = html.create('input', {
                    'class': 'Wdate jimu-input',
                    'style':'width:125px;height:28px;border:1px solid #ecf2ff;float:left;margin-top: 3px',
                    'type':'text',
                    'value':sdateStr,
                    'onfocus':lang.hitch(this,function(evt){
                        window.WdatePicker({startDate:sdateStr,dateFmt:'yyyy-MM-dd'})
                    })
                }, this.stmContainer);


                var edateStr  = dojo.date.locale.format(new Date(), {datePattern: "yyyy-MM-dd", selector: "date"});
                this.edate = edateStr;
                this.edatePicker = html.create('input', {
                    'class': 'Wdate jimu-input',
                    'style':'width:125px;height:28px;border:1px solid #ecf2ff;float:left;margin-top: 3px',
                    'type':'text',
                    'value':edateStr,
                    'onfocus':lang.hitch(this,function(evt){
                        window.WdatePicker({startDate:edateStr,dateFmt:'yyyy-MM-dd'})//,alwaysUseStartDate:true
                    })
                }, this.etmContainer);

            },
            sdate:"2012-07-01",
            edate: "2012-07-02",
            getDateTime:function(){
                this.sdate =  this.sdatePicker.value;
                this.edate =  this.edatePicker.value;
            },
            query: function () {
                var imgNode = html.create('img', {
                    src: "images/common/loading.gif",
                    style:"margin:100px;padding-left:120px"
                }, this.boxNode);

                this.getDateTime();

                //获取下时间
                //dojo.xhrPost({
                //    url:  AppCommon.getDialyRainLineInfo,
                //    handleAs: "text",
                //    content: {'yqm.stcd': this.data.stcd, 'yqm.bgtm':this.sdate,'yqm.endtm':this.edate }
                //}).then(lang.hitch(this, function (response) {
                //
                //    var json = dojo.fromJson(response);
                //    if (json.success == true) {//成功返回
                //        this.createEChart(json.data);
                //    } else {
                //        Logger.log("worng");
                //    }
                //}));


                setTimeout(lang.hitch(this,function(){
                    //测试的
                    var json = dojo.fromJson(this.testData);
                    if (json.success == true) {//成功返回
                        this.createEChart(json.data);
                    } else {
                        Logger.log("worng");
                    }
                }),1000);

            },
            testData:"{\"success\":true,\"data\":[{\"stcd\":\"60106600\",\"tm\":\"2012-05-27 08:00:00\",\"charttm\":\"05-27 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-05-28 08:00:00\",\"charttm\":\"05-28 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-05-29 08:00:00\",\"charttm\":\"05-29 08\",\"dyp\":37.5},{\"stcd\":\"60106600\",\"tm\":\"2012-05-30 08:00:00\",\"charttm\":\"05-30 08\",\"dyp\":14.5},{\"stcd\":\"60106600\",\"tm\":\"2012-05-31 08:00:00\",\"charttm\":\"05-31 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-06-01 08:00:00\",\"charttm\":\"06-01 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-06-02 08:00:00\",\"charttm\":\"06-02 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-06-03 08:00:00\",\"charttm\":\"06-03 08\",\"dyp\":0},{\"stcd\":\"60106600\",\"tm\":\"2012-06-04 08:00:00\",\"charttm\":\"06-04 08\",\"dyp\":1},{\"stcd\":\"60106600\",\"tm\":\"2012-06-05 08:00:00\",\"charttm\":\"06-05 08\",\"dyp\":0.5}]}",
            startup: function () {

            },
            createEChart: function (list) {
                domConstruct.empty(this.boxNode);//清空子节点

                if (list.length>0){
                //if (false){
                    ////当前数据的最新的时间
                    //var time = list[list.length-1]["tm"];//"2015-01-12 08:02:00";
                    //var timeContent = html.create('div', {
                    //    'class': 'jimu-Label-no-mini-nohover jimu-leading-margin025',
                    //    innerHTML: "最新时间:"+time
                    //}, this.hNode2);
                    //return;
                }else{
                    domConstruct.empty(this.boxNode);
                    var content = "暂无相关站点数据";
                    var label2 = html.create('div', {
                        'class': 'paddCenter',
                        innerHTML: content
                    }, this.boxNode);

                    return;
                }

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

                // 基于准备好的dom，初始化echarts图表
                var myChart = echarts.init(this.boxNode);

                var option = {
                    title: {
                        x:"center",
                        text: this.data.stnm.trim()+'日降雨累积曲线',
                        //subtext:"最近一周",
                        textStyle:{
                            fontSize: 14,
                            fontWeight: 'bolder',
                            color:'gray'
                        },
                        subtextStyle:{
                            fontSize: 10
                        }
                    },
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
                        y2:30,y:50,x2:40,x:40
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
                        { name:"日降雨(mm)", type : 'value'},
                        {
                            name:"累计降雨(mm)",
                            type : 'value'
                            //itemStyle: {
                            //    normal: {
                            //        color:"#5cbb87"
                            //    }
                            //}
                        } ],

                    series: [
                        {
                            name: '日降雨',
                            type: 'bar',
                            data: x,
                            //markPoint: {
                            //    data: [
                            //        {type: 'max', name: '最大值'},
                            //        {type: 'min', name: '最小值'}
                            //    ]
                            //},
                            //markLine: {
                            //    data: [
                            //        {type: 'average', name: '平均值'}
                            //    ]
                            //},
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
                            //markPoint : {
                            //    data : [
                            //        {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
                            //        {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
                            //    ]
                            //},
                            //markLine: {
                            //    data: [
                            //        {type: 'average', name: '平均值'}
                            //    ]
                            //},
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

                if(!this.IsPC()){
                    option.toolbox.show = false;
                }
                // 为echarts对象加载数据
                myChart.setOption(option);

                //myChart.on("click", lang.hitch(this, this.chartClick));


            },
            IsPC: function () {
                var userAgentInfo = navigator.userAgent;
                var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
                var flag = true;
                for (var v = 0; v < Agents.length; v++) {
                    if (userAgentInfo.indexOf(Agents[v]) > 0) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            }


        });
    });

