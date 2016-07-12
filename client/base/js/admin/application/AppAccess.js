/*
 * Licensed Materials - Property of IBM
 *
 * 5725D71
 *
 * (C) Copyright IBM Corp. 2013 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/**
 * Tree Filter Pane Widget
 */

define(
    ["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/json",
        "dojo/ready",
        "dojo/promise/all",
        "dojo/request/xhr",
        "dojo/when",
        "dojo/topic",
        "dojo/parser",
        "base/JSLogger",
        "dojo/dom-class", // domClass.toggle
        "dojo/dom-construct", // domConstruct.place
        "dojo/dom-style",

        "base/_BaseWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!../template/AppAccess.css",
        "dojo/text!../template/AppAccess.html",


        "base/admin/page/ConfigMixin",
        'base/admin/AppCommon',
        "base/utils/commonUtils"

    ],
    
    function(declare, lang, array, JSON, ready,
        all, xhr, when, topic, parser, JSLogger,
        domClass, domConstruct, domStyle, _BaseWidget,
        _TemplatedMixin, _WidgetsInTemplateMixin, css,
        template, ConfigMixin, AppCommon, commonUtils) {
       
    	
        
        ready(function() {
            // Call the parser manually so it runs after our widget is defined, and App has finished loading
            parser.parse();
//            this.showRole();
        });
        return declare(
            "base.admin.application.AppAccess", [_BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin, ConfigMixin], {
                templateString: template,
                id: null,
                appId: null,
                showButton: false,
                constructor: function( /* Object */ kwArgs) {
                    var fn = "constructor";

                    this._logger = new JSLogger({
                        name: "AppAccess"
                    });
                    this._logger.traceEntry(fn);

                    lang.mixin(this, kwArgs);
                    this.setCss(css);

                    if (!this.id) {
                        this.id = dojox.uuid.generateRandomUuid();
                    }


                    this._logger.traceExit(fn);
                },

                postCreate: function() {

                    this.inherited(arguments);
//                	this.showRole();
                },


                saveAppAccess: function(appId) {
            		var allSelectedRecords=$('#allSelectedRecords').val();
            		var srs=allSelectedRecords.split(',');
            	
            			var selectedGroupUrl = AppCommon.getAppAccess;
            			selectedGroupUrl = selectedGroupUrl.replace(/{appId}/i, appId);
                		var jsonArr ="";
                		var AllSelectedRecords=jQuery("#roleTable").jqGrid('getGridParam', 'selarrrow'); 
                		  var _groupObjArray = [];
                          array.forEach(srs, function(sr) {
                        	  if(sr!=''){
                        		  var _obj = {
                        				  'operation': sr.split('@')[1],
                        				  "GRP": sr.split('@')[0],
                        				  "rAccess": true,
                        				  "cAccess": false,
                        				  "uAccess": false,
                        				  "dAccess": false
                        				  
                        		  };
                        		  _groupObjArray.push(_obj);
                        		  
                        	  }
                          });
                		
                		
                	/*	 var _groupList = jQuery("#roleTable").jqGrid('getGridParam', 'selarrrow');
                		  var _groupObjArray = [];
	                        array.forEach(_groupList, function(group) {
	                            var _obj = {
	                            	'operation':
	                                "GRP": group,
	                                "rAccess": true,
	                                "cAccess": false,
	                                "uAccess": false,
	                                "dAccess": false
	    
	                            };
	                            _groupObjArray.push(_obj);
	                        });*/
	                        var xhrArgs = {
	                              headers: {
	                                  "Content-Type": "application/json"
	                              },
	                              data: JSON.stringify(_groupObjArray),
	                              param:{
	                            	  'allSelectedRecords':allSelectedRecords
	                              },
	                              handleAs: "json",
	                              load: function(data) {
	      
	                              },
	                              error: function(error) {
	      
	                                  topic.publish("base/manager/message", {
	                                      state: "error",
	                                      title: "权限保存",
	                                      content: "<div> 页面权限保存失败</div>"
	                                  });
	                              }
	                          }
	      
	                          return xhr.put(selectedGroupUrl, xhrArgs);
                		
  

                },
                startup: function() {
                 //   this.initAvalon();
                },
                initAvalon: function() {
                    var groupListUrl = AppCommon.getOrg;
                    var groupListDefer = xhr.get(
                        groupListUrl, {
                            handleAs: "json"
                        });

                    //this.listPropertyRangeUrl="/ibm/ife/api/cim-service/propertyRange?resourceType="+assetClassId;
                    var selectedGroupUrl = AppCommon.getAppAccess;
                    // selectedGroupUrl = selectedGroupUrl.replace(/\{appId\}/i, this.appId);
                    selectedGroupUrl = selectedGroupUrl.replace(/\{AppId\}/i, this.appId || "thereisnoappidavailable");//如果appId为空即新建app会返回为空
                    var selectedGroupDefer = xhr.get(
                        selectedGroupUrl, {
                            handleAs: "json"
                        });

                    all([groupListDefer, selectedGroupDefer]).then(lang.hitch(this, function(data) {
                        var groupList = data[0] && data[0].data ? data[0].data : [];
                        var selectedGroup = data[1] && data[1].data ? data[1].data : [];
                        var _selectedGroup = []; // 取读权限为真的分组，多做一次判断
                        _selectedGroup = array.filter(selectedGroup, function(group) {
                            return group.rAccess == true;

                        });
                        var _seletectedGroupId = [];
                        array.forEach(_selectedGroup, function(group) {
                            _seletectedGroupId.push(group.grp);
                        });
                        this.vm = avalon.define({
                            $id: "AppAccess" + this.id,
                            $groupList: groupList,
                            showButton: this.showButton,
                            selectedGroup: _seletectedGroupId,
                            "saveWidget": lang.hitch(this, function() {
                                this.saveAppAccess();
                            })
                        });
                        avalon.scan(this.domNode);
                    }));

                },
                reset: function() {

                },

                resize: function() {},

                destroy: function() {

                    this.inherited(arguments);
                    delete avalon.vmodels["AppAccess" + this.id];

                },
                


                //定义一个数组：var AllSelectedRecords = [];
                //查询角色信息
                showRole: function(){
                	var roleword=$('#roleword').val();
//                	alert(roleword);
                	var AllSelectedRecords = [];
                	
                    var selectedGroupUrl = AppCommon.getAppRoles;
                    selectedGroupUrl = selectedGroupUrl.replace(/\{AppId\}/i, this.appId || "thereisnoappidavailable");//如果appId为空即新建app会返回为空
                    
                	var params = {};
                	var roleword = encodeURI(roleword);
            		params['roleword'] = roleword;
            		
            		$("#roleTable").jqGrid('setGridParam', {
            			datatype : 'json',
            			postData:params
            		}).trigger("reloadGrid");
                	
            		var height = $('#appInfoDiv').height();
            		
                	
                	$("#roleTable").jqGrid({
                		url : selectedGroupUrl,
                		datatype : "json",
                		postData:params,
                		mtype : "GET",// 提交方式
                		height : height,// 高度，表格高度。可为数值、百分比或'auto'
//                		width : 600,// 默认列的宽度，只能是象素值，不能是百分比
                	    autowidth:true,//自动宽
                		colNames : [ '角色编码', '角色名称' ],
                		colModel : [ {
                			name : 'roleCode',
                			index : 'ROLE_CODE',
                			width : '20%',
                			align : 'left'
                		}, {
                			name : 'roleName',
                			index : 'ROLE_NAME',
                			width : '20%',
                			align : 'left'
                		} ],
                		rownumbers : true, // 添加左侧行号
                		// altRows:true, // 设置为交替行表格,默认为false
                		sortname : 'ROLE_CODE', // 默认排序字段
                		sortorder : 'asc', // 默认排序规则
                		viewrecords : true, // 是否在浏览导航栏显示记录总数
                		rowNum : 100, // 每页显示记录数
                		rowList : [ 10,15,20,35,50,100,500,1000 ], // 用于改变显示行数的下拉列表框的元素数组。
                		jsonReader : {
                			id : "roleCode", // 设置返回参数中，表格ID的名字为roleCode // !!!!!这里需要角色编码，保存角色编码-用户信息的关系
                			repeatitems : false, // 如果设为false，则jqGrid在解析json时，会根据name来搜索对应的数据元素（即可以json中元素可以不按顺序）；而所使用的name是来自于colModel中的name设定。
                			root : "data", // json中代表实际模型数据的入口
                			rows : "rows", // 数据行（默认为：rows）
                			page : "page", // 当前页
                			total : "pages", // 总页数
                			records : "total" // 总条数

                		},
                		add : true,
                		edit : true,
                		addtext : 'Add',
                		edittext : 'Edit',
                		pager : $('#gridPagerForRole'),
                		/*
                		 * gridComplete: function() {
                		 *  },
                		 */
                		multiselect : true,
                		onSelectRow : function(rowId, status, e) {
                			if (status == true) {
                				AllSelectedRecords.push(rowId);
                				var allSelectedRecords=$('#allSelectedRecords').val();
                				if($('#allSelectedRecords').val().indexOf(rowId+"@init,")>-1){
                				}
                				else if ($('#allSelectedRecords').val().indexOf(rowId+"@del,")>-1){
                					$('#allSelectedRecords').val(allSelectedRecords.replace(rowId+"@del,",""));
                					$('#allSelectedRecords').val(rowId+"@init,"+$('#allSelectedRecords').val());
                				}else if($('#allSelectedRecords').val().indexOf(rowId+"@add,")>-1){
                					
                				}
                				else{
                					$('#allSelectedRecords').val(rowId+"@add,"+$('#allSelectedRecords').val());
                				}
                			}
                			if (status == false) {
                				for (var i = 0; i < AllSelectedRecords.length; i++) {
                					var index = AllSelectedRecords.indexOf(rowId);
                					if (index > -1) {
                						// alert('取消选中'+rowId);
                						AllSelectedRecords.splice(index, 1);
                						var allSelectedRecords=$('#allSelectedRecords').val();
                						if(allSelectedRecords.indexOf(rowId+"@add,")>-1){
                							$('#allSelectedRecords').val(allSelectedRecords.replace(rowId+"@add,",""));
                						} else if(allSelectedRecords.indexOf(rowId+"@init,")>-1){
                							$('#allSelectedRecords').val(allSelectedRecords.replace(rowId+"@init,",rowId+"@del,"));
                						}
                					}
                				}
 
                			}
                		},
                		loadComplete:function(result){
//                			$('#jqgh_roleTable_cb').attr('')
                			
                			if (result.success) {
	                			var roleCodes = result.data;
	                			for (var i = 0; i < roleCodes.length; i++) {
	                				if(roleCodes[i].isUsed=='1'||roleCodes[i].roleCode=='system'){
	                					 var rowId=roleCodes[i].roleCode;
	                					$("#roleTable").jqGrid('setSelection',rowId);
	                					
	                					var allSelectedRecords=$('#allSelectedRecords').val();
	                					if(allSelectedRecords.indexOf(rowId+"@add,")>-1){
	                						$('#allSelectedRecords').val(allSelectedRecords.replace(rowId+"@add,",""));
	                					}
                						if(allSelectedRecords.indexOf(rowId+"@init,")>-1){
                						}else{
                							$('#allSelectedRecords').val(roleCodes[i].roleCode+"@init,"+$('#allSelectedRecords').val());
                						}
	                				}
	                			}
	                		} else {
	                			ShowError('数据加载失败', "提示");
	                		}
                		},

//						 loadComplete : function() {
//							setTimeout(
//									function() {
//										}, 500)
//												},
                		 
                		loadBeforeSend : function(xhr) {
                			$('#cb_roleTable').attr('type','hidden');
                			var page = $("#roleTable").getGridParam("page");
                			var limit = $("#roleTable").getGridParam("rowNum");
                			xhr.setRequestHeader("Range", "limits=" + page + "-" + limit);
                		}// 发送请求
                	});
                	setTimeout(function() {
//                		this.getRoleByUser();
                	}, 500);
                	$(window).bind('resize', function() {
                		var width = $('#divContentRole').width();
                		var height = $('#appInfoDiv').height();
                		
                		$('#roleTable').setGridWidth(width);
                		$('#roleTable').setGridHeight(height);
                		$('#gridPagerForRole').setGridHeight('40px');
                	});
                	
                } 
                   
 
        
            });
 
        
    });
 
