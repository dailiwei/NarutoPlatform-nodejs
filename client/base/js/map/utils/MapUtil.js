///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Richway. All Rights Reserved.
// create by dailiwei 2016-04-11 14:38
//图层相关的内容控制
///////////////////////////////////////////////////////////////////////////

define([
        "dojo/_base/lang",
        'base/map/layers/GoogleLayer',
        'base/map/layers/GoogleLocalLayer',
        'base/map/layers/TianDiTuLayer'
    ],
    function (
        lang,
        GoogleLayer,
        GoogleLocalLayer,
        TianDiTuLayer
    ) {
        var MapUtil = {};

        MapUtil.createLayer2 = function(map, maptype, layerConfig) {
            var layMap = {
                '2D_tiled': 'esri/layers/ArcGISTiledMapServiceLayer',
                '2D_dynamic': 'esri/layers/ArcGISDynamicMapServiceLayer',
                '2D_image': 'esri/layers/ArcGISImageServiceLayer',
                '2D_feature': 'esri/layers/FeatureLayer',
                '2D_rss': 'esri/layers/GeoRSSLayer',
                '2D_kml': 'esri/layers/KMLLayer',
                '2D_webTiled': 'esri/layers/WebTiledLayer',
                '2D_wms': 'esri/layers/WMSLayer',
                '2D_wmts': 'esri/layers/WMTSLayer',
                '2D_googlemap': 'GoogleLayer',
                '2D_googleimage': 'GoogleLayer',
                '2D_googletrain': 'GoogleLayer',
                '2D_googleabc': 'GoogleLayer',
                '2D_googlelocalmap': 'GoogleLocalLayer',
                '2D_googlelocalimage': 'GoogleLocalLayer',
                '2D_googlelocaltrain': 'GoogleLocalLayer',
                '2D_tianditumap': 'TianDiTuLayer',
                '2D_tiandituimage': 'TianDiTuLayer',
                '2D_tianditutrain': 'TianDiTuLayer',

                '3D_tiled': 'esri3d/layers/ArcGISTiledMapServiceLayer',
                '3D_dynamic': 'esri3d/layers/ArcGISDynamicMapServiceLayer',
                '3D_image': 'esri3d/layers/ArcGISImageServiceLayer',
                '3D_feature': 'esri3d/layers/FeatureLayer',
                '3D_elevation': 'esri3d/layers/ArcGISElevationServiceLayer',
                '3D_3dmodle': 'esri3d/layers/SceneLayer'
            };

            var layer;
            if (layerConfig.type == "googlemap" || layerConfig.type == "googleimage" || layerConfig.type == "googletrain" || layerConfig.type == "googleabc") {
                layer = new GoogleLayer();//
                layer.id = layerConfig.type;
                layer.type = layerConfig.type;
                layer.visible = layerConfig.visible;
                map.addLayer(layer);
                if (layerConfig.type == "googleimage") {
                    layer = new GoogleLayer();//
                    layer.id = layerConfig.type + "i";
                    layer.type = "googleimagei";
                    layer.visible = layerConfig.visible;
                    map.addLayer(layer);
                }
            }
            //离线地图
            else if (layerConfig.type == "googlelocalmap" || layerConfig.type == "googlelocalimage" || layerConfig.type == "googlelocaltrain") {
                layer = new GoogleLocalLayer(layerConfig.url);//
                layer.id = layerConfig.type;
                layer.type = layerConfig.type;
                layer.visible = layerConfig.visible;
                map.addLayer(layer);
                if (layerConfig.type == "googlelocalimage") {
                    layer = new GoogleLocalLayer(layerConfig.url);//
                    layer.id = "googlelocalimagei";
                    layer.type = "googlelocalimagei";
                    layer.visible = layerConfig.visible;
                    map.addLayer(layer);
                }
            }

            else if (layerConfig.type == "tianditumap" || layerConfig.type == "tiandituimage" || layerConfig.type == "tianditutrain") {
                layer = new TianDiTuLayer();//
                layer.id = layerConfig.type;
                layer.type = layerConfig.type;
                layer.visible = layerConfig.visible;
                map.addLayer(layer);
                if (layerConfig.type == "tianditumap") {
                    layer = new TianDiTuLayer();//
                    layer.id = "tianditumapi";
                    layer.type = "tianditumapi";
                    layer.visible = layerConfig.visible;
                    map.addLayer(layer);
                } else if (layerConfig.type == "tiandituimage") {
                    layer = new TianDiTuLayer();//
                    layer.id = "tiandituimagei";
                    layer.type = "tiandituimagei";
                    layer.visible = layerConfig.visible;
                    map.addLayer(layer);
                } else if (layerConfig.type == "tianditutrain") {
                    layer = new TianDiTuLayer();//
                    layer.id = "tianditutraini";
                    layer.type = "tianditutraini";
                    layer.visible = layerConfig.visible;
                    map.addLayer(layer);
                }
            }
            else {
                //以前的这个是
                require([layMap[maptype + '_' + layerConfig.type]], lang.hitch(this, function (layerClass) {
                    var infoTemplate, options = {},
                        keyProperties = ['label', 'url', 'type', 'icon', 'infoTemplate', 'isOperationalLayer'];
                    for (var p in layerConfig) {
                        if (keyProperties.indexOf(p) < 0) {
                            options[p] = layerConfig[p];
                        }
                    }

                    layer = new layerClass(layerConfig.url, options);

                    layer.isOperationalLayer = layerConfig.isOperationalLayer;
                    layer.label = layerConfig.label;
                    layer.icon = layerConfig.icon;
                    layer.id = layerConfig.label;
                    map.addLayer(layer);
                }));
            }
        };


        return MapUtil;
    });
