/*
 Richway dlw
*/

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
	    'dojo/_base/html',
	    'dojo/on',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./template/PlotInfo.html",
        "dojo/topic",
        "dojo/Deferred"
        ],function(
        	declare,
        	lang,
			html,
			on,
        	_TemplatedMixin,
    		_WidgetsInTemplateMixin,
    		_Widget,
    		template,
    		topic,
    		Deferred
    	 
        ){
	return declare("base.map.dijit.PlotInfo", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
		templateString: template, 
  
		baseClass:'base-map-dijit-PlotInfo',
		update:false,//两种行为，一种是新建，一种是更新
		title:"标绘",
		type:"busi_drought",
		nt:"动态标绘",
		isFlag:false,
		constructor: function(args){
			//declare.safeMixin(this, args);

			var sdateStr = dojo.date.locale.format(new Date(), {datePattern: "yyyy-MM-dd HH:mm:ss", selector: "date"}) ;
			this.title = args.title?args.title:(this.title+sdateStr);
			this.type = args.type?args.type:(this.type);
			this.update = args.update?args.update:(this.update);
			this.nt = args.nt?args.nt:(this.nt);

		},
		types:[
			{"name":"普通标注","value":"normal"},
			{"name":"输水线路","value":"ewt"},
			{"name":"应急专题","value":"emergency"},
			{"name":"其他标注","value":"normal"}

		],
		postCreate:function(){
			this.inherited(arguments);

			for(var i=0;i<this.types.length;i++){
				var item = this.types[i];
				this.typeSelect.options.add(new Option(item.name,item.value));
			}
			this.type  = "normal";

			this.titleDiv.value = this.title;
		},
		typeChange:function(e){

			var index=this.typeSelect.selectedIndex; //序号，取当前选中选项的序号
			this.type = this.typeSelect.options[index].value;


		},
		destroy:function(){
			this.inherited(arguments);
		},
		save:function(){

			if(this.titleDiv.value==""){
				topic.publish("base/manager/message", {
				    state: "warn",
				    title: "提示",
				    content: "<div> 请添加标题</div>"
				});
				return;
			}else{
				this.title = this.titleDiv.value;
			}

			if(this.ntDiv.value==""){
				//topic.publish("base/manager/message", {
				//	state: "warn",
				//	title: "提示",
				//	content: "<div> 请添加标题</div>"
				//});
				//return;
				this.nt = "";
			}else{
				this.nt = this.ntDiv.value;
			}

			this.isFlag = true;
			this.getParent().close();

		}

		
	});
});