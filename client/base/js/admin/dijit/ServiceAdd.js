

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'base/_BaseWidget',
  'dijit/_TemplatedMixin',
      "dojo/text!./template/ServiceAdd.html",
      "dojo/text!./css/ServiceAdd.css",
  'dojo/on',
  'dojo/mouse',
  'dojo/query',
  "base/utils/commonUtils",
  'base/admin/AppCommon',
  "dojo/json",
  "dojo/topic"
],
function (declare, lang, htmlUtil, array,_WidgetBase,
		_TemplatedMixin,html, css,on, mouse,
		query,commonUtils,AppCommon,json,topic
		) {
  return declare("base.admin.dijit.ServiceAdd",[_WidgetBase, _TemplatedMixin], {
    templateString: html,
    'baseClass':"base-admin-dijit-ServiceAdd",

    serviceList:null,
    constructor: function(data){
      /*jshint unused: false*/
      this.setCss(css);

      this.serviceList = data.serviceList||[];
      this.roleList = data.roleList||[];
      this.appId = data.appId;
      this.cmptId = data.cmptId;
    },
    postCreate: function () {
      this.inherited(arguments);
      this.initLayout();
    },
    startup: function(){
      this.inherited(arguments);


    },
    initLayout:function(){

      for(var i=0;i<this.serviceList.length;i++){
        var item = this.serviceList[i];
        this.serviceNameList.options.add(new Option(item["serviceNm"],item["url"])); //这个兼容IE与firefox
      }
      //this.serviceNameList.innerHTML = "";

      for(var i=0;i<this.roleList.length;i++){
        var item = this.roleList[i];
        this.serviceRolesList.options.add(new Option(item["roleName"],item["roleId"])); //这个兼容IE与firefox
      }
    },
    servieNameChange:function(evt){
      //服务切换的时候的变化 更新

      var index=this.serviceNameList.selectedIndex; //序号，取当前选中选项的序号
      var url = this.serviceNameList.options[index].value;
      this.serviceUrlLabel.value = url;
      
      this.serviceRUrlLabel.value = url;
    },
    _addService:function(){
    	//rich/base/api/cfg/app/{appId}/cmpt/{cmptId}/service" +
    	var url =  AppCommon.getCmptServiceList;
    	    url = url.replace(/{appId}/i, this.appId).replace(/{cmptId}/i, this.cmptId);
    	    
	    var index=this.serviceNameList.selectedIndex; //序号，取当前选中选项的序号
	    var serviceNm = this.serviceNameList.options[index].label;
	    
	    
	    var index1=this.serviceRolesList.selectedIndex; //序号，取当前选中选项的序号
	    var serviceGrp= this.serviceRolesList.options[index1].label;
    	      
	    var index01=this.serviceGET.selectedIndex; //序号，取当前选中选项的序号
	    var index01_value= this.serviceGET.options[index01].value;
	    if(index01_value=="0"){
	    	index01_value = true;
	    }else{
	    	index01_value = false;
	    }
	    
	    var index02=this.servicePUT.selectedIndex; //序号，取当前选中选项的序号
	    var index02_value= this.servicePUT.options[index02].value;
	    if(index02_value=="0"){
	    	index02_value = true;
	    }else{
	    	index02_value = false;
	    }
	    
	    var index03=this.servicePOST.selectedIndex; //序号，取当前选中选项的序号
	    var index03_value= this.servicePOST.options[index03].value;
	    if(index03_value=="0"){
	    	index03_value = true;
	    }else{
	    	index03_value = false;
	    }
	    
	    var index04=this.serviceDELETE.selectedIndex; //序号，取当前选中选项的序号
	    var index04_value= this.serviceDELETE.options[index04].value;
	    if(index04_value=="0"){
	    	index04_value = true;
	    }else{
	    	index04_value = false;
	    }
	    
	    
	    
    	var data = {
    		    "serviceNm":serviceNm,
    		    "url":this.serviceRUrlLabel.value,
    		    "grp": serviceGrp,
    		    "cAccess": index03_value,
    		    "dAccess": index04_value,
    		    "rAccess": index01_value,
    		    "uAccess": index02_value
    		  };
    	var dataStr = JSON.stringify(data);

        commonUtils.post(url, dataStr).
        then(lang.hitch(this, function(json) {
        	 if (json.success) {
                 topic.publish("base/manager/message",{state:"info",title:"添加成功",content:"<div> 成功将【"+ serviceNm+"】添加</div>"});
                 topic.publish("base/admin/AppCompsSetting/AppCompServiceList/Update");
                 this.getParent().close();
             } else {
                 topic.publish("base/manager/message",{state:"",title:"添加失败",content:"<div> 失败将【"+ serviceNm+"】添加</div>"});
                 this.getParent().close();
             }
        }));	 
    	
    	
    	
     
    },
    _onKeyUp:function(){
    	 this.serviceRUrlLabel.value = this.serviceUrlLabel.value;
    }

  });
});