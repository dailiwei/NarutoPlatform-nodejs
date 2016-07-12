define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/on",
    "dojo/topic",

    "esri/layers/GraphicsLayer",
    "esri/Color",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/graphic",
    "vendor/d3/d3.v3"
], function (declare,
             lang,
             array,
             connect,
             on,
             topic,

             GraphicsLayer,
             Color,
             SpatialReference,
             Point,
             webMercatorUtils,
             Graphic

) {
    return declare("base.map.exlayers.AlertPointsLayer",[GraphicsLayer], {

        t: 1,
        delta: 0.01,

        handlers:[],
        firstLoad:true,
        constructor: function (args) {

            this.handlers = [];

            this.stroke = d3.scale.category10();

            this.handlers.push(topic.subscribe("map/center/data", lang.hitch(this, this.getData)));

        },
        destroy:function(){
            //移除监听
            var list = this.handlers;
            for (var i = 0, max = list.length; i < max; i++) {
                var item = list[i];
                item.remove();
            }
        },
        _setMap: function(){

            ////测试派发数据
            //setTimeout(lang.hitch(this,function(){
            //    topic.publish("map/center/data",{lgtd:119,lttd:36});
            //}));

            return this.inherited(arguments);
        },

        _project: function (item) {
            var p = new Point(item.lgtd, item.lttd);
            var point = this.getMap().toScreen(p);
            return [point.x, point.y];
        },
        _reset: function () {
            var self = this;

            self._element().selectAll("circle.alertpoints")
                .attr("cx", function (d, i) {
                    if (d) {
                        return self._project(d)[0];
                    }
                    else {
                        return d.x;
                    }
                })
                .attr("cy", function (d, i) {
                    if (d) {
                        return self._project(d)[1];
                    }
                    else {
                        return d.y;
                    }
                });
        },
        _element: function () {

            return d3.select("g#" + this.id + "_layer");
        },

        getData: function (list) {
            if(this.firstLoad){
                this.handlers.push(on(this.getMap(),"zoom-end", lang.hitch(this,this._reset)));
                //this.handlers.push(on(this.getMap(),"pan-end", lang.hitch(this,this._reset)));
                this.firstLoad = false;
            }
            var self = this;

            if(!lang.isArray(list)){
                list = [list];
            }

            self._element().selectAll("circle.alertpoints").remove();

            var p = self._element();
            var xoffset = 0;
            var yoffset = 0;
            try{
                xoffset = p[0]["0"].transform.animVal[0].matrix.e;
                yoffset =  p[0]["0"].transform.animVal[0].matrix.f;
            }catch(e){  }

            this.play = true;
            var cs = p.selectAll("circle")
                .data(list)
                .enter().append("circle")
                .attr("r", 5)
                .attr("stroke-width", 9)
                .attr("stroke", "red")
                .attr("stroke-opacity", 0.8)
                .attr("opacity", 0.5)
                .attr("fill", "none")
                .attr("class", "alertpoints")
                .attr("cx", function (d, i) {
                    return self._project(d)[0] - xoffset;
                })
                .attr("cy", function (d, i) {
                    return self._project(d)[1] - yoffset;
                });

            //播放动画 测试
            self.loop(cs);
            //
            //setTimeout(lang.hitch(this,function(){
            //    this.play = false;
            //    self._element().selectAll("circle.alertpoints").remove();
            //}),this.delayTime);

        },
        play:true,
        rMin:5,
        rMax:50,
        durationTime:1300,
        delayTime:5000,
        loop: function (cs) {
            var _cs = cs;
            _cs.transition()
                    .duration(this.durationTime)
                    .attrTween("r", lang.hitch(this,function () {
                        return d3.interpolate(this.rMin, this.rMax);
                    }))
                    //.styleTween("stroke", function () {
                    //    return d3.interpolate("red", "green");
                    //})
                    .styleTween("stroke-width", function () {
                        return d3.interpolate(9, 0);
                    })
                    //.styleTween("stroke-opacity", function () {
                    //    return d3.interpolate(0.8, 0);
                    //})
                    .styleTween("opacity", function () {
                        return d3.interpolate(0.8, 0);
                    });
                    //.each("end", lang.hitch(this,function(){
                    //   if(this.play){
                    //       this.loop(_cs);
                    //  }
                    //}));
        }

    });

});