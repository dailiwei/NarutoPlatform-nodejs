/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2013, 2014 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/**
 * Standard IOC busy pane.
 * 
 * Example:
 * 
 * var busyPane = new com.ibm.ioc.widget.BusyPane({
 * 		target: "aDiv"
 * });
 * busyPane.startup();
 * busyPane.show();
 * busyPane.hide();
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/widget/Standby",
	"dojo/dom-style",
	"base/i18n!BusyPane"
	],
	function(
		declare, lang, window, domClass, domConstruct,
		Standby,
		domStyle,
		i18nRes) { 
		return declare("com.ibm.ioc.widget.BusyPane", [Standby], {
			
			constructor: function(/*Object*/ args) {
				lang.mixin(this, args);
			},
			
			postMixInProperties: function() {
				this.inherited(arguments);
				
				this.imageText = "请等待";
				this.text = null;
				
				if (domClass.contains(window.body(), "dark")) {
					this.image = require.toUrl(APP_ROOT+"base/idx/themes/oneuidark/idx/images/loadingAnimation38px.gif").toString();
				} else {
					this.image = require.toUrl(APP_ROOT+"base/idx/themes/oneui/idx/images/loadingAnimation38px.gif").toString();
				}
			},
			
			postCreate: function() {
				this.inherited(arguments);
				
				if (this.target && this.target != "") {
					domConstruct.place(this.domNode, window.body());
				}
				
//				aspect.before(this, "show", lang.hitch(this, function() {
//					domConstruct.place(this.domNode, this.target, "last");
//					var parent = this.target.parentNode;
//				    while (parent) {
//				    	if (domClass.contains(parent, "iocTaskbarFloatingPane")) {
//				    		break;
//				    	} else {
//				    		parent = parent.parentNode;
//				    	}
//				    }
//				    
//				    if (parent) {
//				    	domConstruct.place(this.domNode, parent, "after");
//				    } else {
//				    	domConstruct.place(this.domNode, window.body());
//				    }
//				}));
			},
			isBusy: function() {
				var displayValueOfOverlay = domStyle.get(this.domNode.firstChild, "display");
				if(displayValueOfOverlay == "none") {
					return false;
				}else {
					return true;
				}
			}
		});
	}
);
