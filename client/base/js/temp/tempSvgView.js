///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway&IBM. All Rights Reserved.
// create by dailiwei 2015-11-20 11:42
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
					"base.temp.tempSvgView",
					[ _Widget, _TemplatedMixin ],
					{ 
						templateString : '<div style="width:100%;height:100%;padding:0px;">  <embed data-dojo-attach-point="emSvg" src=""   width="100%" height="95%" /></div>',
						name : "测试",

						constructor : function(args) {
							
							if(args&&args.parameters&&args.parameters.url){
								this.svgUrl = args.parameters.url;
							}

						},
						postCreate : function() {
							this.inherited(arguments);
							if(this.svgUrl){
								this.emSvg.src =  this.svgUrl;
							} 
						},

						startup : function() {
							this.inherited(arguments);

						}

					});
			return instance;
		});