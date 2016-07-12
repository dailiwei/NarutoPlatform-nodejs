define(['dojo/_base/lang',
        'dojo/_base/array',
        "dojo/_base/declare",  
        'dojo/topic', 
        'dojo/_base/Color', 
        'base/widget/Popup'
    ],
    function (lang,
              array,
              declare, 
              topic, 
              Color,  
              Popup 
    ) {
        return declare("base.map.exlayers.CommonContourLayer3D", [], {  
        	catalog:"",
        	dataUrl:"",
        	layerName:"",
        	alpha:125,
        	
        	map:null,
            constructor: function (args) { 
            	 declare.safeMixin(this, args);
                 this.bounds = [];
                 this.colorArray = [];
                 this.colorArray2 = [];
                 //传过来的参数
                 var tStr = 'layerContour/'+args.parameters.catalog+'/';
                 this.catalog = 'Contour/'+args.parameters.catalog;
                 //创建图层数据
                 this.hander1 = topic.subscribe(tStr+"data", lang.hitch(this, this.getData));
                 //控制可见
                 this.hander2 = topic.subscribe(tStr+"visible", lang.hitch(this, this.setVis));
                 this.hander2 = topic.subscribe('layer/'+this.catalog+"/visible", lang.hitch(this, this.setVis));
                 this.id = args.parameters.layerName;//this.name;//为以后获取图例名称准备
            },
            
            setMap:function(map){
                this.map = map;
            },
            praseColors:function(colors){
            	
            	this.colorArray = [];
            	this.colorArray2 = [];
            	for(var i=0;i<colors.length;i++){
            		var cs = colors[i].rgb;
            		var cs_ = cs.split(",");
            		if(i==0){
            			var color=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),255);
            			this.colorArray.push(color); 
            			var color2=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),this.alpha);
            			this.colorArray2.push(color2);
            		}
            		var color=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),255);
        			this.colorArray.push(color); 
        			var color=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),this.alpha);
        			this.colorArray2.push(color);
            		if(i==(colors.length-1)){
            			var color3=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),255);
            			this.colorArray.push(color3); 
            			this.colorArray.push(color3); 
            			this.colorArray.push(color3); 
            			var color4=Cesium.Color.fromBytes(Number(cs_[0]),Number(cs_[1]),Number(cs_[2]),this.alpha);
            			this.colorArray2.push(color4);
            			this.colorArray2.push(color4);
            			this.colorArray2.push(color4);
            		} 
            	} 
            }, 
            getData: function (json) { 
            	if(json.hasOwnProperty("colors")){
					//解析颜色信息 
					this.praseColors(json.colors); 
				} 
                this.addContourGraphics(json.value);
            },

            currentVis:true,
            setVis:function(vis){
                this.currentVis = vis;
                var len = this.bounds.length;
                for (var i = 0; i < len; ++i) {
                    var b = this.bounds[i];
                    b.show = vis;
                }
            },

            isLine:false,//默认是面，参数化
        
            //颜色的，等值面的
            // colorArray:[0xFFFFFF, 0xFFFFFF, 0xA9F18D, 0x3BB642, 0x5EB9FF, 0x0000FE, 0xF901F8, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444, 0x820444],
            colorArray: [new dojo.Color([255, 255, 255]), new dojo.Color([255, 255, 255]), new dojo.Color([169, 241, 141]), new dojo.Color([59, 182, 66]), new dojo.Color([94, 185, 255]), new dojo.Color([0, 0, 254]), new dojo.Color([249, 1, 248]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68]), new dojo.Color([130, 4, 68])],
            colorArray2: [new dojo.Color([255, 255, 255, 0.5]), new dojo.Color([255, 255, 255, 0.5]), new dojo.Color([169, 241, 141, 0.5]), new dojo.Color([59, 182, 66, 0.5]), new dojo.Color([94, 185, 255, 0.5]), new dojo.Color([0, 0, 254, 0.5]), new dojo.Color([249, 1, 248, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5]), new dojo.Color([130, 4, 68, 0.5])],

            bounds:[],
            addContourGraphics: function (obj) {
                this.clear();
                var resultObject = obj["results"][0];
                var value = resultObject.value;
                var features = value.features;
              
                array.forEach(features, function (feature) {
                    var attributes = feature.attributes;
                    var i = attributes.level; 
                    var geometry = feature.geometry; 
                    var ringsArray = new Array();
                    var rings = geometry.rings[0];
                    array.forEach(rings, function (item) { 
                        ringsArray.push(item[0], item[1]); 
                    }, this);

                    var bound = this.map.entities.add({
    				    name : 'polygon',
    				    polygon : {
    				        hierarchy : Cesium.Cartesian3.fromDegreesArray(ringsArray),
//    				        extrudedHeight: 500000.0,
    				        material :this.colorArray2[i],// (this.isLine?Cesium.Color.GREEN.withAlpha(0.1):Cesium.Color.GREEN.withAlpha(0.6)),
    				        outline : true,
    				        outlineColor : this.colorArray[i],//Cesium.Color.ORANGE,
    				        outlineWidth:2.0
    				    }
    				}); 
                    this.bounds.push(bound);
//                   
//                    graphic.symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this.colorArray[i], 1), this.colorArray2[i]);
//                    this.add(graphic);
                }, this);
                
            },
            clear:function(){
            	 
            	for(var i=0;i<this.bounds.length;i++){
            		this.map.entities.remove(this.bounds[i]);
            	}
            	
            },
            destroy:function(){
                this.clear();
                this.bounds = null;
            	this.hander1.remove();
            	this.hander2.remove();
            	this.hander1 = null;
            	this.hander2 = null;
            }
        });
    });