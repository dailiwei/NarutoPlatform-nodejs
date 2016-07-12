///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-20 09:01
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare',
        "dijit/form/Select"
    ],
    function(declare,Select) {

        return declare(Select, {

            /**
             * 得到当前选中的对象
             * @returns {*}
             */
            getItem:function(){
                var value = this.get('value');
                for(var i=0;i<this.options.length;i++){
                    if(this.options[i]["value"]==value){
                        return this.options[i];
                    }
                }
            },
            onChange:function(evt){
               return  this.getItem();
            }
        });
    });