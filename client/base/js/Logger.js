/**
 * 整体管理控制台输出的工具方法
 * 适合简单输出，如果输出比较复杂，需要带着方法名字，那建议使用JSconsole
 * http://www.cnblogs.com/see7di/archive/2011/11/21/2257442.html
 */
define([],function(){
	return {
		log:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.log(str);
				}
			}
		},
		debug:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.debug(str);
				}
			}
		},
		error:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.error(str);
				}
			}
		},
		warn:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.warn(str);
				}
			}
		},
		info:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.info(str);
				}
			}
		},
		time:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.time(str);
				}
			}
		},
		timeEnd:function(str){
			if (dojoConfig.isDebug == true) {
				if (str) {
					console.timeEnd(str);
				}
			}
		}
	}
});
