/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget", 
        "dojo/topic",
        "base/utils/commonUtils",
        "dojo/text!./css/MapRegionSel.css",
	    "./MapPlugin"
        ],function(
        	declare,
        	lang,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget, 
    		topic,
    		utils,
    		css,
			MapPlugin
        ){
	return declare("base.map.widgets.MapRegionSel", [MapPlugin],{
		templateString: "<div style='top: 15px; left: auto; right: 30px; bottom: auto; position: absolute;z-index: 1;'><span data-dojo-attach-point='btn_toggle'data-dojo-attach-event='click:toggle'style='border: 1px solid rgb(128, 128, 128);width: 35px;cursor: pointer;display:block;height: 35px;text-align: center;font-size: 12px;background-color:#fff;'>选择区域</span><div style='background-color:#fff;display:none;width: 320px;position: absolute;left:-325px;top:0px;border:rgb(2,169,199) 2px solid;padding:7px;'data-dojo-attach-point='region_container'><!--<div class='region-tab'><a>行政区</a><a>水资源分区</a></div>--><div data-dojo-attach-point='region_panels'><div data-dojo-attach-point='panel_division'><div class='region-box'><div><label class='text-success'>全国</label><span class='region-confirm'>确定</span></div><ul></ul></div><div class='region-box'style='display:none'><div><label class='text-success'>区域-市</label></div><ul></ul></div><div class='region-box'style='display:none'><div><label class='text-success'>区域-县</label></div><ul></ul></div></div><!--<div style='display:none'></div>--></div></div></div>",
		baseClass: 'base-map-widgets-mapRegionSel',
		constructor: function(args){
			this.fullExtent = {};
			this.loaded = false;
			this.setCss(css);
			this.cache = {
					division: {},
					water: {}
				}
		},
		destory:function(){

			this.cache = null;
			//销毁监听
			this.inherited(arguments);
		},
		postCreate:function(){
			this.inherited(arguments);
			
			var _this = this;
			this.own(topic.subscribe("base/map/widgets/MapRegionSel/reloadGeoByAdcd",
					utils.hitch(this, this.toggleRegion)));
			this.own(topic.subscribe("base/map/widgets/MapRegionSel/changeName",
					utils.hitch(this, this.changeName)));
			 
			
			var activeRegion = null;
			$(this.panel_division).on("click", "li", function(){
				var $this = $(this);
				$this.addClass("active").siblings(".active").removeClass("active");
				activeRegion = {
					adCd : $this.attr("data-adcd"),
					adNm : $this.text()
				}
				var next = $this.closest(".region-box").nextAll().hide(0);
				if(next.length > 0){
					_this._loadDivision(activeRegion.adCd, activeRegion.adNm, $(next[0]));
				}
			});
			$(this.panel_division).find(".region-confirm").click(function(){
				if(activeRegion){
					_this.toggleRegion(activeRegion.adCd, activeRegion.adNm);
				}
				_this.toggle();
			});
//			this.toggleRegion(DEFAULT_ADCD, DEFAULT_ADNM);
		},
		toggleRegion: function(adCd, adNm){
			$(this.btn_toggle).text(adNm);
			topic.publish("base/map/widgets/MapBoundary/updateByGraphicByAdcd",adCd);
		},
		toggle: function(){
			$(this.region_container).fadeToggle();
			if(!this.loaded){
				this._loadDivision(DEFAULT_ADCD, DEFAULT_ADNM, $($(this.panel_division).children()[0]));
				this.loaded = true;
			}
		},
		_renderDivision: function(data, pAdCd){
			var html = [];
			for(var i = 0, len = data.length;i < len;i++){
				var d =data[i];
				if(d.adCd == pAdCd)
					continue;
				html.push("<li data-adcd='");
				html.push(d.adCd);
				html.push("'>");
				html.push(this.shortAdnm(d.adNm));
				html.push("</li>");
			}
			return html.join("");
		},
		_loadDivision: function(adCd, adNm, $box){
			$box.show();
			$box.children("div").children("label").text(adNm);
			if(this.cache.division[adCd]){
				$box.children("ul").html(this.cache.division[adCd]);
			}else{
				$box.children("ul").addClass("loading").html("<div><i class='fa fa-spinner fa-spin'></i></div>");
				utils.get(APP_ROOT+"base/api/region-service/subregion/" + adCd)
					.then(lang.hitch(this, function(res){
						$box.children("ul").children().hide(utils.hitch(this, function(){
							var html = this._renderDivision(res.data, adCd);
							this.cache.division[adCd] = html;
							$box.children("ul").removeClass("loading").html(html);
						}));
					}));
			}
		},
		ignoreWords:["省","市","自治区","自治","彝族","藏族","维吾尔","回族","特别行政区","壮族","省"],
		shortAdnm: function(adNm){
			for(var i = 0,l = this.ignoreWords.length;i < l;i++){
				adNm = adNm.replace(this.ignoreWords[i],"");
			}
			adNm = adNm.replace("水利委员会","委");
			adNm = adNm.replace("流域管理局","局");
			return adNm;
		},
		changeName:function(name){
			$(this.btn_toggle).text(name);
		}
	});
});