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
        'dojo/_base/array',
        'base/_BaseWidget',
        'dijit/_TemplatedMixin',
        "dojo/text!./template/AppLayoutPrev.html",
        "dojo/text!./css/AppLayoutPrev.css",
        'dojo/on',
        'dojo/mouse',
        'dojo/query'
    ],
    function(declare, lang, htmlUtil, array, _WidgetBase, _TemplatedMixin, html, css, on, mouse, query) {
        return declare("base.admin.dijit.AppLayoutPrev", [_WidgetBase, _TemplatedMixin], {
            templateString: html,
            'baseClass': "base-admin-dijit-AppLayoutPrev",
            layoutList: [],
            constructor: function(data) {
                /*jshint unused: false*/
                this.layoutList = data;
                this.setCss(css);
                if (!this.id) {
                    this.id = dojox.uuid.generateRandomUuid();
                }

            },
            postCreate: function() {

            },
            startup: function() {

            },
            initAvalon: function(argument) {
                var vm = avalon.define({
                    $id: "AppLayoutPrev" + this.id,
                    layoutList: this.layoutList,
                    _imageSelect:lang.hitch(this,function  (id) {
                     this.layoutId = id;
                    })
                });
                avalon.scan(this.domNode);
            },
            layoutId: null,
            _imageSelect: function(e) {

                //修改当前的layoutid
                this.layoutId = e.currentTarget.id;
                Logger.log(this.layoutId);

                var nodes = query('.layoutImage', this.domNode);
                array.forEach(nodes, lang.hitch(this, function(ctrlNode) {
                    htmlUtil.removeClass(ctrlNode, 'layoutImageSelect');
                }));

                //var current = query('.layoutImage', )[0];
                htmlUtil.addClass(e.currentTarget, 'layoutImageSelect');
            },
            _save: function() {
                if (!this.layoutId) {
                    this.layoutId = "Base.FloatLayout";
                };
                this.getParent().closeLayoutPrev(this.layoutId);
            }

        });
    });
