/////////////////////////////////////////////////////////////////////////// 
// create by dailiwei 2016-04-22 20:12
///////////////////////////////////////////////////////////////////////////
define(
    [
        "dojo/_base/declare",
        "dojo/_base/lang",
        'dojo/_base/html',
        'dojo/query',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/topic",
        "dojo/Deferred",
        "dojo/dom-construct",
        "dojo/dom-class",
        'dojo/on',
        "dojo/text!./templates/LeftTreeMenu.html",
        "dojo/text!./css/LeftTreeMenu.css",
        "base/plugins/metisMenu/jquery.metisMenu"
        ],
    function (declare,
              lang,
              html,
              query,
              _TemplatedMixin,
              _WidgetsInTemplateMixin,
              _Widget,
              topic,
              Deferred,
              domConstruct,
              domClass,
              on,
              template,
              css
              ) {

        var instance = declare("base.widgets.LeftTreeMenu", [_Widget, _TemplatedMixin],
            {
                templateString: template,
                baseClass: 'base-widgets-LeftTreeMenu',
                name: "测试",

                wrapperHtml: "layoutWrapperMin.jsp",
                constructor: function (args) {

                    this.p = args;
                    if (this.p.wrapperHtml) {
                        this.wrapperHtml = this.p.wrapperHtml;
                    }
                    this.setCss(css);  
                },
               
                postCreate: function () {
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments); 

                    var P = $(window).height();
                    this.HEIGHT = P - 52;  //菜单的最多高度 
                    
                    var str = this.getLeftCldChildren(this.menuid,this.pages,2);
                    
                    $("#side-menu").append(str);
                  
                    this.createMenu();
                },
                getLeftCldChildren:function(menuId,listData,level){
                	var sbMenu = "";
            		for(var i=0;i<listData.length;i++){
            			var objMap=listData[i];
            			var strThisPar=objMap.parentId;
            			strThisPar=strThisPar==null?"":strThisPar;
            			var style ="";
            			var styleIsRoot="";
            			if(level==2)
            				styleIsRoot="class=\"nav-label\""; 
            			if(strThisPar==(menuId)){
            				//是子
            				var strThisId=objMap.pageId;
            				//有子
            				if(this.isHaveChild(strThisId,listData)){
            					var sbChild ="";
            					sbChild+=(this.getLeftChildren(strThisId,listData,level+1));
            					
            					sbMenu+=("<li "+style+"\" ><a href='javascript:;'");
            					//检查是否有图标
            					var strImg=objMap.menuLogo;
            					if(strImg!=null&&strImg.startsWith("class:")){
            						//是图标你信不？信！麻痹快写
            						sbMenu+=(" class=\""+strImg.replace("class:", "")+"\" ");
            					}
            					sbMenu+=("><i></i>");
            					sbMenu+=("<span data-toggle=\"menuspan\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" class=\"nav-label\">");
            					sbMenu+=(""+objMap.pageNm+"</span><span class=\"fa arrow\"></span></a>");
            					sbMenu+=("<ul class=\"nav "+this.getLevelEn(level)+"\" >");
            					sbMenu+=(sbChild);
            					sbMenu+=("</ul></li>");
            				}
            				else{
            					//没有子了
            					sbMenu+=("<li "+style+"\" >");
            					sbMenu+=("<a  data-toggle=\"menu\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" href='javascript:;' ");
            					//检查是否有图标
            					var strImg=objMap.menuLogo; 
            					if(strImg!=null&&strImg.startsWith("class:")){
            						//是图标你信不？信！麻痹快写
            						sbMenu+=(" class=\""+strImg.replace("class:", "")+"\" ");
            					}
            					sbMenu+=("><i></i>");
            					sbMenu+=("<span data-toggle=\"menuspan\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" class=\"nav-label\">"+objMap.pageNm+"</span></a></li>");
            				}
            			}
            		}
            		return sbMenu;
                },
                getLeftChildren:function(menuId,listData,level){
            		var sbMenu = "";
            		for(var i=0;i<listData.length;i++){
            			var objMap=listData[i];
            			var strThisPar=objMap.parentId;
            			strThisPar=strThisPar==null?"":strThisPar;
            			var style ="";
            			if(menuId!=null)
            				style=(menuId==(objMap.pageId))?" class=\"active\" ":"";
            			if(strThisPar==(menuId)){
            				//是子
            				var strThisId=objMap.pageId;
            				//有子
            				if(this.isHaveChild(strThisId,listData)){
            					var sbChild = "";
            					sbChild+=(this.getLeftChildren(strThisId,listData,level+1));
            					sbMenu+=("<li  "+style+"\" ><a   href='javascript:;' ");
            					//检查是否有图标
            					var strImg=objMap.menuLogo;
            					if(strImg!=null&&strImg.startsWith("class:")){
            						//是图标你信不？信！麻痹快写
            						sbMenu+=(" class=\""+strImg.replace("class:", "")+"\" ");
            					}
            					sbMenu+=("><i></i><span data-toggle=\"menuspan\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" class=\"nav-label\">");
            					sbMenu+=(""+objMap.pageNm+"</span><span class=\"fa arrow\"></span></a>");
            					
            					sbMenu+=("<ul class=\"nav "+this.getLevelEn(level)+"\" >");
            					sbMenu+=(sbChild);
            					sbMenu+=("</ul></li>");
            				}
            				else{
            				//没有子了
            					sbMenu+=("<li"+style+"><a  data-toggle=\"menu\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" href='javascript:;' ");
            					//检查是否有图标
            					var strImg=objMap.menuLogo;
            					if(strImg!=null&&strImg.startsWith("class:")){
            						//是图标你信不？信！麻痹快写 
            						sbMenu+=(" class=\""+strImg.replace("class:", "")+"\" ");
            					}
            					sbMenu+=("><i></i><span data-toggle=\"menuspan\" data-id=\""+objMap.pageId+"\" data-type=\""+objMap.pageType+"\" data-target=\""+objMap.target+"\" data-url=\""+objMap.url+"\" class=\"nav-label\">");
            					sbMenu+=(""+objMap.pageNm+"</span></a></li>"); 
            				}
            			}
            		}
            		return sbMenu;
            	},
                isHaveChild:function(strId,listData){
            		for(var i=0;i<listData.length;i++){
            			var objMap=listData[i];
            			var strPar="";
            			if(objMap.parentId!=null)
            				strPar=objMap.parentId;
            			if(strPar==(strId))
            				return true;
            		}
            		return false;
            	},
            	getLevelEn:function(level){
            		if(level==2){
            			return "nav-second-level";
            		}
            		else if(level==3){
            			return "nav-third-level";
            		}
            		else
            			return "";
            	},
                
                createMenu:function(){
                	  // MetsiMenu
                    $("#side-menu").metisMenu();
                    
                    $("#side-menu li").click(function(){ 
                    	$(this).addClass("active").siblings().removeClass("active");
                    	//$(this).parent().siblings().removeClass("active"); 
                    	$(this).siblings().children().removeClass("active");
                    });
                    $('.navbar-minimalize').click(function () {
                        $("body").toggleClass("mini-navbar");
                        this.SmoothlyMenu();
                    });
                },
                
                SmoothlyMenu:function(){
                	  if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                	        // Hide menu in order to smoothly turn on when maximize menu
                	        $('#side-menu').hide();
                	        // For smoothly turn on menu
                	        setTimeout(lang.hitch(this,function () {
                	                $('#side-menu').fadeIn(500);
                	            }), 100);
                	    } else if ($('body').hasClass('fixed-sidebar')) {
                	        $('#side-menu').hide();
                	        setTimeout(lang.hitch(this,function () {
                	                $('#side-menu').fadeIn(500);
                	            }), 300);
                	    } else {
                	        // Remove all inline style from jquery fadeIn function to reset menu state
                	        $('#side-menu').removeAttr('style');
                	    }
                },
              
                destroy: function () { 

                    this.inherited(arguments);
                }
            });
        return instance;
    });