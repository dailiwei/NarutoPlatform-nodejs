///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-20 17:49
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/string',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin'
],
function(declare, lang, html, array, on, string, _WidgetBase, _TemplatedMixin) {
  return declare([_WidgetBase,_TemplatedMixin], {
    baseClass: 'rdijit-form-search',
    declaredClass: 'rdijit.form.Input',
    templateString:
    '<div>'+
      '<span class="rdijit-form-input-wrapper" style="left:0;right:0;">'+
      '<input class="rdijit-form-input" style="background:#fafafc;"'+
      ' data-dojo-attach-point="inputSearch"'+
      ' data-dojo-attach-event="onKeydown: _onKeyDown, onKeyUp: _onKeyUp"/></span>'+
    '</div>',

    //placeholder: String
    placeholder: '',

    //onChangeText: Function
    //  the callback function that does the search function
    onChangeText: null,

    //searchWhenInput: Boolean
    //  if true, call onChangeText when input, or call onChangeText when enter or click search button
    searchWhenInput: false,

    postCreate: function(){
      this.inherited(arguments);
      if(this.placeholder){
        html.setAttr(this.inputSearch, 'placeholder', this.placeholder);
      }
    },

    doSearch: function(){
      if(this.onChangeText){
        this.onChangeText(string.trim(this.inputSearch.value));
      }
    },

    _onKeyDown: function(evt){
      var keyNum = evt.keyCode !== undefined ? evt.keyCode : evt.which;
      if (keyNum === 13) {
        this.doSearch();
      }
      evt.stopPropagation();
    },

    _onKeyUp: function(){
      if(this.searchWhenInput){
        this.doSearch();
      }
    },

    _onBtnClick: function(){
      this.doSearch();
    },
    getText:function(){
      return string.trim(this.inputSearch.value);
    }
  });
});