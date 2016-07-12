///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 01:43
///////////////////////////////////////////////////////////////////////////

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	'dojo/on',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/AppListView.html",
	    "dojo/text!./css/AppListView.css",
        "dojo/topic", 
	"rdijit/layout/TileLayoutContainer",
	"rdijit/layout/GroupTileLayoutContainer",
	"./dijit/ImageNode",
	"./dijit/AppItemNode",
	"rdijit/form/Search",
        "dojo/Deferred",
	'base/widget/Popup',
	'base/widget/PopupMini',
	'base/admin/application/AppInfoPanel',
	'base/admin/application/AppManageFrame',
	'base/admin/AppCommon',
	"base/utils/commonUtils",
	"dojo/promise/all",
	'require'
        ],function(
        	declare,
        	lang,
			html,
			on,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,

    		template,
			css,
    		topic,
			TileLayoutContainer,
			GroupTileLayoutContainer,
			ImageNode,
			AppItemNode,
			Search,
			Deferred,
			Popup,
			PopupMini,
			AppInfoPanel,
			AppManageFrame,
			AppCommon,
			commonUtils,
			all
    	 
        ){
	return declare("base.admin.AppListView", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template,
		'baseClass':"base-admin-AppListView",
		name:"",
		sortType:null,//排序类型
		adcdList:null,
		constructor: function(args){
			var methodName = "constructor";
			declare.safeMixin(this, args);
			//设置样式
			this.setCss(css);

			this.name = "name";

			//监听个创建新应用的方法
			topic.subscribe("base/admin/AppListView/createApp",lang.hitch(this,this.createApp));
			topic.subscribe("base/admin/AppListView/applistUpdate",lang.hitch(this,this.applistUpdate));

			this.appList = [];
			this.sortType = "adcd";//"categoryId"
 
		    this.adcdList = {
                  "000000":"其他"
                   };		  		   
		},

		postCreate:function(){
			this.inherited(arguments);

			//创建搜索框
			var search1 = new Search({
				placeholder: '关键字搜索',
				style: "width:240px"
			},this.searchNode);
			search1.onSearch = lang.hitch(this,function(text){
				if(text==""){
					this.createGroupTile(this.appList);
					return ;
				}
				//根据名字来更新
				var slist = [];
				for(var i=0;i<this.appList.length;i++){

					if (this.appList[i].appNm.indexOf(text) >= 0) {
						slist.push(this.appList[i]);
					}
				}

				this.createGroupTile(slist);

			});
			search1.startup();
		},
		resize:function(){
//			alert("xxxxxx"+this.appList.length);
			//重新刷新
//			this.createGroupTile(this.appList);
			
			if(commonUtils.isMobile()){
				html.setStyle(this.searchNodeDiv,"display","none");
			}else{
				html.setStyle(this.searchNodeDiv,"display","block");
			}
		},
		startup:function(){
			this.inherited(arguments);
			//后台请求数据
			//this._getApps().then(lang.hitch(this,this.createTile));
			var buzTypeDefer =this._getBuzTypeList().then(lang.hitch(this,function(list){
				var _buzTypeList = list;
				this.buildAdcdListforBuzType(_buzTypeList);
				
			}));
			//因为要用到行政区的东西，所以先获取下行政区的东西  废掉，极其耗时低效，fdw20160114 16：09
			/*var adcdDefer =this._getAdcdList().then(lang.hitch(this,function(list){
				var _adcdList = list;
				this.buildAdcdList(_adcdList); 
				
			}));*/
			var adcdDefer=null; 
			
			all([buzTypeDefer,adcdDefer]).then(lang.hitch(this,function(){
				this._getApps().then(lang.hitch(this,this.createGroupTile));
			}));
			
			
		},
		_getBuzTypeList:function(){
			return commonUtils.get( window.APP_ROOT+"base/api/cfg/cats" ).then(lang.hitch(this, function (json) {
				var buzTypeList =  json.data;
				return buzTypeList;
			})); 
		},
		_getAdcdList:function(){
			return commonUtils.get( window.APP_ROOT+"base/api/region-service/prvncandcity" ).then(lang.hitch(this, function (json) {
				var adcdList =  json.data;
				return adcdList;
			}));
		},
		
		applistUpdate:function(){
			this._getApps().then(lang.hitch(this,function(list){
				this.appList=list;
				
				this.createGroupTile(list);
			}));
		},
		appList:[],
		createGroupTile:function(list){
			if(!this.groupList){
				this.groupList = new GroupTileLayoutContainer({
					sortType:this.sortType,
					strategy: 'fixWidth',
					//itemSize: {height: ((110/130)*100) + '%'},
					itemSize: {height: 160,width:300 },
					maxCols: 4,
					adcdList:this.adcdList
				}, this.groupNode);

				this.appList = list;
			}
			this.groupList.empty();

			var items = [];
			for(var i=0;i<list.length;i++)
			{
				var node = new AppItemNode(list[i]);
				var data = list[i];
				items.push({groupName:data[this.sortType],data:data,node:node});
				//on(node.domNode, 'click', lang.hitch(this, lang.partial(this._onItemNodeClick, node)));
				//on(node.domNode, 'mouseover', lang.hitch(this, lang.partial(this._onItemNodeClick, node)));
			}


			this.groupList.addItems(items);

			var box = html.getMarginBox(this.domNode);
			var listHeight = box.h - 37 - 21 - 61;
			html.setStyle(this.groupList, 'height', listHeight + 'px');
			if(this.groupList){
				this.groupList.resizeGroup();
			}

//			Logger.log(this.appList.length);
		},

		_onItemNodeClick:function(node){

			node.highLight();
		},

		//创建app
		_createApp:function(){
			//this._getApps().then(lang.hitch(this,this.createGroupTile));
			//弹出创建的窗口
			//var panel = new AppInfoPanel();
			//var pop = new Popup({
			//	content: panel,
			//	container: "main-page",
			//	titleLabel: "新建应用",
			//	width: 650,
			//	height: 380,
			//	buttons: []
			//});
			this.createApp({});
		},
		createApp:function(data){
		    //完成基础信息后，根据返回的数据，新建页面出来
			var panel = new AppManageFrame(data);
			
			var width = this.domNode.style.width;
			var height = this.domNode.style.height;

			var box = html.getMarginBox(this.domNode);

			var pop = new PopupMini({
				content: panel,
				container: "main-page",
				titleLabel: "新建应用",
				width: box.w,
				height: box.h,
				buttons: []
			});
		},
		_getApps:function(){
			//去后台请求数据

			var url;
			if(window.testApp){
				url = APP_ROOT+"base/data/app_list.json";
			}else{
				url = AppCommon.cfg_app;
			}
			//return commonUtils.post( url,
			//	'{"sqlid":"com.ibm.rich.framework.persistence.CfgAppMapper.getApps"  }'
			//).then(lang.hitch(this, function (json) {
			//	return json.data;
			//}));
			return commonUtils.get( url ).then(lang.hitch(this, function (json) {
				
				//for the list and init adcdlist
				var list=json.data;  
				var listAdcd=new Array();
				for(var i=0;i<list.length;i++){
					var  adinfo = new Object();  
					adinfo.adNm=list[i].adNm;  
					adinfo.adCd=list[i].adcd;  
					listAdcd.push(adinfo);
				}  
				this.buildAdcdList(listAdcd);  
				return json.data;
			}));
		},
		_changeSortTypeByAdcd:function(){

			this.sortType = "adcd";
			this.changeTypeNode.innerHTML = "行政区划排序";
			//刷新
			this.createGroupTile(this.appList);
		},
		_changeSortTypeByComp:function(){
			this.sortType = "categoryId";
			this.changeTypeNode.innerHTML = "业务类型排序";
			//刷新
			this.createGroupTile(this.appList);
		},
	    buildAdcdList:function(list){
        	var l = list;
        	for(var i=0;i<l.length;i++){
        		this.adcdList[l[i].adCd] = l[i].adNm;
        	}
        },
        buildAdcdListforBuzType:function(list){
        	var l = list;
        	for(var i=0;i<l.length;i++){
        		this.adcdList[l[i].cd] = l[i].nm;
        	}
        }
		

	});
});