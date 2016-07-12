///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway&IBM. All Rights Reserved.
// create by dailiwei 2015-10-26 14:29
///////////////////////////////////////////////////////////////////////////
define(
		[ "dojo/_base/declare", "dojo/_base/lang", 'dojo/_base/html',
				"dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
				"base/_BaseWidget", "dojo/topic", "dojo/Deferred",
				"dojo/dom-construct", "dojo/dom-class", 'dojo/on',
				"dojo/parser", "dojo/ready"  ],
		function(declare, lang, html, _TemplatedMixin, _WidgetsInTemplateMixin,
				_Widget, topic, Deferred, domConstruct, domClass, on, parser,
				ready ) {

			var instance = null;
			ready(function() {
				parser.parse();

			});

			instance = declare(
					"base.temp.tempImgView",
					[ _Widget, _TemplatedMixin ],
					{ 
						templateString : '<div style="width:100%;height:100%;padding:0px;background-color:gray"><img data-dojo-attach-point="img" src="base/images/rich/bj-gg3-m.jpg" style="width:100%;height:100%"></img></div>',
						name : "测试",

						constructor : function(args) {
							
							if(args&&args.parameters&&args.parameters.url){
								this.imageUrl = args.parameters.url;
							}

						},
						postCreate : function() {
							this.inherited(arguments);
							if(this.imageUrl){
								this.img.src =  this.imageUrl;
							} 
						},

						startup : function() {
							this.inherited(arguments);

						}

					});
			return instance;
		});