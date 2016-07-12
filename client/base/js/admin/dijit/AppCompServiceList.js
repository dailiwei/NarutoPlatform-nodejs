///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        "dojo/topic",
        "dojo/json",
        'base/_BaseWidget',
        'dijit/_TemplatedMixin',
        "dojo/text!./template/AppCompServiceList.html",
        "dojo/text!./css/AppCompServiceList.css",
        'dojo/on',
        'dojo/mouse',
        'dojo/query',
        'base/admin/AppCommon',
        "base/utils/commonUtils",

        "gridx/core/model/cache/Async",
        "gridx/Grid",
        "gridx/modules/VirtualVScroller",
        "gridx/modules/ColumnResizer",
        "gridx/modules/extendedSelect/Row",
        "gridx/modules/SingleSort",
        "gridx/modules/Pagination",
        "gridx/modules/pagination/PaginationBar",
        "gridx/modules/Focus",
        "gridx/support/exporter/toCSV",
        "gridx/modules/CellWidget",
        "gridx/modules/Edit",
        'dojo/data/ItemFileWriteStore',
        "base/admin/dijit/CustomEditor",

        'base/widget/Popup',
        "./ServiceAdd"
    ],
    function (
        declare,
        lang,
        html,
        topic,
        JSON,
        _WidgetBase,
        _TemplatedMixin,
        template,
        css,
        on,
        mouse,
        query,
        AppCommon,
        commonUtils,

        Async,
        Grid,
        VirtualVScroller,
        ColumnResizer,
        SelectRow,
        SingleSort,
        Pagination,
        PaginationBar,
        Focus,
        toCSV,
        CellWidget,
        Edit,
        ItemFileWriteStore,
        CustomEditor,

        Popup,
        ServiceAdd
    ) {
        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            declaredClass: 'base.admin.dijit.AppCompServiceList',
            'baseClass':'app-comp-service-list',
            currentCmp:null,
            firstLoad:null,
            data_list:null,
            roleList:null,
            constructor: function (args) {
                /*jshint unused: false*/
                this.setCss(css);
                declare.safeMixin(this, args);
                topic.subscribe("base/admin/AppCompsSetting/AppCompServiceList",lang.hitch(this,this.updataCompServiceList));
                topic.subscribe("base/admin/AppCompsSetting/UpdateField",lang.hitch(this,this.UpdateField));
                this.currentCmp = {};
                this.firstLoad = true;
                this.currentCell = null;
                this.data_list = [];
                this.roleList = [];
                topic.subscribe("base/admin/AppCompsSetting/AppCompServiceList/Update",lang.hitch(this,this.updataCompServiceListByAdd));

            },

            postCreate: function () {
                this.own(on(this.domNode, 'mouseover', lang.hitch(this, this.mouseover)));
                this.own(on(this.domNode, 'mouseout', lang.hitch(this, this.mouseout)));

                ////测试添加
                //var json = dojo.fromJson(JSON.stringify(this.testdata));
                //if (json.success == true) {//成功返回
                //    this.createGrid(json.data);
                //}

                //去获取下角色的列表

                this.getRoleList();
            },
            testdata:{
                "success":true,
                "data":[
                {"id":1,"url":"base/api/common/ui-service/","grp":"用户组1","get":"Yes","put":"No","post":"Yes","delete":"Yes"},
                {"id":2,"url":"base/api/common/map-service/","grp":"用户组2","get":"Yes","put":"Yes","post":"No","delete":"No"},
                {"id":3,"url":"base/api/common/session-service/","grp":"用户组3","get":"Yes","put":"Yes","post":"No","delete":"No"},
                {"id":4,"url":"base/api/common/mockup-service/","grp":"用户组4","get":"Yes","put":"No","post":"No","delete":"No"},
                {"id":5,"url":"base/api/common/ldap-service/","grp":"用户组5","get":"Yes","put":"Yes","post":"Yes","delete":"No"},
                {"id":6,"url":"base/api/common/user-service/","grp":"用户组6","get":"Yes","put":"Yes","post":"No","delete":"No"},
                {"id":7,"url":"base/api/common/group-service/","grp":"用户组7","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":8,"url":"base/api/commonui-service/","grp":"用户组8","get":"No","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":9,"url":"base/api/common/ui-service/","grp":"用户组9","get":"Yes","put":"No","post":"No","delete":"No"},
                {"id":10,"url":"base/api/common/ui-service/","grp":"用户组10","get":"Yes","put":"No","post":"No","delete":"No"},
                {"id":11,"url":"base/api/common/ui-service/","grp":"用户组11","get":"Yes","put":"No","post":"No","delete":"No"},
                {"id":12,"url":"base/api/common/ui-service/","grp":"用户组12","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":13,"url":"base/api/common/ui-service/","grp":"用户组13","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":14,"url":"base/api/common/ui-service/","grp":"用户组14","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":15,"url":"base/api/common/ui-service/","grp":"用户组15","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":16,"url":"base/api/common/ui-service/","grp":"用户组16","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":17,"url":"base/api/common/ui-service/","grp":"用户组17","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"},
                {"id":18,"url":"base/api/common/ui-service/","grp":"用户组18No","get":"Yes","put":"Yes","post":"Yes","delete":"Yes"}
                ]
            },
           // testdata:"{\"success\":true,\"data\":[{\"stcd\":\"61609100\",\"tm\":\"07-13 08\",\"stnm\":\"长轩岭(二)\",\"lgtd\":\"114.35\",\"lttd\":\"31.083333\",\"addvcd\":\"420116\",\"drp\":162},{\"stcd\":\"62205600\",\"tm\":\"07-13 08\",\"stnm\":\"花园\",\"lgtd\":\"113.966666\",\"lttd\":\"31.25\",\"addvcd\":\"420921\",\"drp\":151},{\"stcd\":\"62915370\",\"tm\":\"07-13 08\",\"stnm\":\"赵店水库（坝上）\",\"lgtd\":\"118.181111\",\"lttd\":\"32.022989\",\"addvcd\":\"341124\",\"dyp\":133.5},{\"stcd\":\"61420250\",\"tm\":\"07-13 08\",\"stnm\":\"南竹坪\",\"lgtd\":\"110.046111\",\"lttd\":\"29.746111\",\"addvcd\":\"430822\",\"dyp\":132.5},{\"stcd\":\"61610600\",\"tm\":\"07-13 08\",\"stnm\":\"李家集\",\"lgtd\":\"114.666666\",\"lttd\":\"30.883333\",\"addvcd\":\"420117\",\"drp\":123.7},{\"stcd\":\"61614200\",\"tm\":\"07-13 08\",\"stnm\":\"浮桥河\",\"lgtd\":\"114.881\",\"lttd\":\"31.169944\",\"addvcd\":\"421181\",\"dyp\":115},{\"stcd\":\"61420220\",\"tm\":\"07-13 08\",\"stnm\":\"辽竹湾\",\"lgtd\":\"109.9925\",\"lttd\":\"29.717778\",\"addvcd\":\"430822\",\"dyp\":105},{\"stcd\":\"60805700\",\"tm\":\"07-13 08\",\"stnm\":\"红枫\",\"lgtd\":\"106.422832\",\"lttd\":\"26.552301\",\"addvcd\":\"520181\",\"dyp\":101},{\"stcd\":\"61609100\",\"tm\":\"07-13 08\",\"stnm\":\"长轩岭(二)\",\"lgtd\":\"114.35\",\"lttd\":\"31.083333\",\"addvcd\":\"420116\",\"drp\":162},{\"stcd\":\"62205600\",\"tm\":\"07-13 08\",\"stnm\":\"花园\",\"lgtd\":\"113.966666\",\"lttd\":\"31.25\",\"addvcd\":\"420921\",\"drp\":151}]}",

            createGrid:function(list){
                var data = {
                    identifier: "id",
                    items: []
                };

                this.data_list = list;

                var rows = 4;
                for (var i = 0, l = this.data_list.length; i < l; i++) {
                    data.items.push(lang.mixin({id: i + 1}, this.data_list[i % l]));
                }

                this.gridStore = new ItemFileWriteStore({data: data});

                //var layout = [
                //    {
                //        field:"url",
                //        name:"URL"
                //    },
                //    {
                //        field:"grp",
                //        name: "用户组"
                //    },
                //    {
                //        name: "GET",
                //        editable: true,
                //        formatter: function(rawData){
                //            return rawData.get;
                //        },
                //        editor: CustomEditor,
                //        editorArgs: {
                //            //Feed our editor with proper values
                //            toEditor: function(storeData, gridData){
                //                return gridData.trim();
                //            }
                //        },
                //        //Define our own "applyEdit" process
                //        customApplyEdit: function(cell, value){
                //            return cell.row.setRawData({
                //                get: value
                //            });
                //        }
                //    },
                //    {
                //        field: "put",
                //        name: "PUT"
                //    },
                //    {
                //        field: "post",
                //        name: "POST"
                //    },
                //    {
                //        field: "delete",
                //        name: "DELETE"
                //    }
                //];

                var layout = [
                    {
                        field:"url",
                        name:"URL",
                        width:"250px"
                    },
                    {
                        field:"grp",
                        name: "用户组"
                    },
                    {
                        name: "GET",
                        editable: true,
                        formatter: function(rawData){
                            return rawData.rAccess?"允许":"禁止";
                        },
                        editor: CustomEditor,
                        editorArgs: {
                            toEditor: function(storeData, gridData){
                                return gridData.trim();
                            }
                        },
                        customApplyEdit: function(cell, value){
                            return cell.row.setRawData({
                                rAccess: value
                            });
                        }
                    },
                    {
                        name: "PUT",
                        editable: true,
                        formatter: function(rawData){
                            return rawData.uAccess?"允许":"禁止";
                        },
                        editor: CustomEditor,
                        editorArgs: {
                            toEditor: function(storeData, gridData){
                                return gridData.trim();
                            }
                        },
                        customApplyEdit: function(cell, value){
                            return cell.row.setRawData({
                                uAccess: value
                            });
                        }
                    },
                    {
                        name: "POST",
                        editable: true,
                        formatter: function(rawData){
                            return rawData.cAccess?"允许":"禁止";
                        },
                        editor: CustomEditor,
                        editorArgs: {
                            toEditor: function(storeData, gridData){
                                return gridData.trim();
                            }
                        },
                        customApplyEdit: function(cell, value){
                            return cell.row.setRawData({
                                cAccess: value
                            });
                        }
                    },
                    {
                        name: "DELETE",
                        editable: true,
                        formatter: function(rawData){
                            return rawData.dAccess?"允许":"禁止";
                        },
                        editor: CustomEditor,
                        editorArgs: {
                            toEditor: function(storeData, gridData){
                                return gridData.trim();
                            }
                        },
                        customApplyEdit: function(cell, value){
                            return cell.row.setRawData({
                                dAccess: value
                            });
                        }
                    }
                ];

                this.grid = new Grid({
                    cacheClass: Async,
                    selectRowTriggerOnCell: true,
                    modules: this._getModules(),
                    style: "width: 100%;height:100%;position:relative;",
                    structure: layout,
                    store:this.gridStore,
                    autoHeight: false
                });
                this.grid.placeAt(this.gridDiv);
                this.grid.startup();

                setTimeout(lang.hitch(this,function(){
                    this.grid.resize();
                }),100);

                this.grid.connect(this.grid, 'onRowClick', lang.hitch(this,function(event){

                    var selectedId = event.rowId;

                    var item = this.grid.model.byId(selectedId).item;
                    if(selectedId==2)return;

                    var columnIndex = event.columnIndex;
                    var columnFiled="";
                    if(columnIndex==0){
                        columnFiled = "url";
                    }else if(columnIndex==1){
                        columnFiled = "grp";
                    }else if(columnIndex==2){
                        columnFiled = "rAccess";
                    }else if(columnIndex==3){
                        columnFiled = "uAccess";
                    }else if(columnIndex==4){
                        columnFiled = "cAccess";
                    }else if(columnIndex==5){
                        columnFiled = "dAccess";
                    }


                    this.currentCell = {"item":item,"filed":columnFiled};

                }));

                //base/api/cfg/app/{appId}/cmpt/{cmptId}/service
            },
            currentCell:null,
            updateGrid:function(list){
                var data = {
                    identifier: "id",
                    items: []
                };

                var rows = 4;
                for (var i = 0, l = list.length; i < l; i++) {
                    data.items.push(lang.mixin({id: i + 1}, list[i % l]));
                }


                this.gridStore = new ItemFileWriteStore({data: data});
                this.grid.setStore(this.gridStore);
            },
            _getModules:function(){
                return [
                    Focus,
                    VirtualVScroller,
                    ColumnResizer,
                    SelectRow,
                    SingleSort,
                    CellWidget,
                    Edit,
                    {moduleClass: Pagination,
                        _pageSize:20},
                    {moduleClass: PaginationBar,
                        sizes:[20, 100, 250, 500, 0]
                    }
                ];
            },
            startup: function () {
                this.inherited(arguments);
            },
            updataCompServiceList:function(cmpt){

                this.currentCmp = cmpt;
                //重新刷新列表
                if(this.firstLoad){

                    this.getServiceList().then(lang.hitch(this,function(list){
                        this.createGrid(list);
                    }));
                    this.firstLoad = false;
                }else{
                    this.getServiceList().then(lang.hitch(this,function(list){
                        this.updateGrid(list);
                    }));
                }
            },
            getServiceList:function(){
                var url = AppCommon.getCmptServiceList;
                url = url.replace(/{appId}/i, this.appId).replace(/{cmptId}/i, this.currentCmp.cmpt.cmptId);
                return commonUtils.get(url).then(lang.hitch(this, function (json) {
                    return json.data;
                }));
            },
            UpdateField:function(access){

                //后台提交修改access
                //得到当前的选中的cell
                if(this.currentCell){
                    // {"item":item,"filed":columnFiled};
                    var url = AppCommon.getCmptServiceList;
                    url = url.replace(/{appId}/i, this.appId).replace(/{cmptId}/i, this.currentCmp.cmpt.cmptId);


                    var obj = {};
                    obj["serviceId"] = this.currentCell.item["serviceId"][0];
                    obj["grp"] = this.currentCell.item["grp"][0];
                    obj[this.currentCell["filed"]] = access;
                    var list = [
                        obj
                    ];

                    var listStr= JSON.stringify(list);
                    //更新
                    return commonUtils.put(url, listStr).
                        then(lang.hitch(this, function(json) {
                            if (json.success) { //成功返回
                                return true;
                            } else {
                                return null;
                            }
                        }));

                }
            },
            deleteService:function(evt){
                if(this.currentCell){
                    var url = AppCommon.getCmptServiceList;
                    url = url.replace(/{appId}/i, this.appId).replace(/{cmptId}/i, this.currentCmp.cmpt.cmptId);


                    var obj = {};
                    obj["serviceId"] = this.currentCell.item["serviceId"][0];
                    obj["grp"] = this.currentCell.item["grp"][0];
                    var list = [
                        obj
                    ];

                    var listStr= JSON.stringify(list);
                    //更新
                    commonUtils.del(url, listStr).
                        then(lang.hitch(this, function(json) {
                            if (json.success) { //成功返回
                                topic.publish("base/manager/message",{state:"info",title:"删除成功",content:"<div> 成功将【"+ this.currentCell.item["serviceNm"][0]+"】权限删除</div>"});

                                this.updataCompServiceList(this.currentCmp);
                            }
                        }));
                }else{
                    topic.publish("base/manager/message",{state:"info",title:"删除服务",content:"请先选择一个服务"});
                }
            },
            addService:function(evt){
                var panel = new ServiceAdd({"appId":this.appId,"cmptId": this.currentCmp.cmpt.cmptId,"serviceList":this.data_list,"roleList":this.roleList});

                var pop = new Popup({
                    content: panel,
                    container: "main-page",
                    titleLabel: "添加服务",
                    width: 700,
                    height: 500,
                    buttons: []
                });
            },
            getRoleList:function(){
                var groupListUrl = AppCommon.getOrg;

                commonUtils.get(groupListUrl).
                    then(lang.hitch(this, function(json) {
                        if (json.success) { //成功返回
                            this.roleList = json.data;
                        }
                    }));
            },
            updataCompServiceListByAdd:function(){
                this.updataCompServiceList(this.currentCmp);

            }

        });
    });