/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2012, 2015 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */

/*
 * Library of common IOC JavaScript functions
 */

define(
    [
        "dojo/_base/array",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/window",
        "dojo/Deferred",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/has",
        "dojo/hccss",
        "dojo/json",
        "dojo/query",
        "dojo/request/xhr",
        "dojo/sniff",
        "dojo/string",
        "dojo/topic",
        "dijit/registry",
        "dojox/uuid/generateRandomUuid",
        "dojo/_base/Color",
        "dijit/ColorPalette",
        "dojo/io-query"
    ],
    function(
        array, declare, lang, win, Deferred, dom, domClass, domConstruct, domGeometry, domStyle, has, hccss, json, query, xhr, sniff, string, topic,
        registry,
        generateRandomUuid,
        Color,
        ColorPalette, ioquery) {
        return declare("base.Library", null, {
            _themeNames: {
                dark: "Dark",
                grey: "Grey"
            },

            _themeClasses: {
                dark: "dark",
                grey: "grey"
            },

            constructor: function( /*Object*/ kwArgs) {
                lang.mixin(this, kwArgs);
            },
            getAppId: function() {
                //TODO finish get AppId in next Sprint.
                return window.APP_ID || "default";
            },
            lazyLoadJs: function(jsSrc) {
                var defer = new Deferred();
                var srcFilename = jsSrc.substring(jsSrc.lastIndexOf('/') + 1);
                var scripts = document.getElementsByTagName("script");
                var isExist = array.some(scripts, function(_script) {
                    if (_script.src) {
                        var _src = _script.src;
                        var _filename = _src.substring(_src.lastIndexOf('/') + 1);
                        if (_filename == srcFilename) {
                            return true;
                        };

                    };
                    return false;
                });
                if (isExist) {
                     defer.resolve();
                } else {
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = jsSrc;
                    document.getElementsByTagName("head")[0].appendChild(script);
                    script.onload = function() {
                        Logger.log("脚本 " + jsSrc + "异步加载完毕!");
                        defer.resolve();
                    };

                }

                return defer;
            },
            /**
             * [将内容拷贝到粘贴板]
             * @param  {[string]} content [要拷贝的内容]
             * 
             */
            copyToClipboard: function(content) {
                window.clipboardData.setData("Text", content);
            },
            /**
             * 处理页面跳转 :
             * 1. 跳转到本页
             * 2. 打开新页
             * @param  {[String]} type       决定是一个URL还是一个页面. 该值 为 'url' 或 'page'
             * @param  {[String]} location   要跳转到哪 . 该值为一个 url 或 pageId
             * @param  {[String]} target     决定是跳转到本页还是新开一个标签或者是窗口. 该值 为 '_blank' 或者保留为空。如果是 '_blank', 会打开一个新的标签页或者窗口
            
             * @param  {[Object]} parameters 要传给目标的参数. 参数应该遵循以下的样式
             * {
             *     "namespace":"aaaa/bbbb/ccccc"    //namespace 用来约定与目标部件通讯 ; 目标部件会用namespace从全局变量global当中寻找自己需要的参数. 例如 window.global["aaaa/bbbb/ccccc"]. 如果type选择了 'url', 只有"data" 会被使用，namespace会被忽略。
             *     "data":{
             *     "paraA":"valueA",
             *     "paraB":"valueB"
             *     }
             * }
             * 
             * 
             */
            changePage: function(type, location, target, parameters) {
                var topicObj = {
                    "target": target
                };

                switch (type.toLowerCase()) {
                    case "page":
                        topicObj.pageId = location;
                        topicObj.parameters = parameters;
                        break;
                    case "url":
                        if (location) {
                            topicObj.url = location;
                            if (parameters && parameters.data) {
                                if (location.indexOf('?') > 0) {
                                    topicObj.url += ioquery.objectToQuery(parameters.data);
                                };
                            };
                        }

                        break;
                    case "label":
                        if (location) {
                            topicObj.url = location; 
                        }

                        break;
                    default:
                        break;
                }
                topic.publish("/rich/base/index/changePage", topicObj);
            },
            loadWidget: function(pathName, pathLocation, moduleName, undefineModule) {
                // summary:
                //      Dynamically loads the dojo widget
                // pathName: String
                //      The widget's path name (for example, "ioc")
                // pathLocation: String
                //      The widget's path location (for example, "/ibm/ioc/theme/static/js/js")
                // moduleName: String
                //      The widget's module name (for example, "ioc/com/ibm/ioc/filter/SavedFiltersPane")
                // undefineModule: Boolean
                //      true/false depending on if you want dojo to undefine/unrequire the module in the case of an error. Enabling the functionality allows the JS to be required again.
                // returns: Deferred
                //      Resolved when the widget is loaded; the resolved deferred contains the dojo widget class

                var deferred = new Deferred();
                deferred.widgetConfig = {
                    pathName: pathName,
                    pathLocation: pathLocation,
                    moduleName: moduleName
                };

                if (pathName && pathLocation) {
                    var widgetPath = {};
                    //widgetPath[pathName] = pathLocation;
                    var self = this;

                    try {
                        require.on('error', lang.partial(function(deferred, error) {
                            var widgetRequestPath = deferred.widgetConfig.moduleName.replace(deferred.widgetConfig.pathName, deferred.widgetConfig.pathLocation);
                            widgetRequestPath = widgetRequestPath + '.js';
                            //if error.info[0] there was a failure in the module for example requiring modules in the required widget
                            if (error.info[0] == undefined || widgetRequestPath === error.info[0] || (deferred.widgetConfig.pathName == null || deferred.widgetConfig.pathName == null)) {
                                if (!(deferred.isResolved() || deferred.isRejected())) {
                                    if (undefineModule) {
                                        require.undef(deferred.widgetConfig.moduleName);
                                    }
                                    deferred.reject("Exception loading " + deferred.widgetConfig.moduleName + "; ");
                                }
                            }
                        }, deferred));

                        require({
                            paths: widgetPath
                        }, [moduleName], lang.hitch(this, function(CustomWidget) {
                            if (CustomWidget === undefined) {
                                if (undefineModule) {
                                    require.undef(deferred.widgetConfig.moduleName);
                                }
                                deferred.reject("Exception loading " + moduleName + "; ");
                            } else {
                                deferred.resolve(CustomWidget);
                            }
                        }));
                    } catch (exc) {
                        var message = "Exception loading " + moduleName + "; " + exc;
                        if (undefineModule) {
                            require.undef(deferred.widgetConfig.moduleName);
                        }
                        deferred.reject(message);
                    }
                } else {
                    var message = "Missing pathName or pathLocation for " + moduleName;
                    deferred.reject(message);
                }

                return deferred;
            },

            /**
             * To load specific dojo module into memory for future usage
             * @param String packageName The package name
             * @param String packageLocation The package location path
             * @param String moduleName The module class name 
             * @return Object deferred The dojo Deferred for async call
             */
            loadModule: function(packageName, packageLocation, moduleName) {
                var deferred, handler = null;
                require.packs[packageName] = {
                    "name": packageName,
                    "main": "main",
                    "location": packageLocation
                };
                deferred = new Deferred();
                handler = require.on("error", lang.hitch(this, function(error) {
                    if (error.message === "timeout" && error.info[moduleName]) {
                        //failed load module
                        //                      this.publishMessage("CIWWC0001E", this.i18nFormat(message.CIWWC0001E, [moduleName, error]));
                        alert("loadModule error:" + packageName + "|" + packageLocation + "|" + moduleName);
                        handler.remove();
                        deferred.reject(error);
                    }
                }));
                //load the module
                require({
                    //paths: { packageName: packageLocation }
                    packages: [{
                        "name": packageName,
                        "location": packageLocation
                    }]
                }, [moduleName], lang.hitch(this, function(ModuleClass) {
                    handler.remove();
                    if (ModuleClass) {
                        deferred.resolve(ModuleClass);
                    } else {
                        deferred.reject("Module Not Loaded:" + moduleName);
                    }
                }));

                return deferred.promise;
            },


            publishPopupMessage: function(messageId, i18nMessageText) {
                // summary:
                //      Publishes the message (ID and I18N text) to the popup messages
                //      topic for processing
                // messageId: String
                //      the message ID
                // i18nMessageText: String
                //      the I18N message text

                if (!messageId || !i18nMessageText) {
                    return;
                }

                topic.publish("/ibm/ioc/popupMessage", {
                    messageId: messageId,
                    i18nMessageText: i18nMessageText
                });
            },

            publishMessage: function(messageId, i18nMessageText) {
                // summary:
                //      Publishes the message (ID and I18N text) to the messages
                //      topic for processing
                // messageId: String
                //      the message ID
                // i18nMessageText: String
                //      the I18N message text

                if (!messageId || !i18nMessageText) {
                    return;
                }

                var data = {
                    messages: []
                };
                data.messages.push({
                    messageId: messageId,
                    i18nMessageText: i18nMessageText
                });
                topic.publish("/ibm/ioc/messages", data);
            },

            publishRestMessages: function(result, defaultMessageId, defaultI18nMessageText) {
                // summary:
                //      Publishes all REST success messages to the message topic for processing;
                //      if the result object cannot be processed, display the default message
                //      (ID and I18N text) instead
                // result: Object
                //      Result object returned from an IOC REST service
                // defaultMessageId: String?
                //      Message ID when error object cannot be processed
                // defaultI18nMessageText: String?
                //      I18N message text when error object cannot be processed

                if (!result || !result.messages || !result.messages.length) {
                    // display default message
                    this.publishMessage(defaultMessageId, defaultI18nMessageText);
                } else {
                    var data = {
                        messages: result.messages
                    };
                    topic.publish("/ibm/ioc/messages", data);
                }
            },

            publishRestErrorMessages: function(error, defaultMessageId, defaultI18nMessageText) {
                // summary:
                //      Publishes all REST error messages to the messages topic for processing;
                //      if the error object cannot be processed, display the default message
                //      (ID and I18N text) instead
                // error: Object
                //      Error object returned from an IOC REST service
                // defaultMessageId: String?
                //      Message ID when error object cannot be processed
                // defaultI18nMessageText: String?
                //      I18N message text when error object cannot be processed

                try {
                    var data = json.parse(error.response.data);
                    if (data.messages.length) {
                        topic.publish("/ibm/ioc/messages", data);
                    } else {
                        this.publishMessage(defaultMessageId, defaultI18nMessageText);
                    }
                } catch (e) {
                    // display default message
                    this.publishMessage(defaultMessageId, defaultI18nMessageText);
                }
            },

            i18nFormat: function(message, values) {
                // summary:
                //      JavaScript replacement of Java MessageFormat.format
                // message: String
                //      String template with substitution placeholders
                // values: String, String[]
                //      Substitution values
                // returns:
                //      Values substituted into the message

                if (typeof message == "undefined" || message == null) {
                    return;
                }

                if (lang.isArray(values)) {
                    var result = message;

                    array.forEach(values, function(entry, i) {
                        result = result.replace("{" + i + "}", entry);
                    });

                    return result;
                } else {
                    return message.replace("{0}", values);
                }
            },

            unescapeWidgetString: function(s) {
                // summary:
                //      Unescapes the widget string
                // returns: String
                //      The updated string

                if (s) {
                    s = s.replace(/&amp;/g, '&');
                    return this.unescapeString(s);
                } else {
                    return "";
                }
            },

            unescapeNavTreeLabel: function(s) {
                // summary:
                //      Unescapes the NavTree node label
                // returns: String
                //      The updated string

                return this.unescapeWidgetString(s);
            },

            unescapeString: function(s) {
                // summary:
                //      Unescapes standard HTML characters with their equivalent:
                //      "&gt;" becomes ">"
                //      "&lt;" becomes "<"
                //      "&quot;" becomes "\""
                //      "&apos;" becomes "'"
                //      "&amp;" becomes "&"
                // returns: String
                //      The updated string


                if (s) {
                    if (typeof s === "string") {
                        s = s.replace(/\\&apos;/g, '&apos;');
                        s = s.replace(/\\&quot;/g, '&quot;');

                        var obj = domConstruct.create("div");
                        obj.innerHTML = s;
                        var result = obj.textContent;
                        domConstruct.destroy(obj);
                        return result;
                    } else {
                        return s;
                    }
                } else {
                    return "";
                }
            },

            isIE: function() {
                // summary:
                //      Detects if the browser is Internet Explorer
                // returns: Integer
                //      The browser version number

                return has("ie");
            },

            isChrome: function() {
                // summary:
                //      Detects if the browser is Chrome
                // returns: Integer
                //      The browser version number

                return has("chrome");
            },

            isFirefox: function() {
                // summary:
                //      Detects if the browser is Firefox
                // returns: Integer
                //      The browser version number

                return has("ff");
            },

            isWinXP: function() {
                // summary:
                //      Detects if the browser is running on Windows XP
                // returns: Boolean
                //      true if the browser is running on Windows XP

                var result = false;
                if (navigator) {
                    if (lang.exists("userAgent", navigator)) {
                        result = navigator.userAgent.indexOf("Windows NT 5.1") !== -1;
                    }
                }

                return result;
            },

            isMobile: function() {
                // summary:
                //      Detects if the browser is running on a mobile device
                // returns: Boolean
                //      true if the browser is running on a mobile device

                return has("touch");
            },

            isRTL: function() {
                // summary:
                //      Detects if the browser is displaying an RTL language (e.g. Arabic)
                //  returns: Boolean
                //      true if the browser is displaying an RTC language; false if not

                return this.isRTL;
            },

            isHighContrast: function() {
                // summary:
                //      Detects if the browser is running in high contrast mode
                // returns: Boolean
                //      true if the browser is in high contrast mode; falst if not

                return has("highcontrast");
            },

            timeZoneOffset: function() {
                return "-00:00";
                // summary:
                //      Returns the browsers time zone offset relative to GMT.  Example:  -05:00
                // returns: String
                //      The time zone offset as a string
                // 

                var offset = this.timeZoneOffsetNumber();
                offset = offset * -1; // sign of the global offset is backwards
                var hours = Math.floor(Math.abs(offset) / 60);
                var minutes = Math.abs(offset) % 60;

                if (hours > 0 && hours < 10) {
                    hours = "0" + hours;
                } else if (hours == 0) {
                    hours = "00";
                }

                var indicator = "-";
                if (hours != 0 && offset > 0) {
                    indicator = "+";
                }

                if (minutes < 10) {
                    minutes = "0" + minutes;
                }

                return indicator + hours + ":" + minutes;
            },

            _timeZoneOffset: function() {
                //Note placing function back in the code as removing breaks relative time functionality. 
                //Function is prefixed with _.
                //This code will move to the server side in a future sprint.
                // summary:
                //      Returns the browsers time zone offset relative to GMT.  Example:  -05:00
                // returns: String
                //      The time zone offset as a string
                // 

                var offset = this._timeZoneOffsetNumber();
                offset = offset * -1; // sign of the global offset is backwards
                var hours = Math.floor(Math.abs(offset) / 60);
                var minutes = Math.abs(offset) % 60;

                if (hours > 0 && hours < 10) {
                    hours = "0" + hours;
                } else if (hours == 0) {
                    hours = "00";
                }

                var indicator = "-";
                if (hours != 0 && offset > 0) {
                    indicator = "+";
                }

                if (minutes < 10) {
                    minutes = "0" + minutes;
                }

                return indicator + hours + ":" + minutes;
            },

            timeZoneOffsetNumber: function() {
                // summary:
                //      Returns the browsers time zone offset integer relative to UTC.  Example:  60
                // returns: String
                //      The time zone offset as a number

                // This variable is set in the servletCaller.jsp
                //return userTimeZoneOffset;
                return 0;
            },

            _timeZoneOffsetNumber: function() {
                //Note placing function back in the code as removing breaks relative time functionality. 
                //Function is prefixed with _.
                //This code will move to the server side in a future sprint.
                // summary:
                //      Returns the browsers time zone offset integer relative to UTC.  Example:  60
                // returns: String
                //      The time zone offset as a number

                // This variable is set in the servletCaller.jsp
                return userTimeZoneOffset;
            },

            computeTimeWithPortalsOffset: function(time) {
                // summary:
                //      Returns a JS Date object taking into account the timezone offset of the user.
                //      This is suitable for widgets but not for display purposes, since the representations
                //      use the browser's timezone.

                var browserTZ = (new Date(time)).getTimezoneOffset();
                this.timeZoneOffsetNumber = browserTZ - userTimeZoneOffset;

                return new Date(time + (this.timeZoneOffsetNumber * 60000));
            },

            isLightColor: function(color) {
                // summary:
                //      Determines if the color is a light color; color is of the form "#RRGGBB"
                //      where RRGGBB are the 2 digit hex color values
                // returns: Boolean
                //      true if the color is a light color; false, otherwise

                if (!color || (color.length != 6 && color.length != 7)) {
                    return false;
                }

                if (color.length == 7) {
                    // strip off any leading "#"
                    if (color.charAt(0) == "#") {
                        color = color.substring(1);
                    } else {
                        return false;
                    }
                }

                // color is in the form RRGGBB extract the 2-digit hex for R G B
                var red = parseInt(color.substring(0, 2), 16);
                var green = parseInt(color.substring(2, 4), 16);
                var blue = parseInt(color.substring(4), 16);
                var brightness = Math.sqrt((red * red * 0.241) + (green * green * 0.691) + (blue * blue * 0.068));

                // brightness is a number in the range of 0 (black) to 255 (white)
                if (brightness > 130) {
                    return true;
                } else {
                    return false;
                }
            },

            generateRandomUuid: function() {
                // summary:
                //      Generates a random UUID

                return dojox.uuid.generateRandomUuid();
            },

            isJsonObjectString: function(s) {
                // summary:
                //      Checks if the string begins/ends with "{"/"}" and can be parsed
                // returns: Boolean
                //      true if the string is a JSON object string

                if (s == null || s.length == 0) {
                    return false;
                }

                if (s.charAt(0) == "{" && s.charAt(s.length - 1) == "}" && s.indexOf(":") > 0) {
                    try {
                        var obj = json.parse(s);
                        return true;
                    } catch (e) {
                        return false;
                    }
                } else {
                    return false;
                }
            },

            getFilterPanelBadge: function(color, text) {
                // summary:
                //      Generates the badge HTML for a filter panel
                // returns: String
                //      The badge HTML with any (optional) text

                if (!text) {
                    text = "";
                }

                var badge = null;

                if (color) {
                    var textColor = "";
                    if (this.isLightColor(color)) {
                        textColor = "color: black;";
                    }

                    badge =
                        "<DIV class='dijitInline iocFilterBadge' role='presentation' style='" +
                        "background-color: " + color + ";" +
                        textColor +
                        //                      "background-image: linear-gradient(bottom, " + color + " 50%, #FFFFFF 100%);" +
                        //                      "background-image: -o-linear-gradient(bottom, " + color + " 50%, #FFFFFF 100%);" +
                        //                      "background-image: -moz-linear-gradient(bottom, " + color + " 50%, #FFFFFF 100%);" +
                        //                      "background-image: -webkit-linear-gradient(bottom, " + color + " 50%, #FFFFFF 100%);" +
                        //                      "background-image: -ms-linear-gradient(bottom, " + color + " 50%, #FFFFFF 100%);" +
                        //                      "background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.5, " + color + "), color-stop(1, #FFFFFF));" +
                        " position:relative; overflow:hidden;'>";
                    if (!this.isHighContrast()) {
                        badge += text + "</DIV>";
                    } else {
                        var style = "position:absolute; margin-top:-2px;";

                        if (!this.isRTL()) {
                            style += "margin-left:3px";
                        } else {
                            style += "margin-right:3px";
                        }

                        badge += "<DIV>" + this.getColorPaletteButtonImage(color) + "</DIV><DIV style='" + style + "'>" + text + "</DIV></DIV>";
                    }
                } else {
                    badge =
                        "<DIV class='dijitInline iocFilterBadge' style='" +
                        "background-color: transparent;" +
                        "border: 1px solid transparent;" +
                        "'>" + text + "</DIV>";
                }

                return badge;
            },

            getColorPaletteButtonImage: function(color, colorPalette) {
                // summary:
                //      Returns the <IMG> node to attach to the filter pane badge; used when in high contrast mode
                // color: String?
                //      The filter pane color
                // colorPalette: Object?
                //      The ColorPalette instance to use; if not defined, uses a new ColorPalette instance
                // returns: String
                //      The HTML string of the <IMG> node or "" if the color is not found

                var colorPaletteToUse = null;

                if (!colorPalette) {
                    colorPaletteToUse = new ColorPalette({});
                    colorPaletteToUse.startup();
                } else {
                    colorPaletteToUse = colorPalette;
                }

                var img = "";

                var cells = colorPaletteToUse._cells;
                if (color != null) {
                    for (var i = 0; i < cells.length; i++) {
                        var cell = cells[i];
                        var a = cell.dye.a;
                        var r = cell.dye.r;
                        var g = cell.dye.g;
                        var b = cell.dye.b;
                        var cellColor = new Color([r, g, b, a]);
                        if (cellColor.toHex().toLowerCase() == color.toLowerCase()) {
                            // found color
                            var col = cell.dye._col;
                            var row = cell.dye._row;
                            var imagePath = cell.dye._imagePaths[cell.dye.palette];
                            var left = col * -20 - 5;
                            var top = row * -20 - 5;
                            // var size =  cell.dye.palette == "7x10" ? "height: 14px; width: 16px;" : "height: 14px; width: 16px;";
                            var pos = "position: absolute; left: " + left + "px; top:" + top + "px; ";
                            img = "<IMG style=\"" + pos + "\" src=\"" + imagePath + "\">";
                        }
                    }
                }

                if (!colorPalette) {
                    colorPaletteToUse.destroy();
                }

                return img;
            },

            getLocale: function() {
                // summary:
                //      Returns the user's current locale as queried in the theme.
                // returns: String
                //      The locale

                return i18nBrowserLocale;
            },

            getUserId: function() {
                // summary:
                //      Returns the current user ID as queried in the theme.
                // returns: String
                //      The user ID

                return uid;
            },

            getPageUniqueName: function() {
                // summary:
                //      Returns the current Portal page unique name.
                // returns: String
                //      The unique page name

                return currentPageUniqueName;
            },

            doesTaskbarExistOnCurrentPage: function() {
                // summary:
                //      Returns whether the current page has a taskbar.
                // returns: Boolean
                //      true if the current page has a taskbar; false, otherwise

                return doesTaskbarExistOnCurrentPage;
            },

            getColorScheme: function() {
                // summary:
                //      Retuns the current color scheme
                // returns: String
                //      The color scheme (e.g. "Dark", "Grey")
                if (this.colorScheme != undefined) {
                    return this.colorScheme;
                } else {
                    this.colorScheme = this._themeNames.grey;
                    return this.colorScheme;
                }
                //              colorScheme = colorScheme ? colorScheme : this._themeNames.dark;
                //              return colorScheme;
            },

            isDarkTheme: function() {
                // summary:
                //      Tests if the current color scheme is the dark theme
                // returns: Boolean
                //      true if the current color scheme is the dark theme; false, otherwise

                return this.getColorScheme() === this._themeNames.dark;
            },

            isGreyTheme: function() {
                // summary:
                //      Tests if the current color scheme is the grey theme
                // returns: Boolean
                //      true if the current color scheme is the grey theme; false, otherwise

                return this.getColorScheme() === this._themeNames.grey;
            },

            changeToDarkTheme: function() {
                // summary:
                //      Change to the dark theme

                this.colorScheme = this._themeNames.dark;
                domClass.remove(win.body(), this._themeClasses.grey);
                domClass.add(win.body(), this._themeClasses.dark);
                topic.publish("/ibm/ioc/theme", {
                    theme: this._themeNames.dark
                });
            },

            changeToGreyTheme: function() {
                // summary:
                //      Change to the grey theme

                this.colorScheme = this._themeNames.grey;
                domClass.remove(win.body(), this._themeClasses.dark);
                domClass.add(win.body(), this._themeClasses.grey);
                topic.publish("/ibm/ioc/theme", {
                    theme: this._themeNames.grey
                });
            },

            doesTextContainXssCharacters: function(text) {
                // summary:
                //      Tests if the string contains HTML tags, or ampersands that are not part of HTML Entities. 
                // returns: Boolean
                //      Boolean value indicating whether the above condition is true or false

                return (text.match(/(<([^>]+)>)/i) != null || text.match(/&(?!\w+;|\#[0-9]+;|\#x[0-9A-F]+;)/i) != null);
            },

            escapeXml: function(text) {
                // summary:
                //      Performs the following substitutions on the input text:
                //          < to &gt;
                //          > to &lt;
                //          & to &amp;
                //          ' to &apos;
                //          " to &quot;
                // returns: String
                //      The updated text

                if (text && this.doesTextContainXssCharacters(text)) {
                    text = text.replace(/&/g, "&amp;");
                    text = text.replace(/\"/g, "&quot;");
                    text = text.replace(/'/g, "&apos;");
                    text = text.replace(/</g, "&lt;");
                    text = text.replace(/>/g, "&gt;");
                    text = text.replace(/&amp;quot;/g, "&quot;"); // restores &quot; which was replaced with &amp;quot;
                }
                return text;
            },

            millisecToDurationFormat: function(durationTimeMilliseconds) {
                // summary:
                //      Converts a number to an ISO 8601 duration formatted string
                //      of the form P[n]Y[n]M[n]DT[n]H[n]M[n]S
                // returns: String
                //      The formatted ISO 8601 duration

                var epoch = new Date(0);
                var date = new Date(durationTimeMilliseconds);
                var years = date.getUTCFullYear() - epoch.getUTCFullYear();
                var months = date.getUTCMonth();
                var days = date.getUTCDate() - 1;
                var hours = date.getUTCHours();
                var mins = date.getUTCMinutes();
                var secs = date.getUTCSeconds();
                var duration = "P";
                if (years > 0)
                    duration += years + "Y";
                if (months > 0)
                    duration += months + "M";
                if (days > 0)
                    duration += days + "D";
                if (hours > 0 || mins > 0 || secs > 0) {
                    duration += "T";
                    if (hours > 0)
                        duration += hours + "H";
                    if (mins > 0)
                        duration += mins + "M";
                    if (secs > 0)
                        duration += secs + "S";
                }
                if (duration.length == 1) {
                    //If length is zero seconds, we add the second value to avoid ambiguity
                    duration += "T0S";
                }
                return duration;
            },

            formatDuration: function(duration, i18n) {
                // summary:
                //      Formats an ISO8601 duration of the form "P[n]Y[n]M[n]DT[n]H[n]M[n]S"
                //      using the I18N labels.  For example:  a duration of "P1Y2M3DT4H5M6S"
                //      and an i18n object of {"year":"y", "month":"m", "day":"d", "hour":"h",
                //      "minute":"m", "second":"s"}.  Tip: Use the IOC i18n plug-in to load
                //      the ISO8601Duration I18N resources in the correct object format.
                // duration:  String
                //      The ISO8601 duration
                // i18n:  Object
                //      The I18N labels
                // returns:  String
                //      The formatted duration; for example:  "1y, 2m, 3d, 4h, 5m, 6s"

                if (!duration && duration.indexOf("P") != 0) {
                    return null;
                }

                if (duration == "P") {
                    // if duration is "P", change to "PT0S" to avoid
                    // a result of ""
                    duration = "PT0S";
                }

                if (i18n &&
                    lang.exists("year", i18n) &&
                    lang.exists("month", i18n) &&
                    lang.exists("day", i18n) &&
                    lang.exists("hour", i18n) &&
                    lang.exists("minute", i18n) &&
                    lang.exists("second", i18n)) {

                    // split year-month-day vs. hour-minute-second

                    if (duration.indexOf("T") == -1) {
                        // add a trailing "T" if once doesn't exist;
                        // if no "T" exists, the duration string doesn't
                        // contain any hour-minute-second information;
                        // by adding a "T" to the end, the code can
                        // easily split on the "T" to get the 
                        // year-month-day information followed by
                        // no hour-minute-second information
                        duration += "T";
                    }

                    var tokens = duration.split("T");
                    if (tokens.length == 2) {
                        var rawYMD = tokens[0].substring(1); // strips the leading "P"
                        var rawHMS = tokens[1];

                        // parse the raw year-month-day

                        var year = null;
                        if (rawYMD.indexOf("Y") != -1) {
                            tokens = rawYMD.split("Y");
                            year = tokens[0];
                            if (tokens.length == 2) {
                                rawYMD = tokens[1];
                            }
                        }

                        var month = null;
                        if (rawYMD.indexOf("M") != -1) {
                            tokens = rawYMD.split("M");
                            month = tokens[0];
                            if (tokens.length == 2) {
                                rawYMD = tokens[1];
                            }
                        }

                        var day = null;
                        if (rawYMD.indexOf("D") != -1) {
                            tokens = rawYMD.split("D");
                            day = tokens[0];
                        }

                        // parse the raw hour-minute-second

                        var hour = null;
                        if (rawHMS.indexOf("H") != -1) {
                            tokens = rawHMS.split("H");
                            hour = tokens[0];
                            if (tokens.length == 2) {
                                rawHMS = tokens[1];
                            }
                        }

                        var minute = null;
                        if (rawHMS.indexOf("M") != -1) {
                            tokens = rawHMS.split("M");
                            minute = tokens[0];
                            if (tokens.length == 2) {
                                rawHMS = tokens[1];
                            }
                        }

                        var second = null;
                        if (rawHMS.indexOf("S") != -1) {
                            tokens = rawHMS.split("S");
                            second = tokens[0];
                        }

                        // build the result

                        var result = "";

                        if (year) {
                            result += year + i18n.year;
                        }

                        if (month) {
                            result += " " + month + i18n.month;
                        }

                        if (day) {
                            result += " " + day + i18n.day;
                        }

                        if (hour) {
                            result += " " + hour + i18n.hour;
                        } else {
                            // include a "0h" if there is either a minute or second value
                            if (minute || second) {
                                result += " 0" + i18n.hour;
                            }
                        }

                        if (minute) {
                            result += " " + minute + i18n.minute;
                        } else {
                            // include a "0m" if there is an hour or second value
                            if (hour || second) {
                                result += " 0" + i18n.minute;
                            }
                        }

                        if (second) {
                            result += " " + second + i18n.second;
                        } else {
                            // include a "0s" if there is either an hour or minute value
                            if (hour || minute) {
                                result += " 0" + i18n.second;
                            }
                        }

                        // change "nY nM nD nH nM nS" into "nY, nM, nD, nH, nM, nS"
                        // and " nH, nM, nS" into "nH, nM, nS"

                        result = string.trim(result);
                        result = result.replace(/ /g, ', ');

                        return result;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            },

            updateGridAttributesForAccessibility: function(grid) {
                //Update the gridxBody element of this grid's role attribute to 'application'
                //so that grid cells restore focus correctly when using JAWS - see defect 74962
                if (!grid) {
                    return;
                }

                var gridChildNodes = grid.domNode.childNodes;
                //need to set the role attribute on the grid->gridxMain->gridxBody div to application, search down for those
                //shouldn't be more than one of each element but looping anyway in case
                var gridxMainPattern = new RegExp('( |^)gridxMain( |$)');
                var gridxBodyPattern = new RegExp('( |^)gridxBody( |$)');
                for (var i = 0; i < gridChildNodes.length; i++) {
                    if (gridxMainPattern.test(gridChildNodes[i].className)) {
                        var gridxMainChildNodes = gridChildNodes[i].childNodes;
                        for (var j = 0; j < gridxMainChildNodes.length; j++) {
                            if (gridxBodyPattern.test(gridxMainChildNodes[j].className)) {
                                gridxMainChildNodes[j].setAttribute("role", 'application');
                            }
                        }
                    }
                }

                return;
            },

            updateDialogAttributesForAccessibility: function(dialog) {
                //Update the dialogxBody element of this dialog's tabindex attribute to -1
                //so that dialog doesn't contain an extra tabbable element - see defect 75650
                if (!dialog) {
                    return;
                }

                var dialogChildNodes = dialog.domNode.childNodes;

                var dijitDialogPaneContentWrapperPattern = new RegExp('( |^)dijitDialogPaneContentWrapper( |$)');
                var dijitDialogPaneContentPattern = new RegExp('( |^)dijitDialogPaneContent( |$)');
                for (var i = 0; i < dialogChildNodes.length; i++) {
                    if (dijitDialogPaneContentWrapperPattern.test(dialogChildNodes[i].className)) {
                        var dijitDialogPaneContentWrapperChildNodes = dialogChildNodes[i].childNodes;
                        for (var j = 0; j < dijitDialogPaneContentWrapperChildNodes.length; j++) {
                            if (dijitDialogPaneContentPattern.test(dijitDialogPaneContentWrapperChildNodes[j].className)) {
                                //need to make both the wrapper and its child non-tabbable
                                dijitDialogPaneContentWrapperChildNodes[j].setAttribute("tabindex", '-1');
                                dijitDialogPaneContentWrapperChildNodes[j].firstChild.setAttribute("tabindex", '-1');
                            }
                        }
                    }
                }

                return;
            },

            insertCssRule: function(cssFileName, selector, rule, position) {
                // summary:
                //      Dynamically adds a CSS rule (including pseudo selectors) to the in memory representation of a CSS file
                //      Example:
                //          insertCssRule("ioc_base.css", ".iocTaskbarButtonIcon:before", "{content: url('file.png');}")
                // cssFileName: String
                //      The in memory CSS file to update.
                // selector: String
                //      The CSS selector; may be a pseudo selector like :before
                // rule: String
                //      The CSS rule
                // position: Integer?
                //      The position within the in memory CSS file to insert the new rule; if not defined or -1, appends to the end
                // returns: Boolean
                //      A result of true means success; false, otherwise

                var result = false;

                if (!cssFileName || !selector || !rule) {
                    return result;
                }

                var iocSheet = null;
                for (var i = 0; i < win.doc.styleSheets.length; i++) {
                    var sheet = win.doc.styleSheets[i];
                    if (sheet.href && sheet.href.indexOf(cssFileName) > 0) {
                        iocSheet = sheet;
                        break;
                    }
                }

                try {
                    if (iocSheet) {
                        var index = position;
                        if (index === undefined || index === -1) {
                            index = iocSheet.cssRules.length;
                        }

                        if (iocSheet.insertRule) {
                            iocSheet.insertRule(selector + rule, index);
                            result = true;
                        }
                    }
                } catch (exc) {
                    result = false;
                }

                return result;
            },

            setCss: function(parent, cssin, media) {
                // summary:
                //      Dynamically adds the CSS to the current document
                // parent: Object
                //      Object to contain CSS
                // cssin: String
                //      CSS to add; @import statements must appear before other statements
                // media: String?
                //      Specifies which media/device the CSS is optimized for; defaults to "all"

                if (registry.byClass(parent.declaredClass).length > 0) {
                    // widget is already loaded so css node has already been added to page
                    return;
                }

                var css = cssin || "";
                if (css == "") {
                    return;
                }

                var tag = "style";
                var attributes = {
                    media: media || "all"
                };
                var refNode = query("head script")[0];
                var position = "before";

                if (parent.cssNode) {
                    domConstruct.destroy(parent.cssNode);
                }

                // place it before the first <script>
                parent.cssNode = domConstruct.create(tag, attributes, refNode, position);

                if (parent.cssNode.styleSheet) {
                    parent.cssNode.styleSheet.cssText = css; // IE
                } else {
                    parent.cssNode.innerHTML = css; // the others
                }
            },

            addUserAction: function(menuItem) {
                // summary:
                //      Adds a user action to the "More Actions" button
                // menuItem: Object
                //      See the MoreActions widget for a description of this object

                if (menuItem) {
                    topic.publish("/ibm/ioc/more_actions/add", menuItem);
                }
            },

            removeUserAction: function(name) {
                // summary:
                //      Removes a user action form the "More Actions" button
                //  name: String
                //      The name of the action to remove;  see the MoreActions widget for a description
                //      of how the actions are defined

                if (name) {
                    topic.publish("/ibm/ioc/more_actions/remove", [name]);
                }
            },

            removeSpaces: function(s) {
                // summary:
                //      Remove all spaces from a string
                // s: String
                //      The string to process

                var result = null;

                if (s) {
                    result = s.replace(/\s/g, '');
                }

                return result;
            },

            dateCalendarTypeFormat: function(dateString, options) {
                // summary:
                //      parses a date string and displays it with users chosen calendarType
                //dateString: String
                //      The date in a string to be parsed
                //options: Object?
                //      The dojo date options, if required, for example {datePattern:'dd/MM/yy', selector:'date'}

                var formattedDateString = dateString,
                    date, dateOptions = {};
                dateOptions = (options != null) ? options : dateOptions;
                var parsed = Date.parse(dateString);
                if (calendarType == "hebrew") {
                    date = dojox.date.hebrew.Date(parsed);
                    formattedDateString = dojox.date.hebrew.locale.format(date, dateOptions);
                } else if (calendarType == "islamic") {
                    date = new dojox.date.islamic.Date(parsed);
                    formattedDateString = dojox.date.islamic.locale.format(date, dateOptions);
                } else if (calendarType == "buddhist") {
                    date = new dojox.date.buddhist.Date(parsed);
                    formattedDateString = dojox.date.buddhist.locale.format(date, dateOptions);
                } else {

                }

                return formattedDateString;
            },
            //add by dailiwei
            getConfig: function(widget /*object*/ ) {
                var cfg = null;
                if (this.isInstance(widget)) {
                    cfg = widget["#cfg"]
                } else {
                    cfg = widget;
                }
                if (cfg && !cfg.parameters) {
                    cfg.parameters = {};
                }
                return cfg;
            },
            isInstance: function(widget /*object*/ ) {
                if (widget.constructor == Object && typeof widget["#cfg"] == "undefined") {
                    return false;
                } else {
                    return true;
                }
            },
            toWidgetArray: function(widget /*object, array*/ ) {
                var widgets = [];
                if (lang.isArray(widget)) {
                    widgets = widget;
                } else {
                    widgets = [widget];
                }
                return widgets;
            },
            loadModule1: function(widget) {
                var deferred = new Deferred();
                //detect which module need be loaded
                var ids = [];

                //start load modules
                var handler = require.on("error", function(err) {
                    var error = "Error loading module:" + error;
                    handler.remove();
                    deferred.reject(error);
                })

                require([widget], function(widget) {

                    var Module = widget;

                    try {
                        deferred.resolve(Module);
                    } catch (error) {
                        deferred.reject(error);
                    }
                })

                return deferred;
            },
            loadModules: function(widgets /*array*/ ) {
                var deferred = new Deferred();
                //detect which module need be loaded
                var ids = [];
                var modules = [];
                for (var i = 0; i < widgets.length; i++) {

                    ids.push(i);
                    modules.push(widgets[i].module);

                }
                //start load modules
                var handler = require.on("error", function(err) {
                    var error = "Error loading module:" + error;
                    handler.remove();
                    deferred.reject(error);
                })

                require(modules, function() {
                    var result = [];
                    result.length = widgets.length;
                    for (var i = 0; i < arguments.length; i++) {
                        var Module = arguments[i];
                        result[ids[i]] = Module;
                    }
                    try {
                        deferred.resolve(result);
                    } catch (error) {
                        deferred.reject(error);
                    }
                })

                return deferred;
            }

        });
    });
