/**
 * Created by richway on 2015/6/17.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    'dojo/on',
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",

    "dojo/text!../template/AppInfoPanel.html",
    "dojo/text!../css/AppInfoPanel.css",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/dom-style",
    "base/utils/commonUtils",
    'base/admin/AppCommon',
    "base/admin/application/AppAccess",
    "rdijit/form/RegionPicker",
    "dojo/request/iframe",
    'require'
], function(
    declare,
    lang,
    html,
    on,
    JSON,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,
 
    template,
    css,
    topic,
    Deferred,
    domStyle,
    utils,
    AppCommon,
    AppAccess,
    RegionPicker,
    diframe

) {
    return declare("base.admin.application.AppInfoPanel", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppInfoPanel",
        constructor: function(args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);

            this.name = "\u6d4b\u8bd5";


        },
        getCmptsMap: function() {

            var url;
            if (window.testApp) {
                url = APP_ROOT + "base/data/app_CmpCatlist.json";
            } else {
                url = AppCommon.getCmptCats;
            }
            return utils.get(url).then(lang.hitch(this, function(json) {
                return json.data;
            }));
        },
        createInfo: function(catalogs) {
            //业务类型应该是从后台返回来的
            //model是根据appid从后台获取的，或者直接传过来的，再看看表结构
            //catalogs= [
            //    {name:"山洪类",value:0},
            //    {name:"水资源类",value:1},
            //    {name:"排水管网类",value:2},
            //    {name:"海洋类",value:3}
            //];
            var model;
            if (this.model) {
                model = this.model;
                this._appId = model.appId; //设置当前id
                this.getParent().setAppName(" " + model.appNm);
            } else {
                model = {
                    appNm: "", //系统名称－校验规范
                    appId: null, //id
                    creator: "管理员", //创建者
                    crtDt: null, //创建时间
                    updDt: null, //持续运行天数
                    adcd: "000000", //所属管辖区域
                    adcdPath: "",
                    categoryId: "", //业务类型表，存储类型，可以动态新建更新,
                    app_catalogName: "山洪防汛", //业务类型表，存储类型，可以动态新建更新,
                    nt: "",
                    stat: "0", //1运行，0，停止，－1 未知,
                    thumbnail: "base/images/logo_default.png"
                   

                };
                this.model = model;
            }

            this.page_vm = avalon.define({
                $id: "appinfopanel_appinfo",
                catalogs: catalogs,
                ADCD: "",
                ADNM: "",
                model: model

            });
            avalon.scan(this.domNode);

            this.createReginPicker();
            this.createFileUpload();
            this.createAppAccess();

        },
        createAppAccess: function() {
            this.appAccessWidget = new AppAccess({
                "appId": this.appId
            });
            this.appAccessWidget.startup();
            this.appAccessWidget.placeAt(this.appAccessDiv);
            this.appAccessWidget.initAvalon();
        },
        createFileUpload: function() {
            //var form = $("#appInfoForm")[0];
            var fileSelect = $("#exampleInputFile")[0];
            var uploadButton = $("#upload");
            var filenameArea = $(".filename");
            var imgthumbnail = $(".img-thumbnail");
            if(fileSelect){
	            fileSelect.onchange = function(e) {
	                if (e.target.files.length > 0) {
	
	                    var file = e.target.files[0];
	                    if (!file.type.match('image.*')) {
	                        topic.publish("base/manager/message", {
	                            state: "error",
	                            title: "图片上传",
	                            content: "<div>文件类型不符，只能上传图片类型</div>"
	                        });
	                        return;
	                    }
	                    if (file.size > 2 * 1024 * 1024) {
	                        topic.publish("base/manager/message", {
	                            state: "error",
	                            title: "图片上传",
	                            content: "<div>文件大小超过2M，请重新上传</div>"
	                        });
	                        return;
	                    }
	                    uploadButton.removeClass('hidden');
	                    filenameArea.removeClass('hidden');
	                    filenameArea.text("文件名:" + file.name);
	                }
	
	                //在这里改变上传按钮的状态
	            };
            }
            uploadButton.click(lang.hitch(this, function(e) {
            	e=e||event;
                e.preventDefault();
                diframe(window.APP_ROOT + "/base/api/file/upload2disk", {
                    form: "appInfoForm",
                    contentType: "multipart/form-data",
                    method: "POST",
                    handleAs: "xml"
                }).then(lang.hitch(this, function(data) {
                    // Do something
                    if (data) {
                        var obj = JSON.parse(data);

                        if (obj.success && obj.data && obj.data[0]) {

                            uploadButton.addClass('hidden');
                            filenameArea.addClass('hidden');
                            var src = "base/files/" + obj.data[0].filePath;
                            // imgthumbnail.attr("src", src);
                            this.page_vm.model.thumbnail = src;
                            //   this.page_vm.model.fullthumbnail = window.APP_ROOT + src;
                            //图片的地址改为返回的地址
                        }
                    }
                    //  Logger.log(data);
                }), function(err) {
                    Logger.log(err);
                    // Handle Error
                });
            }));
        },
        createReginPicker: function() {
            if (this.model.adcdPath == "" || !this.model.adcdPath) {
                this.regionPicker = new RegionPicker({
                    range: [true, true, true]
                });
            } else {
                var path = this.model.adcdPath;//JSON.parse(this.model.adcdPath);
                this.regionPicker = new RegionPicker({
                    range: [true, true, true],
                    //,//省，市，区县，乡镇，村/街道办
                    path: path
                });
            }

            this.regionPicker.onpick = lang.hitch(this, function(data) {
                if (this.page_vm) {
                    //_this.baseInfo.adnm = data.adnm;
                    this.page_vm.model.adcd = data.adCd;
                    var path = this.regionPicker.getPath();
                    path = JSON.stringify(path);
                    this.page_vm.$model.model.adcdPath = path;
                }
            });
            $(this.div_regions).append(this.regionPicker.domNode);
        },
        postCreate: function() {
            this.inherited(arguments);

            //获取应用的类别对照表
            this.getCmptsMap().then(lang.hitch(this, this.createInfo));
            //this.createInfo([]);

        },
        resize: function() {},
        startup: function() {
            this.inherited(arguments);

            ;
        },
        _cancel: function(evt) {

        },
        _save: function(evt) {
            //保存相关信息后台提交请求

            this.getParent().close();

            topic.publish("base/admin/AppListView/createApp", {});
        },
        _onKeyUp: function(e) {
            var name = this.page_vm.$model.model.appNm;

            this.getParent().setAppName(" " + name);

            this.checkLabel();
        },
        checkLabel: function() {
            if (this.page_vm.$model.model.appNm.length > 17) {
                html.setStyle(this.appNameLabelError, 'display', 'block');
                return false;
            } else {
                html.setStyle(this.appNameLabelError, 'display', 'none');
                return true;
            }
        },
        validate: function() {
            //在这里判断是否都填写完整了
            //var validateObjectArray =[
            //    {"name":"appNmLabel",
            //    "display": "HTML标签的显示信息",
            //    "rules": "required|max_length[18]"
            //    }
            //];
            //
            //this.validateForm("appInfoForm",validateObjectArray,lang.hitch(this,function(){
            //
            //    alert("xx");
            //}));
            //alert("xxxx");
        	
        	if(this.page_vm.$model.model.appNm.length==0){
        		 topic.publish("base/manager/message", {
                     state: "warn",
                     title: "信息不完整",
                     content: "请填写应用名称"
                 });
        		 return false;
        	}
        	if(this.page_vm.$model.model.categoryId==''){
        		topic.publish("base/manager/message", {
                    state: "warn",
                    title: "信息不完整",
                    content: "请选择业务类型"
                });
       		 	return false;
        	}
        	if(this.page_vm.model.adcdPath==''){
        		topic.publish("base/manager/message", {
                    state: "warn",
                    title: "信息不完整",
                    content: "请选择行政区域" 
                });
       		 	return false;
        	}
        	
        	
            var val = this.checkLabel();

            return val;
        },
        _appId: null,
        save: function() {
            //直接保存入库新建/更新，根据appid是否为null
            var dataStr = JSON.stringify(this.page_vm.$model.model);
            var url;
            if (window.testApp) {
                url = APP_ROOT + "base/data/app_create_step1.json";
            } else {
                //url = AppCommon.saveAppProp;
                url = AppCommon.cfg_app;
            }
            if (!this.page_vm.$model.model.appId) {
                //新增
                return utils.post(url, dataStr).
                then(lang.hitch(this, function(json) {
                    if (json.success) { //成功返回
                        this._appId = json.data.appId;
                        this.appAccessWidget.saveAppAccess(this._appId).then(
                            lang.hitch(this, function(json) {
                                if (json.success) {
                                    return this._appId;
                                } else {
                                    return null;
                                }

                            })

                        );


                        return this._appId;
                    } else {
                        return null;
                    }
                }));
            } else {
                url += "/" + this.page_vm.$model.model.appId;
                //更新
                return utils.put(url, dataStr).
                then(lang.hitch(this, function(json) {
                    if (json.success) { //成功返回
                        this._appId = this.page_vm.$model.model.appId;
                        this.appAccessWidget.saveAppAccess(this._appId).then(
                            lang.hitch(this, function(json) {
                                if (json.success) {
                                    return this._appId;
                                } else {
                                    return null;
                                }

                            })

                        );
                        return this.page_vm.$model.model.appId;
                    } else {
                        return null;
                    }
                }));
            }

        }

    });
});
