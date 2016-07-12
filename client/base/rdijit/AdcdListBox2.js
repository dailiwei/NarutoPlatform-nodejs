///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-02 11:34
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/html',
  "dojo/dom-construct",
  "dojo/on",
  "rdijit/form/Search",
  "dijit/form/Select",
        "dojo/_base/fx",
    	'dojo/topic',
  'dojo/on'
],
function(
		declare, 
		_WidgetBase, 
		lang,
		html,
		domConstruct,
		on,
		Search,
        Select,
        fx,
        topic,
        on) {

  return declare(_WidgetBase, {
    declaredClass: 'rdijit.AdcdListBox2',
    
    mainContainer:null,
    list:null,
    show:false,
    firstLoad:true,
    constructor:function(args){
        this.inherited(arguments);
        this.mainContainer = args.container;
    },
    postCreate: function(){
        this.inherited(arguments);


        this.listDiv = html.create('div', {
            'style':' padding-lef:0px; padding-left: 2px;vertical-align:middle;float:left;width:410px;height:30px;  box-shadow: 0 0 1px #6b6a67; background-color: rgba(247, 249, 250, 0.74902);'
        },  this.domNode);

        this.listDiv1 = html.create('div', {
            'style':' float:left;width:100px;height:30px; padding-top:2px;'
        },  this.listDiv);
        this.listDiv2 = html.create('div', {
            'style':' float:left;width:20px;height:30px; padding-top:2px; '
        },  this.listDiv);
        this.listDiv3 = html.create('div', {
            'style':' float:left;width:100px;height:30px;padding-top:2px; '
        },  this.listDiv);
        this.listDiv4 = html.create('div', {
            'style':' float:left;width:20px;height:30px;padding-top:2px; '
        },  this.listDiv);
        this.listDiv5 = html.create('div', {
            'style':' float:left;width:100px;height:30px; padding-top:2px;'
        },  this.listDiv);
        ////查询框的选择
        //this.listDiv2 = html.create('div', {
        //    'style':'padding-left: 20px; float:left;width:170px;height:30px;  box-shadow: 0 0 1px #6b6a67; background-color: rgba(247, 249, 250, 0.74902);'
        //},  this.listDiv);
        this.getAdvcd();

        //var search1 = new Search({
        //    placeholder: '---',
        //    style: "float: left; width: 130px;margin-left: 10px;margin-right: 20px;"
        //},   this.listDiv2 );
        //search1.onSearch = function(text){
        //    alert(text);
        //};
        //search1.startup();

        this.btnDiv = html.create('div', {
            'class':"rdijit-AdcdListBox-item",
            'style':' float:right;width:50px;height:20px;margin:5px ',
            innerHTML:"确定"
        },  this.listDiv);

        this.own(on(this.btnDiv, 'click', lang.hitch(this, function(){
             this.setExtent( this.getAdcd());
        })));

    },
    setExtent:function(adcd){
    //	/rich/base/api/region-service/getGeoByAdcd?adcd=110227000000000
    	this.getBoundery(adcd).then(lang.hitch(this,function(data){
    		
    		var geoStr = data.geodata;
    		topic.publish("base/map/widgets/MapBoundary/update",{geoStr:geoStr});
    	}));
    },
   
    getBoundery:function(adcd){
        //adcds = "341524103000000,341524101000000,341524100000000,341524200000000";
        //获取边界
       return dojo.xhrGet({
            url:window.APP_ROOT+"/base/api/region-service/getGeoByAdcd",
            handleAs: "text", 
            content: {adcd: adcd}
        }).then(lang.hitch(this, function (response) {
            var json = dojo.fromJson(response);
            if (json.success == true) {//成功返回
                return json.data[0];
            } else {
                return null;
            }
        }));


    },
      getAdvcd:function (){

          this.createSheng().then(lang.hitch(this,function(adcd){

              //直接创建市
              this.advcds1 = [];
              this.advcds1.push({"value":"-1","label":"所在市","selected":true});
              this.select_tm1 = new dijit.form.Select({
                  name: 'select_adcd2',
                  options: this.advcds1,
                  onChange: lang.hitch(this, function (evt) {
                      var adcd = (this.select_tm1.get('value'));
                      if(adcd=="-1"){

                      }else{
                          this.createXian(adcd);
                      }

                  })
              });
              this.select_tm1.placeAt(this.listDiv3);
              this.select_tm1.startup();

              var label2 = html.create('div', {
                  'class': 'rdijit-Label-no',
                  innerHTML: "～"
              }, this.listDiv4);

              //直接创建县
              this.advcds2 = [];
              this.advcds2.push({"value":"-1","label":"所在县","selected":true});
              this.select_tm2 = new dijit.form.Select({
                  name: 'select_adcd2',
                  options: this.advcds2
              });

              this.select_tm2.placeAt(this.listDiv5);
              this.select_tm2.startup();
          }))
      },
      //http://192.168.1.45:7070/rich/base/api/region-service/region?adcd=
      //http://192.168.1.45:7070/rich/base/api/region-service/getGeoByAdcd?adcd=110227000000000
      baseUrl:"http://localhost:8080",
      createSheng:function(){
          return dojo.xhrGet({
              url: APP_ROOT+"base/data/adcd.json",
              handleAs: "text"
          }).then(lang.hitch(this, function (response) {
              var json = dojo.fromJson(response);
              //返回的是省的
              var list = json.data[0].list;
              var advcds  =[];
              advcds.push({"value":"-1","label":"所在省","selected":true});
              for(var i=0;i<list.length;i++){
                  if(i==0){
                      advcds.push({"value":list[i].ADCD,"label":list[i].ADNM});
                  }else{
                      advcds.push({"value":list[i].ADCD,"label":list[i].ADNM});
                  }
              }

              this.advcds = advcds;
              //创建面板
              this.select_tm = new dijit.form.Select({
                  name: 'select_adcd',
                  options: this.advcds,
                  onChange: lang.hitch(this, function (evt) {
                      var adcd = (this.select_tm.get('value'));
                      if(adcd=="-1"){

                      }else {
                          this.createShi(adcd);
                      }

                  })
              });
              this.select_tm.placeAt(this.listDiv1);
              this.select_tm.startup();
              var label1 = html.create('div', {
                  'class': 'rdijit-Label-no',
                  innerHTML: "～"
              }, this.listDiv2);

              return this.advcds[0].value;
          }));
      },

      createShi:function(adcd){
          //创建市的
          return dojo.xhrGet({
              url:window.APP_ROOT+"/base/api/region-service/region",
              handleAs: "text",
              content: {adcd:adcd}
          }).then(lang.hitch(this, function (response) {

              var json = dojo.fromJson(response);

              //返回的是市的
              var list = json.data[0].list;
              var advcds1 = [];
              advcds1.push({"value":"-1","label":"所在市","selected":true});
              for (var i = 0; i < list.length; i++) {
                  if (i == 0) {
                      advcds1.push({"value": list[i].ADCD, "label": list[i].ADNM});
                  } else {
                      advcds1.push({"value": list[i].ADCD, "label": list[i].ADNM});
                  }
              }

              this.advcds1 = advcds1;

              this.select_tm1._setOptionsAttr(this.advcds1);

              return this.advcds1[0].value ;
          }));
      },
      createXian:function(adcd){
          //县的
          return dojo.xhrGet({
              url: window.APP_ROOT+"/base/api/region-service/region",
              handleAs: "text",
              content: {adcd:adcd}
          }).then(lang.hitch(this, function (response) {

              var json = dojo.fromJson(response);

              //返回的是市的
              var list = json.data[0].list;
              var advcds2  =[];
              advcds2.push({"value":"-1","label":"所在县","selected":true});
              for(var i=0;i<list.length;i++){
                  if(i==0){
                      advcds2.push({"value":list[i].ADCD,"label":list[i].ADNM,"selected":true});
                  }else{
                      advcds2.push({"value":list[i].ADCD,"label":list[i].ADNM});
                  }
              }

              this.advcds2 = advcds2;
              this.select_tm2._setOptionsAttr(this.advcds2);
              return true;
          }));
      },
      //获取行政区的
      getAdcd:function (){
          var adcd = this.select_tm2.get("value");//测试先获取最后一个级别的
          if(adcd=="-1"){
              adcd = this.select_tm1.get("value");
              if(adcd=="-1"){
                  adcd = this.select_tm1.get("value");
                  if(adcd="-1"){
                      return "";//全国的
                  }
              }
          }
          return adcd;
      }

  });
});