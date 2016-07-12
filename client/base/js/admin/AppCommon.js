define(['dojo/_base/lang',
        'dojo/_base/array',
        'dojo/on',
        'dojo/aspect',
        'dojo/Deferred',
        'dojo/cookie',
        'dojo/json',
        'dojo/topic',
        'dojo/sniff',
        'dojo/_base/url',
        'dojo/io-query'
    ],

    function(lang, array, on, aspect, Deferred, cookie, json, topic, sniff, Url, ioquery) {
        var AppCommon = {};

        AppCommon.webRoot = window.APP_ROOT;
        //获取所有的app列表
        //AppCommon.getApps = AppCommon.webRoot + "base/api/common/querymap";
        AppCommon.cfg_app = AppCommon.webRoot + "base/api/cfg/app";

        //新创建一个app
        AppCommon.saveAppProp = AppCommon.webRoot + "base/api/app/saveAppProp/";

        //获取应用的类别对照表
        AppCommon.getCmptCats = AppCommon.webRoot + "base/api/cfg/cats";

        //获取组件列表
        //AppCommon.getAppCpmts = AppCommon.webRoot + "base/api/common/querymap";
        AppCommon.getAppCpmts = AppCommon.webRoot + "base/api/cfg/cmpt";


        //保存勾选的组件与APP关系，适用于新添和修改编辑
        AppCommon.saveAppCmptProp = AppCommon.webRoot + "base/api/app/saveAppCmptProp";

        //通过appid和cmptid获取appervice列表
        AppCommon.getCmptServiceList = AppCommon.webRoot+"base/api/cfg/app/{appId}/cmpt/{cmptId}/service";

        //取得布局
        AppCommon.getLayouts = AppCommon.webRoot + "base/api/cfg/layout";
        //根据选择的组件取得布局
        AppCommon.getLayoutsByComponents = AppCommon.webRoot + "base/api/cfg/layout?filter=component_id in ";
        //获取appid对应的页面
        //AppCommon.getAppPageByAppId = AppCommon.webRoot + "base/api/common/querymap";
        AppCommon.getAppPageByAppId = AppCommon.webRoot + "base/api/common/querymap";


        //保存页面配置信息
        // AppCommon.saveAppPageConfig = AppCommon.webRoot + "base/api/common/updateListByMapper";
        AppCommon.saveAppPageConfig = AppCommon.webRoot + "base/api/cfg/app/{appId}/page";


        //根据选择的组件取得widget 列表
        //AppCommon.getWidgetsByComponents = AppCommon.webRoot + "base/api/common/querymapArray";
        AppCommon.getWidgetsByComponents = AppCommon.webRoot + "base/api/cfg/widget?filter=component_id in ";

        //添加应用【页面】CfgAppPage
        //AppCommon.saveAppPageProp = AppCommon.webRoot + "base/api/app/saveAppPageProp";
        AppCommon.saveAppPageProp = AppCommon.webRoot + "base/api/cfg/app/{appId}/page";

        //删除应用
        //AppCommon.delAppByAppId = AppCommon.webRoot + "base/api/app/deleteApps";
        AppCommon.delAppByAppId = AppCommon.webRoot + "base/api/cfg/app/";

        //根据pageid 获取pageinfo
        AppCommon.getAppPageByPageId = AppCommon.webRoot + "base/api/common/querymap";

        //删除页面
        AppCommon.delPageById = AppCommon.webRoot + "base/api/common/";


        //得到当前页面的分组

        AppCommon.getCurrentPageAccess = AppCommon.webRoot + "base/api/cfg/app/{appId}/page/{pageId}/access";
        //得到系统的分组信息
        //AppCommon.getOrg = AppCommon.webRoot + "base/api/organizations";
        AppCommon.getOrg = AppCommon.webRoot + "base/api/sysmana/role/group";// "base/api/roles";
        //访问component的URL
        AppCommon.Component = AppCommon.webRoot + "base/api/cfg/cmpt";

        AppCommon.getAppAccess = AppCommon.webRoot + "base/api/cfg/app/{appId}/access";
        AppCommon.getAppRoles = AppCommon.webRoot + "base/api/cfg/app/{appId}/roles";
        return AppCommon;



    });
