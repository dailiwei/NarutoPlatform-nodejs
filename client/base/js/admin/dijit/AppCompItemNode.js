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
        'base/_BaseWidget',
        'dijit/_TemplatedMixin',
        "dojo/text!./template/AppCompItemNode.html",
        "dojo/text!./css/AppCompItemNode.css",
        'dojo/on',
        'dojo/mouse',
        'dojo/query'
    ],
    function (declare, lang, html, _WidgetBase, _TemplatedMixin, template, css, on, mouse, query) {
        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            declaredClass: 'base.admin.dijit.AppCompItemNode',
            'baseClass':'app-comp-item-node',
             model:null,
            compId:null,
            isSelect:false,//默认是没有选中的
            constructor: function (data) {
                /*jshint unused: false*/
                this.setCss(css);

                this.model = data;
                this.compId = this.model.compId;
            },
            mouseover:function(evt){
                query('.icon_delete',this.domNode).addClass('icon_delete_selected');

            },
            mouseout:function(evt){
                query('.icon_delete', this.domNode).removeClass('icon_delete_selected');

            },
            postCreate: function () {
                this.own(on(this.domNode, 'mouseover', lang.hitch(this, this.mouseover)));
                this.own(on(this.domNode, 'mouseout', lang.hitch(this, this.mouseout)));
                this.own(on(this.domNode, 'click', lang.hitch(this, this.onClick)));

                //解析数据
                this.appCompName.innerHTML =   this.model.cmptNm;
                this.appCompInfo.innerHTML =   this.model.nt;
                this.appCompInfo.title  =this.model.nt;
                this.appComIcon.src = (this.model.thumbnail==null)?APP_ROOT+"base/images/logo_default.png":this.model.thumbnail;

                if(this.model.isUsed=="true"){
                    this.onClick();
                }
            },

            onClick: function () {
                if(this.isSelect){
                    html.setStyle(this.selectNode,"display","none");
                    query(this.domNode).removeClass("node_comp_select");
                    this.isSelect = false;
                }else{
                    html.setStyle(this.selectNode,"display","block");
                    query(this.domNode).addClass("node_comp_select");
                    this.isSelect = true;
                }

            },

            highLight: function () {
                query('.icon_delete', this.getParent().domNode).removeClass('icon_delete_selected');
                query('.icon_delete',this.domNode).addClass('icon_delete_selected');
            },

            startup: function () {
                this.inherited(arguments);
            }

        });
    });