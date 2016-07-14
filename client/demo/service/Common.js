///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway&IBM. All Rights Reserved.
// create by dailiwei 2015-08-11 11:41
///////////////////////////////////////////////////////////////////////////

//管理UI组件,使用的所有的service 地址
//所有的东西放在这里管理
define([],
    function () {
        var Common = {};

        Common.webRoot = window.APP_ROOT;//获取的全局的一个变量就是service的地址，和端口

        //获取所有的app列表，获取app列表
        Common.getApps =  Common.webRoot +"rich/base/api/cfg/app";

        //通过appid和cmptid获取appervice列表，{appId}，在使用的时候进行替换，例如:url.replace(/{appId}/i, this.appId)
        Common.getCmptServiceList = Common.webRoot+"rich/base/api/cfg/app/{appId}/cmpt/{cmptId}/service";

        //Common.* = Common.webRoot+"**";
        //图片上传的
        Common.upload2disk = Common.webRoot+"rich/base/api/file/upload2disk";
        
        //gridx 树的
        Common.getGridTreeData = Common.webRoot+"simple/temp/gridx_tree_data.json";

        return Common;

    });
