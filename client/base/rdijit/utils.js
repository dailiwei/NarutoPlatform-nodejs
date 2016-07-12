///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 00:27
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/sniff',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/query',
    'dojo/NodeList-traverse',
    'dojo/Deferred',
    'dojo/on',
    'dojo/json',
    'dojo/cookie',
    'dojo/request/xhr',
    'dojo/i18n',
    'dojo/number',
    'dojo/date/locale',
    "dojo/errors/RequestError",
    "dojo/topic"
  ],

function(lang, array, html, has, config, ioQuery, query, nlt, Deferred, on, json, cookie,
  xhr, i18n, dojoNumber, dateLocale, RequestError, topic ) {
  /* global esriConfig, dojoConfig, ActiveXObject */
  var mo = {};

 
  /**
   * get style object from position
   * the position can contain 6 property: left, top, right, bottom, width, height
   * please refer to AbstractModule
   */
  mo.getPositionStyle = function(_position) {
    var style = {};
    if(!_position){
      return style;
    }
    var position = lang.clone(_position);
    if(window.isRTL){
      if(typeof position.left !== 'undefined' && typeof position.right !== 'undefined'){
        var temp = position.left;
        position.left = position.right;
        position.right = temp;
      }else if(typeof position.left !== 'undefined'){
        position.right = position.left;
        delete position.left;
      }else if(typeof position.right !== 'undefined'){
        position.left = position.right;
        delete position.right;
      }
    }

    var ps = ['left', 'top', 'right', 'bottom', 'width', 'height'];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (typeof position[p] === 'number') {
        style[p] = position[p] + 'px';
      } else if (typeof position[p] !== 'undefined') {
        style[p] = position[p];
      }else{
        style[p] = 'auto';
      }
    }
    return style;
  };
    mo.setVerticalCenter = setVerticalCenter;

    function setVerticalCenter(contextNode) {
        function doSet() {
            var nodes = query('.rdijit-vcenter-text', contextNode),
                h, ph;
            array.forEach(nodes, function(node) {
                h = html.getContentBox(node).h;
                html.setStyle(node, {
                    lineHeight: h + 'px'
                });
            }, this);

            nodes = query('.rdijit-vcenter', contextNode);
            array.forEach(nodes, function(node) {
                h = html.getContentBox(node).h;
                ph = html.getContentBox(query(node).parent()[0]).h;
                html.setStyle(node, {
                    marginTop: (ph - h) / 2 + 'px'
                });
            }, this);
        }

        //delay sometime to let browser update dom
        setTimeout(doSet, 10);
    }


  return mo;
});