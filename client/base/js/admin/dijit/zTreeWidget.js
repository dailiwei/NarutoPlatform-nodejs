/**
 * Created by richway on 2015/6/21.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/dom-construct",
    'dojo/on',
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!./template/zTreeWidget.html",
    "dojo/topic",
    "dojo/Deferred",
    'base/admin/AppCommon',
    "base/utils/commonUtils"


], function (declare,
             lang,
             html,
             domConstruct,
             on,
             JSON,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             _Widget,
             template,
             topic,
             Deferred,
             AppCommon,
             commonUtils

) {
    return declare("vendor.zTree_v3.widget.zTreeWidget", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        constructor: function (args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式

            this.curMenu = null;
            this.zTree_Menu = null;
            this.setting = {
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                view: {
                    showLine: false,
                    //showIcon: false,
                    //nameIsHTML:true,
                        selectedMulti: false,
                    dblClickExpand: false
                    ,
                    addDiyDom: lang.hitch(this,this.addDiyDom_)
                },
                data: {
                    key:{
                        name: "pageNm"
                    },
                    keep: {

                        parent:true,
                        leaf:true

                    },
                    simpleData: {
                        enable: true,
                        //重新设置下节点的东西
                        //idKey: "page_id",
                        //pIdKey: "parent_page_id"
                        idKey: "pageId",
                        pIdKey: "parentId"
                    }


                },
                callback: {
                    beforeClick: lang.hitch(this,this.beforeClick_),
                    beforeRemove:lang.hitch(this,this.beforeRemove_),
                    beforeRename: lang.hitch(this,this.beforeRename_),
                    onRemove:  lang.hitch(this,this.onRemove_),
                    beforeDrag:  lang.hitch(this,this.beforeDrag_),
                    beforeDrop:  lang.hitch(this,this.beforeDrop_),
                    onDrop:  lang.hitch(this,this.onDrop_)
                    //onRightClick:  lang.hitch(this,this.OnRightClick_)
                }
            };

            //this.zNodes = [
            //    //{id: 11, pId: 0, name: "菜单列表", open: true,drag:false, isHidden:true},
            //    {page_id: 111, parent_page_id: 11, name: "综合监视",open: true},
            //    {page_id: 211, parent_page_id: 11, name: "业务列表"},
            //    {page_id: 2111, parent_page_id: 211, name: "水情列表"},// icon:APP_ROOT+"base/vendor/zTree_v3/css/zTreeStyle/img/diy/2.png"},
            //    {page_id: 2112, parent_page_id: 211, name: "雨情列表"},
            //    {page_id: 311, parent_page_id: 11, name: "图形报表"},
            //    {page_id: 3111, parent_page_id: 311, name: "收件箱4"},
            //    {page_id: 3112, parent_page_id: 311, name: "垃圾邮件"},
            //    {page_id: 3113, parent_page_id: 311, name: "木山站"},
            //    {page_id: 411, parent_page_id: 11, name: "照片"}
            //];

            this.zNodes =  this.menuList;

            topic.subscribe("vendor/tree/nodeNameEdit",lang.hitch(this,this.edit));
            topic.subscribe("vendor/tree/nodeNtEdit",lang.hitch(this,this.editNt));
            topic.subscribe("vendor/tree/nodeNameEdit_visible",lang.hitch(this,this.editPageVisble));
        },
        OnRightClick:function(event, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
                zTree.cancelSelectedNode();
                //showRMenu("root", event.clientX, event.clientY);
            } else if (treeNode && !treeNode.noR) {
                zTree.selectNode(treeNode);
                //showRMenu("node", event.clientX, event.clientY);
            }
        },
        beforeDrag_:function (treeId, treeNodes) {
            for (var i=0,l=treeNodes.length; i<l; i++) {
                if (treeNodes[i].drag === false) {
                    return false;
                }
            }
            return true;
        },
        beforeDrop_:function (treeId, treeNodes, targetNode, moveType) {
            return targetNode ? targetNode.drop !== false : true;
        },
        onDrop_:function(event, treeId, treeNodes, targetNode, moveType, isCopy){
            //className = (className === "dark" ? "":"dark");
            //showLog("[ "+getTime()+" onDrop ]&nbsp;&nbsp;&nbsp;&nbsp; moveType:" + moveType);
            //showLog("target: " + (targetNode ? targetNode.name : "root") + "  -- is "+ (isCopy==null? "cancel" : isCopy ? "copy" : "move"))
            //showLog(targetNode.name+"他被变换位置了");


            //后台提交更新父节点
            //var jsonobj =    {
            //    "sqlid":"com.ibm.rich.framework.persistence.CfgAppPageMapper.updateCfgAppPage",
            //    "list": [  {
            //        "pageId": treeNodes[0].pageId,
            //        "parentId": treeNodes[0].parentId
            //    }   ]
            //};
            //var dataStr = JSON.stringify(jsonobj);
            //commonUtils.put( AppCommon.saveAppPageConfig,dataStr
            //).then(lang.hitch(this, function (json) {
            //        Logger.log("更新父节点成功"+treeNodes[0].pageId);
            //    }));
            var node = treeNodes[0];
            var newlist = [];
            var pra = node.getParentNode();
            var list;
            if(pra){
                list = node.getParentNode().children;
                for(var i=0;i<list.length;i++){
                    var item = list[i];
                    newlist.push({ "pageId":item.pageId,"parentId":item.parentId,"sortId":(i+1)});
                }
            }else{
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                list =  zTree.getNodes();
                for(var i=0;i<list.length;i++){
                    var item = list[i];
                    newlist.push({ "pageId":item.pageId,"parentId":"0","sortId":(i+1)});
                }
            }

            var jsonobj =    {
                "sqlid":"com.ibm.rich.framework.persistence.CfgAppPageMapper.updateCfgAppPage",
                "list":newlist
            };
            var dataStr = JSON.stringify(jsonobj);
            commonUtils.put( AppCommon.saveAppPageConfig,dataStr
            ).then(lang.hitch(this, function (json) {
                    Logger.log("更新父节点成功"+treeNodes[0].pageId);
                }));


        },
        addDiyDom_: function (treeId, treeNode) {
            var spaceWidth = 5;
            var switchObj = $("#" + treeNode.tId + "_switch"),
                icoObj = $("#" + treeNode.tId + "_ico");
            switchObj.remove();
            icoObj.before(switchObj);

            if (treeNode.level > 1) {
                var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level) + "px'></span>";
                switchObj.before(spaceStr);
            }
            //
        },
        beforeRemove_:function(treeId, treeNode){
            //父页面同时更新页面

            if(treeNode.isParent&&treeNode.children&&treeNode.children.length>0){
                alert("请从子页面开始删除");
                return false;
            }
            var isDel = confirm("确认删除 节点 -- " + treeNode.pageNm + " 吗？");
            if(isDel)
            {
                //后台提交删除
                var jsonobj =
                {
                    //"list":[
                    //    {"pageId": treeNode.pageId}
                    //],
                    //"bean":"com.ibm.rich.framework.domain.CfgAppPage"
                    "pageIds":[treeNode.pageId]
                };
                var dataStr = JSON.stringify(jsonobj);
                commonUtils.del( AppCommon.cfg_app+"/"+this.getParent().appId+"/page",dataStr
                ).then(lang.hitch(this, function (json) {
                        topic.publish("base/manager/message",{state:"info",title:"页面删除",content:"<div> 删除成功</div>"});
                    }));

                this.getParent().emptyContentDiv();
            }
            return isDel;
        },
        onRemove_:function(e, treeId, treeNode){
           Logger.log(treeNode.pageNm);
        },
        beforeRename_:function(treeId, treeNode, newName){
            if (newName.length == 0) {
                alert("节点名称不能为空.");
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                setTimeout(function(){zTree.editName(treeNode)}, 10);
                return false;
            }
            return true;
        },
        beforeClick_: function (treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.expandNode(treeNode);

            //if(treeNode.isParent){//判断是不是文件夹，直接返回
            //    return true;
            //}
            if(this.currentId == treeNode.pageId){//判断是不是点击同一节点
                return true;
            }

            //判断下是否有页面在编辑状态
            var parent = this.getParent();
            if(parent&&parent.isEdit){
                var flag = confirm("有页面正在编辑，要继续吗？");
                if(flag){//不能是分组的，要是叶子
                    //确认后采取更改选中的节点
                    this.currentId = treeNode.pageId;
                    this.getParent().loadPage(treeNode.pageId,treeNode.layoutId,treeNode.pageNm,treeNode.nt,treeNode.isParent,treeNode.visible);
                }
                return flag;
            }else{
                this.currentId = treeNode.pageId;
                if(treeNode.url&&treeNode.url.length>0){
                    this.getParent().loadLinkPage(treeNode.pageId,treeNode.pageNm,treeNode.nt,treeNode.url,treeNode.target,treeNode.visible);
                }else{
                    this.getParent().loadPage(treeNode.pageId,treeNode.layoutId,treeNode.pageNm,treeNode.nt,treeNode.isParent,treeNode.visible);
                }

                return true;
            }

        },

        postCreate: function () {
            this.inherited(arguments);

            
        },
        resize: function () {
        },
        currentId:"",
        startup: function () {
            this.inherited(arguments);

            var treeObj =$("#treeDemo");

            $.fn.zTree.init(treeObj, this.setting, this.zNodes);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			var curMenu = zTree.getNodes()[0];//.children[0];
            zTree.selectNode(curMenu);
            //设置当前选中的节点的id
            this.currentId = curMenu.pageId;

            treeObj.hover(lang.hitch(this,function () {
                if (!treeObj.hasClass("showIcon")) {
                    treeObj.addClass("showIcon");
                }
            }, lang.hitch(this,function() {
                treeObj.removeClass("showIcon");
            })));

        },
        //删除选中节点
        removeSelectItem:function() {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return;
            }

            //var callbackFlag = $("#callbackTrigger").attr("checked");
            zTree.removeNode(treeNode, true);

        },
        getSelectItem:function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return "";
            }else{
                return treeNode;
            }
        },

        edit:function(text) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return;
            }
            treeNode.pageNm = text;
            zTree.updateNode(treeNode);
            //zTree.refresh();
            //
            //zTree.selectNode(treeNode);
            //
            //topic.publish("base/admin/application/AppPageFrame/nameFocus");

            //zTree.editName(treeNode);
        },
        editNt:function(text) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return;
            }
            treeNode.nt = text;
            zTree.updateNode(treeNode);
            //zTree.refresh();
            //
            //zTree.selectNode(treeNode);
            //
            //topic.publish("base/admin/application/AppPageFrame/nameFocus");

            //zTree.editName(treeNode);
        },
        editPageVisble:function(data){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return;
            }
            treeNode.visible = data.visible;
            treeNode.nt = data.nt;
            treeNode.url = data.url;
            treeNode.target = data.target;
            treeNode.pageType = data.pageType;
            	
            zTree.updateNode(treeNode);
        },
        editPageLayout:function(layoutId){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (nodes.length == 0) {
                alert("请先选择一个节点");
                return;
            }
            treeNode.layoutId = layoutId; 
            	
            zTree.updateNode(treeNode);
        },

        newCount: 1,
        addLeaf:function (e) {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
                isParent = e.isParent,
                nodes = zTree.getSelectedNodes(),
                treeNode = nodes[0];
            if (treeNode) {
                treeNode = zTree.addNodes(treeNode, {pageId:(dojox.uuid.generateRandomUuid()+""), parentId:treeNode.id, isParent:isParent, pageNm:"新菜单页" + (this.newCount++),nt:null});
            } else {
                treeNode = zTree.addNodes(null, {pageId:(dojox.uuid.generateRandomUuid()+""), parentId:null, isParent:isParent, pageNm:"新菜单" + (this.newCount++),nt:null});
            }

            if (treeNode) {
                this.currentId = treeNode[0].pageId;//设置成当前的节点
                //设置成编辑状态，现在不用了
                this.addPage2Table(treeNode[0]);
                zTree.selectNode(treeNode[0]);
                return {"name":treeNode[0].pageNm,"pageId":treeNode[0].pageId,"isParent":isParent,"nt":treeNode[0].nt};
            } else {
                alert("请选择分组，再添加页面");

                return "";
            }


        },
        addRootLeaf:function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var treeNode = zTree.addNodes(null, {nt:null,pageId:(dojox.uuid.generateRandomUuid()+""), parentId:null,"pageType":"label", isParent:true, pageNm:"新菜单" + (this.newCount++)});

            var url= AppCommon.saveAppPageProp;
            url = url.replace(/{appId}/i, this.getParent().appId);
            var jsonobj =   {"nt":treeNode[0].nt,"pageId":treeNode[0].pageId,"parentId":null,"pageType":"label","pageNm":treeNode[0].pageNm,appId:this.getParent().appId};
            var dataStr =   JSON.stringify(jsonobj);
            commonUtils.post( url,dataStr
            ).then(lang.hitch(this, function (json) {
                    Logger.log("创建根组完成");
                }));

            zTree.selectNode(treeNode[0]);
            return {"name":treeNode[0].pageNm,"pageId":treeNode[0].pageId,"nt":treeNode[0].nt};

        },
        addRootLeafPage:function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var treeNode = zTree.addNodes(null, {nt:null,pageId:(dojox.uuid.generateRandomUuid()+""), parentId:null,"pageType":"page", isParent:false, pageNm:"新菜单" + (this.newCount++)});

            var url= AppCommon.saveAppPageProp;
            url = url.replace(/{appId}/i, this.getParent().appId);
            var jsonobj =   {"nt":treeNode[0].nt,"pageId":treeNode[0].pageId,"parentId":null,"pageType":"label","pageNm":treeNode[0].pageNm,appId:this.getParent().appId};
            var dataStr =   JSON.stringify(jsonobj);
            commonUtils.post( url,dataStr
            ).then(lang.hitch(this, function (json) {
                    Logger.log("创建根页面完成");
                }));

            zTree.selectNode(treeNode[0]);
            return {"name":treeNode[0].pageNm,"pageId":treeNode[0].pageId,"nt":treeNode[0].nt};

        },
        //根据属性添加新页面，或者组
        addPage2Table:function(treeNode){

            Logger.log(this.getParent().appId);
            //base/api/cfg/app/{appId}/page
            var list = treeNode.getParentNode().children;
            var url= AppCommon.saveAppPageProp;
            url = url.replace(/{appId}/i, this.getParent().appId);
            var jsonobj =   {"nt":treeNode.nt,"pageId":treeNode.pageId,"parentId":treeNode.parentId,"pageType":"page","pageNm":treeNode.pageNm,appId:this.getParent().appId,"sortId":(list.length+1)};
            var dataStr =   JSON.stringify(jsonobj);
            return commonUtils.post( url,dataStr
            ).then(lang.hitch(this, function (json) {
                    return json.data;
                }));

        },

        nodes2Ary:function(){
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = zTree.transformToArray(zTree.getNodes());
            Logger.dir(nodes);
        },
        getTreeNodes:function(){
        	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        	return zTree.getNodes();
        }



    });
});