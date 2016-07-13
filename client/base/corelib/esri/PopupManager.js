// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.16/esri/copyright.txt for details.
//>>built
define("esri/PopupManager","./geometry/Extent ./geometry/ScreenPoint ./kernel ./layerUtils ./tasks/query dijit/registry dojo/_base/array dojo/_base/declare dojo/_base/Deferred dojo/_base/lang dojo/has dojo/on dojo/promise/all dojo/Stateful require".split(" "),function(E,x,F,D,G,H,f,t,v,w,I,J,K,L,M){var y;t=t(L,{declaredClass:"esri.PopupManager",enabled:!1,map:null,_mapClickHandle:null,_featureLayersCache:{},constructor:function(a){this._mapClickHandler=w.hitch(this,this._mapClickHandler)},setMap:function(a){if(this.map)if(a!==
this.map)this.unsetMap();else return;this.map=a;this._setupClickHandler()},unsetMap:function(){this.map&&(this.map=null);this._mapClickHandle&&(this._mapClickHandle.remove(),this._mapClickHandle=null)},getMapLayer:function(a){var c;if(a&&(c=a.getLayer()))if(a=c.id,this._featureLayersCache[a]){var b=a.lastIndexOf("_");-1<b&&(a=a.substring(0,b),c=this.map.getLayer(a))}return c},_enabledSetter:function(a){this.enabled=a;this._setupClickHandler()},_setupClickHandler:function(){this._mapClickHandle&&(this._mapClickHandle.remove(),
this._mapClickHandle=null);this.enabled&&this.map&&(this._mapClickHandle=this.map.on("click",this._mapClickHandler))},_mapClickHandler:function(a){var c=this.map.infoWindow,b=a.graphic;c&&this.map.loaded&&(c.clearFeatures&&c.setFeatures?this._showPopup(a):b&&b.getInfoTemplate()&&this._showInfoWindow(b,a.mapPoint))},_showPopup:function(a){var c=this.map,b=c.infoWindow,d=this,n=[],g=[c.graphics].concat(f.map(c.graphicsLayerIds,c.getLayer,c));f.forEach(g,function(a){a&&(a.loaded&&a.infoTemplate&&!a.suspended)&&
n.push(a)});var p=[];f.forEach(c.layerIds,function(a){(a=c.getLayer(a))&&(a.loaded&&!a.suspended)&&(d._isImageServiceLayer(a)&&a.infoTemplate?n.push(a):("esri.layers.ArcGISDynamicMapServiceLayer"===a.declaredClass||"esri.layers.ArcGISTiledMapServiceLayer"===a.declaredClass)&&a.infoTemplates&&p.push(a))});this._getSubLayerFeatureLayers(p).then(function(g){n=n.concat(g);g=null;a.graphic&&(a.graphic.getInfoTemplate()&&!d._isImageServiceLayer(a.graphic._layer))&&(g=a.graphic);if(n.length||g){var k=d._calculateClickTolerance(n),
s=a.screenPoint,e=c.toMap(new x(s.x-k,s.y+k)),k=c.toMap(new x(s.x+k,s.y-k)),l=new E(e.x,e.y,k.x,k.y,c.spatialReference);if(l=l.intersects(c.extent)){var m=new G,q=!!g,p=!0,e=f.map(n,function(b){var e;m.timeExtent=b.useMapTime?c.timeExtent:null;if(d._isImageServiceLayer(b))m.geometry=a.mapPoint,p=!1,e=b.queryVisibleRasters(m,{rasterAttributeTableFieldPrefix:"Raster.",returnDomainValues:!0}),e.addCallback(function(){var a=b.getVisibleRasters();q=q||0<a.length;return a});else if(d._featureLayersCache[b.id]||
"function"===typeof b.queryFeatures&&(0===b.currentMode||1===b.currentMode))m.geometry=l,e=b.queryFeatures(m),e.addCallback(function(a){a=a.features;q=q||0<a.length;return a});else{e=new v;var g=f.filter(b.graphics,function(a){return a&&a.visible&&l.intersects(a.geometry)});q=q||0<g.length;e.resolve(g)}return e});g&&(k=new v,k.resolve([g]),e.unshift(k));!f.some(e,function(a){return!a.isFulfilled()})&&!q?(b.hide(),b.clearFeatures()):(b.setFeatures(e),b.show(a.mapPoint,{closestFirst:p}))}}})},_getSubLayerFeatureLayers:function(a,
c){var b=c||new v,d=[],n=a.length,g=Math.floor(this.map.extent.getWidth()/this.map.width),p=this.map.getScale(),t=!1,k=this,s=0;a:for(;s<n;s++){var e=a[s],l=e.dynamicLayerInfos||e.layerInfos;if(l){var m=null;if(e._params&&(e._params.layers||e._params.dynamicLayers))m=e.visibleLayers;for(var m=D._getVisibleLayers(l,m),q=D._getLayersForScale(p,l),x=l.length,A=0;A<x;A++){var z=l[A],r=z.id,u=e.infoTemplates[r];if(!z.subLayerIds&&u&&u.infoTemplate&&-1<f.indexOf(m,r)&&-1<f.indexOf(q,r)){if(!y){t=!0;break a}var B=
e.id+"_"+r,h=this._featureLayersCache[B];if(!h||!h.loadError)h||((h=u.layerUrl)||(h=z.source?this._getLayerUrl(e.url,"/dynamicLayer"):this._getLayerUrl(e.url,r)),h=new y(h,{id:B,drawMode:!1,mode:y.MODE_SELECTION,outFields:this._getOutFields(u.infoTemplate),resourceInfo:u.resourceInfo,source:z.source}),this._featureLayersCache[B]=h),h.setDefinitionExpression(e.layerDefinitions&&e.layerDefinitions[r]),h.setGDBVersion(e.gdbVersion),h.setInfoTemplate(u.infoTemplate),h.setMaxAllowableOffset(g),h.setUseMapTime(!!e.useMapTime),
e.layerDrawingOptions&&(e.layerDrawingOptions[r]&&e.layerDrawingOptions[r].renderer)&&h.setRenderer(e.layerDrawingOptions[r].renderer),d.push(h)}}}}if(t){var w=new v;M(["./layers/FeatureLayer"],function(a){y=a;w.resolve()});w.then(function(){k._getSubLayerFeatureLayers(a,b)})}else{var C=[];f.forEach(d,function(a){if(!a.loaded){var b=new v;J.once(a,"load, error",function(){b.resolve()});C.push(b.promise)}});C.length?K(C).then(function(){d=f.filter(d,function(a){return!a.loadError&&a.isVisibleAtScale(p)});
b.resolve(d)}):(d=f.filter(d,function(a){return a.isVisibleAtScale(p)}),b.resolve(d))}return b.promise},_getLayerUrl:function(a,c){var b=a.indexOf("?");return-1===b?a+"/"+c:a.substring(0,b)+"/"+c+a.substring(b)},_getOutFields:function(a){var c;a.info&&"esri.dijit.PopupTemplate"===a.declaredClass?(c=[],f.forEach(a.info.fieldInfos,function(a){var d=a.fieldName&&a.fieldName.toLowerCase();d&&("shape"!==d&&0!==d.indexOf("relationships/"))&&c.push(a.fieldName)})):c=["*"];return c},_calculateClickTolerance:function(a){var c=
6,b,d;f.forEach(a,function(a){if(b=a.renderer)"esri.renderer.SimpleRenderer"===b.declaredClass?((d=b.symbol)&&d.xoffset&&(c=Math.max(c,Math.abs(d.xoffset))),d&&d.yoffset&&(c=Math.max(c,Math.abs(d.yoffset)))):("esri.renderer.UniqueValueRenderer"===b.declaredClass||"esri.renderer.ClassBreaksRenderer"===b.declaredClass)&&f.forEach(b.infos,function(a){(d=a.symbol)&&d.xoffset&&(c=Math.max(c,Math.abs(d.xoffset)));d&&d.yoffset&&(c=Math.max(c,Math.abs(d.yoffset)))})});return c},_showInfoWindow:function(a,
c){var b=this.map.infoWindow,d=a.geometry,d=d&&"point"===d.type?d:c,f=a.getContent();b.setTitle(a.getTitle());if(f&&w.isString(f.id)){var g=H.byId(f.id);g&&(g.set&&/_PopupRenderer/.test(g.declaredClass))&&g.set("showTitle",!1)}b.setContent(f);b.show(d)},_isImageServiceLayer:function(a){return"esri.layers.ArcGISImageServiceLayer"===a.declaredClass||"esri.layers.ArcGISImageServiceVectorLayer"===a.declaredClass}});I("extend-esri")&&(F.PopupManager=t);return t});