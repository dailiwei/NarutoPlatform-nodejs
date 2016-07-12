///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-18 18:01
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on'
],
function(declare, _WidgetBase, lang, html, on) {
  /**
   * 用来显示CheckBox
   *
   * @alias CheckBox
   * @constructor
   * @param {Object} [kwArgs] Object with the following properties:
   */
  return declare(_WidgetBase, {
    'baseClass': 'rdijit-form-checkbox',
    declaredClass: 'rdijit.form.CheckBox',

    checked: false,
    status: true,

    postCreate: function(){
      this.checkNode = html.create('div', {
        'class': 'checkbox base-float-leading'
      }, this.domNode);
      if(this.label){
        this.labelNode = html.create('div', {
          'class': 'checkbox-label base-float-leading',
          innerHTML: this.label
        }, this.domNode);
      }
      if(this.checked){
        html.addClass(this.checkNode, 'checked');
      }

      this.own(
        on(this.checkNode, 'click', lang.hitch(this, function(){
          if(this.checked && this.status){
            this.uncheck();
          }else if(this.status){
            this.check();
          }
        }))
      );

      if(this.label){
        this.own(
          on(this.labelNode, 'click', lang.hitch(this, function(){
            if(this.checked && this.status){
              this.uncheck();
            }else if(this.status){
              this.check();
            }
          }))
        );
      }
      
    },

    setValue: function(value){
      if(value === true){
        this.check();
      }else{
        this.uncheck();
      }
    },

    getValue: function(){
      return this.checked;
    },

    setStatus: function(status){
      this.status = status;
      if(!this.labelNode){
        return;
      }
      if(status){
        html.setStyle(this.labelNode, "color", "#000000");
      }else{
        html.setStyle(this.labelNode, "color", "#818181");
      }
    },

    check: function(){
      this.checked = true;
      html.addClass(this.checkNode, 'checked');
      this.onStateChange();
    },

    uncheck: function(notEvent){
      this.checked = false;
      html.removeClass(this.checkNode, 'checked');
      if(!notEvent){
        this.onStateChange();
      }
    },

    onStateChange: function(){
      if(this.onChange && lang.isFunction(this.onChange)){
        this.onChange(this.checked,this.label);
      }
    }
  });
});