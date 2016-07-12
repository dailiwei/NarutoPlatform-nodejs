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
					"base.temp.tempIframeView",
					[ _Widget, _TemplatedMixin ],
					{ 
						templateString : '<div style="width:100%;height:100%;padding:0px;"><iframe data-dojo-attach-point="frame"   style="width:100%;height:100%"/></div>',
						name : "测试",

						content:null,
						constructor : function(args) {
							
							if(args&&args.parameters&&args.parameters.url){
								this.url = args.parameters.url;
								
							} 
							
//							topic.subscribe("meeting/topic",{"topicStr":"gis/map/setCenter","data":{"lgtd":119,"lttd":36}});
							topic.subscribe("meeting/topic",lang.hitch(this,this.topicHandler));

						},
						topicHandler:function(data){
							this.content.contentWindow.dojo.publish(data.topicStr,data.data);
						},
						postCreate : function() {
							this.inherited(arguments);
							if(this.url){
								if(this.url.indexOf("http")>= 0){
									this.frame.src =  this.url;
								}else{
									this.frame.src =  APP_ROOT+this.url;
								}

							} 
							this.content = this.frame;
						},

						startup : function() {
							this.inherited(arguments);

						}

					});
			return instance;
		});