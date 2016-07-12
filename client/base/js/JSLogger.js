/*
 * Licensed Materials - Property of IBM
 *
 * 5725D71
 *
 * (C) Copyright IBM Corp. 2013 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/**
 * Provides common Javascript logging functions
 * <ul>
 * <li>Similar in function to Java's com.ibm.iss.common.logger.ISSBaseLogger</li>
 * <li>Uses standard Logger object for logging</li>
 * </ul>
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare", 
	"dojo/_base/lang"], 
	function(
		array,
		declare,
		lang) {
	return declare("base.JSLogger", null,
		{
			name: null,
			
			constructor: function(/*Object*/ args) {
				this.name = "";
				lang.mixin(this, args);
			},
			  
			/**
			 * log function entry (prints to Logger.debug)
			 * @param functionName
			 */
			traceEntry: function(/*String*/ functionName) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					Logger.debug(this.name, functionName, "ENTRY");
				}
			},
			  
			/**
			 * log function exit (prints to Logger.debug)
			 * @param functionName
			 */
			traceExit: function(/*String*/ functionName) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					Logger.debug(this.name, functionName, "EXIT");
				}
			},
			  
			/**
			 * log exception (prints to Logger.error)
			 * @param functionName
			 * @param exc - the exception instance
			 */
			exception: function(/*String*/ functionName, /*Object*/ exc) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					Logger.error(this.name, functionName, "exception:" + exc.name + ": " + exc.message);
				}
			},
			  
			/**
			 * log debug message; same result as debug function (prints to Logger.debug)
			 * @param functionName
			 * @param message
			 * @param object (optional)
			 */		
			trace: function(/*String*/ functionName, /*String*/ message, /*Object*/ object) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					if (object === undefined) {
						Logger.debug(this.name, functionName, message);
					} else {
						Logger.debug(this.name, functionName, message, object);
					}
				}
			},
			  
			/**
			 * log error message (prints to Logger.error)
			 * @param functionName
			 * @param message
			 * @param object (optional)
			 */
			error: function(/*String*/ functionName, /*String*/ message, /*Object*/ object) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					if (object === undefined) {
						Logger.error(this.name, functionName, message);
					} else {
						Logger.error(this.name, functionName, message, object);
					}
				}
			},
			  
			/**
			 * log warning message (prints to Logger.warning)
			 * @param functionName
			 * @param message
			 * @param object (optional)
			 */
			warning: function(/*String*/ functionName, /*String*/ message, /*Object*/ object) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					if (object === undefined) {
						Logger.warn(this.name, functionName, message);
					} else {
						Logger.warn(this.name, functionName, message, object);
					}
				}
			},
			  
			/**
			 * log info message; same result as trace function (prints to Logger.info)
			 * @param functionName
			 * @param message
			 * @param object (optional)
			 */
			info: function(/*String*/ functionName, /*String*/ message, /*Object*/ object) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {					
					if (object === undefined) {
						Logger.info(this.name, functionName, message);
					} else {
						Logger.info(this.name, functionName, message, object);
					}
				}
			},
			  
			/**
			 * log debug message (prints to Logger.debug)
			 * @param functionName
			 * @param message
			 * @param object (optional)
			 */
			debug: function(/*String*/ functionName, /*String*/ message, /*Object*/ object) {
				if (dojoConfig.isDebug === true && (array.indexOf(dojoConfig.trace, this.name) >= 0 || array.indexOf(dojoConfig.trace, "*") >= 0)) {
					if (object === undefined) {
						Logger.debug(this.name, functionName, message);
					} else {
						Logger.debug(this.name, functionName, message, object);
					}
				}
			}
				
		}
	);
});
