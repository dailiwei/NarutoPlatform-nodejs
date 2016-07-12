///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-18 23:03
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/on',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dijit/registry'
],
function(declare, _WidgetBase, lang, array, on, domClass, domConstruct, registry) {
  /**
   * 用来显示RadioBtn
   *
   * @alias RadioBtn
   * @constructor
   * @param {Object} [kwArgs] Object with the following properties:
   * @demo {@link ./base/rdijit/test/testRadioBtn.html}
   */
  return declare(_WidgetBase, {
    'baseClass': 'rdijit-form-radio',
    declaredClass: 'rdijit.form.RadioBtn',

    checked: false,
    group: null,

    constructor: function(){
    },
    labelDiv:null,
    postCreate: function(){
      domConstruct.create('div', {
        'class': 'rdijit-form-radio-inner',
        'style':'float:left;'
      }, this.domNode);
      this.labelDiv = domConstruct.create('div', {
        'class': 'rdijit-form-radio-label',
        'style':'float:left;',
        'innerHTML':this.label
      }, this.domNode);

      if(this.checked){
        domClass.add(this.domNode, 'rdijit-form-radio-checked');
        domClass.add(this.labelDiv,'rdijit-form-radio-label-select');
      }
      this.own(
          on(this.domNode, 'click', lang.hitch(this, function(){
            if(!this.checked){
              this.check();
            }
          }))
      );
    },

    check: function(changeOthersState){
      if(changeOthersState === undefined){
        changeOthersState = true;
      }
      this.checked = true;
      domClass.add(this.domNode, 'rdijit-form-radio-checked');
      domClass.add(this.labelDiv,'rdijit-form-radio-label-select');

      if(changeOthersState){
        this._changeOthersState(false);
      }
      this.onStateChange(this.label,true);
    },

    uncheck: function(changeOthersState){
      if(changeOthersState === undefined){
        changeOthersState = true;
      }
      this.checked = false;
      domClass.remove(this.domNode, 'rdijit-form-radio-checked');
      domClass.remove(this.labelDiv,'rdijit-form-radio-label-select');

      if(changeOthersState){
        this._changeOthersState(false);
      }
      //this.onStateChange(this.label,false);
    },

    _changeOthersState: function(state){
      if(this.group === null){
        return;
      }
      array.forEach(registry.toArray(), function(dijit){
        if(dijit.id !== this.id && dijit['class'] === this['class'] && dijit.group === this.group){
          if(state){
            dijit.check(false);
          }else{
            dijit.uncheck(false);

            //dojo.break();
          }
        }
      }, this);
    },

    onStateChange: function(label,state){

    }
  });
});