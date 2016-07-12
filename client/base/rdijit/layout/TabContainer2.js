///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 16：25
///////////////////////////////////////////////////////////////////////////

define(
		[ 'dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array',
				'dojo/_base/html', 'dojo/on', 'dojo/query',
				'dojo/NodeList-manipulate', 'dijit/_WidgetBase',
				'dijit/_TemplatedMixin', './ViewStack', '../utils' ],
		function(declare, lang, array, html, on, query, nlm, _WidgetBase,
				_TemplatedMixin, ViewStack, utils) {
			return declare(
					[ _WidgetBase, _TemplatedMixin ],
					{

						'baseClass' : 'rdijit-layout-tab3', 
						declaredClass : 'rdijit.layout.TabContainer',

						templateString : '<div>'
								+ '<div class="tab_container_head" data-dojo-attach-point="controlNode"></div>'
								+ '<div class="rdijit-layout-container" data-dojo-attach-point="containerNode"></div>'
								+ '</div>',
						constructor : function() {
							this.controlNodes = [];
						},
						postCreate : function() {
							this.inherited(arguments);
							if (this.tabs.length === 0) {
								return;
							}
							this.viewStack = new ViewStack(null,
									this.containerNode);
							var width = 1 / this.tabs.length * 100 - 20;
							if (this.isNested) {
								html.addClass(this.domNode, 'nested');
							}
							this.tabs.forEach(lang.hitch(this, function(
									tabConfig, index) {
								this._createTab(tabConfig, width, index);
							}));
						},
						controlNodes : null,
						startup : function() {
							this.inherited(arguments);
							if (this.selected) {
								this.selectTab(this.selected);
							} else if (this.tabs.length > 0) {
								this.selectTab(0);
							}
							utils.setVerticalCenter(this.domNode);
						},
						
						_createTab : function(tabConfig, width, index) {
							var ctrlNode;
							var iconNode=''; 
							if(tabConfig.icon!=null&&typeof(tabConfig.icon) != "undefined"){ 
								iconNode='<i class="fa '+tabConfig.icon+'"></i>'; 
							}
							ctrlNode = html.create('div', { 
								innerHTML : iconNode+'<span style="vertical-align: middle;">'+tabConfig.title+'</span>',
								'class' : 'iconItem text-center', 
								/*style : {
									width : this.isNested ? 'auto' : width
											+ '%'
								},*/
								label : tabConfig.title
							}, this.controlNode);
							if (tabConfig.content.domNode) {
								this.viewStack.viewType = 'dijit';
							} else {
								this.viewStack.viewType = 'dom';
							}
							tabConfig.content.label = tabConfig.title;
							this.viewStack.addView(tabConfig.content);
							this.own(on(ctrlNode, 'click', lang.hitch(this,
									this.selectTab, index)));
							ctrlNode.label = tabConfig.title;
							this.controlNodes.push(ctrlNode);
						},

						onSelect : null,
						activeIndex : -1,
						selectTab : function(index) {
							if (index == this.activeIndex)
								return false;
							if (this.onSelect && !this.onSelect(index)) {
								return;
							}
							this._selectControl(index);
							this.viewStack.switchView(index);
							this.activeIndex = index;
							if(this.tabChanged){
								this.tabChanged(index);
							}
							
						},

						_selectControl : function(index) {
							array.forEach(this.controlNodes, function(ctrlNode,
									i) {
								html.removeClass(ctrlNode,
										'rdijit-state-selected');
								if (i === index) {
									html.addClass(ctrlNode,
											'rdijit-state-selected');
								}
							});
						},
						addChild : function(child) {

							this.tabs.push(child);
						}

					});
		});