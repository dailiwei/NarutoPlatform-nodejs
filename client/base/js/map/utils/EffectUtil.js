///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Richway. All Rights Reserved.
// create by dailiwei 2016-04-12 19:56
// 图层效果的工具类
///////////////////////////////////////////////////////////////////////////

define([
        "dojo/_base/lang",
        "dojo/_base/html",
        "vendor/d3/d3.v3"
    ],
    function (lang,
              html
    ) {
        var EffectUtil = {};

        EffectUtil.warnGraphic = function (gra, durationTime, time) {

            durationTime = durationTime || 1000;
            time = time || 10000;

            var node = gra.getNode();
            var cs = d3.select(node);
            var play = true;
            var loop = function (cs, flag) {
                var _cs = cs;
                _cs.transition()
                    .duration(durationTime)
                    .styleTween("opacity", function () {
                        if (flag) {
                            return d3.interpolate(0.9, 0);
                        } else {
                            return d3.interpolate(0, 0.9);
                        }
                    })
                    .each("end", function () {
                        if (play) {
                            flag = !flag;
                            loop(_cs, flag);
                        }
                    });
            };

            setTimeout(function () {
                play = false;
                //之后的图形还要恢复状态
                //－－－－
            }, time);

            loop(cs, true);
        };

        EffectUtil.showFlowPanelId = "";
        EffectUtil.showFlowPanel = function (gra, map) {
            var panelWidth = 300;
            var panelHeight = 300;

            this.showFlowPanelId = new Date().toTimeString();
            var mapName = map.id;
            html.create('div', {
                'id': this.showFlowPanelId,
                'style': 'width:100%;height:100%;text-align:center;clear:both'
            }, dojo.byId(mapName + '_root'));//这里可能会修改 esri.Map_0_root

            var htmlStr = ' <div class="radmenu"><a id="xxxa"   class="show" >站点</a>' +
                '<ul>' +
                '<li>' +
                '<a  class="">基础信息</a>' +
                ' <li>' +
                '<a >过程线</a>' +
                '</li>' +
                '<li>' +
                '<a >月报表</a>' +
                '</li>' +
                '<li>' +
                '<a >故障信息</a>' +
                '</li>' +
                '<li>' +
                '<a >设备信息</a>' +
                '<ul>' +
                '<li><a >通道 1</a></li>' +
                '<li><a >通道 2</a></li>' +
                '<li><a >通道 3</a></li>' +
                '<li><a >通道 4</a></li>' +
                '<li><a >v 5</a></li>' +
                '</ul>' +
                '</li>' +
                '</ul>' +
                '</div>';
            var _boxDiv = html.create('div', {
                'id': "div" + "xxxxxx",
                "style": "width:"+panelWidth+"px;height:"+panelHeight+"px;background-color:#ccc;background-color: rgba(252, 252, 252, 0.89);border-radius: 150px;",
                "innerHTML": htmlStr
            });
            dojo.byId(this.showFlowPanelId).appendChild(_boxDiv);
            var showPt = map.toScreen(gra.geometry);

            var left = showPt.x - panelWidth/2;
            var top = showPt.y -panelHeight/2;

            dojo.style(_boxDiv, {
                "left": left + "px",
                "top": top + "px",
                "position": "absolute",
                "width": panelWidth + "px",
                "height": panelHeight + "px",
                "margin": '0px'
            });

            //html.removeClass(dojo.byId("xxxa"),"show");
            setTimeout(lang.hitch(this,function(){
                html.addClass(dojo.byId("xxxa"),"selected");
            }),200);

        };

        return EffectUtil;
    });
