/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2013 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */
/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2012 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */
define(["dojo/_base/declare",
    "dojo/query",
    "dijit/registry",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/WidgetSet"
], function(
    declare,
    query,
    registry,
    domConstruct,
    lang,
    _Widget) {

    return declare("base._BaseWidget", [_Widget], {
        /**
         * Provide functionality that can be useful for IOC widgets
         * 
         */
        validateForm: function(formName, validateObjArray, callback) {
            
            var validator = new FormValidator(formName, validateObjArray, lang.hitch(this, function(errors, evt) {


                if (evt && evt.preventDefault) {
                    evt.preventDefault();

                } else if (event) {
                    event.returnValue = false;

                }
                var SELECTOR_ERRORS = $("#" + formName + " .error_box");


                if (errors.length > 0) {
                    SELECTOR_ERRORS.empty();

                    for (var i = 0, errorLength = errors.length; i < errorLength; i++) {
                        SELECTOR_ERRORS.append(errors[i].message + '<br />');
                    }


                    SELECTOR_ERRORS.fadeIn(200);
                } else {
                    SELECTOR_ERRORS.css({
                        display: 'none'
                    });

                    //可以把存储逻辑写到这里
                    if (this[callback]) {
                        this[callback]();
                    }


                }


            }));
            return validator;
        },
        setCss: function(css, media) {
            if (registry.byClass(this.declaredClass).length > 0) {
                //widget is already loaded so css node has already been added to page
                return;
            }
            var css = css || '',
                tag = 'style',
                attributes = {
                    media: media || 'all'
                },
                refNode = query('head script')[0],
                position = 'before';

            if (this.cssNode) {
                domConstruct.destroy(this.cssNode);
            }

            // place it before the first <script>
            this.cssNode = domConstruct.create(tag, attributes, refNode, position);

            if (this.cssNode.styleSheet) {
                this.cssNode.styleSheet.cssText = css; // IE
            } else {
                this.cssNode.innerHTML = css; // the others
            }
        }
    });
});
