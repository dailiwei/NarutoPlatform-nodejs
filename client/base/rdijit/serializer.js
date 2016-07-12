define([],function(){
	var serializer = {};
	
	_isUndefined = function(m){
		return typeof m === "undefined";
	}
	_isArray = function(m){
		return Object.prototype.toString.call(m) === "[object Array]";
	}
	serializer.get = function(form){
		var mappings = form.rich_mapping;
		if(!mappings){
			mappings = _scan(form);
		}
		var model = {};
		console.log(mappings);
		for(var i = 0;i < mappings.length;i++){
			var mapping = mappings[i];
			if(mapping.type != "model")
				continue;
			var value = mapping.getter();
			if(value === false)continue;
			var propNames = mapping.exps.split(".");
			var tempObj = model;
			for(var j = 0, l = propNames.length;j < l;j++){
				var p = propNames[j];
				if(_isUndefined(tempObj[p])){
					if(j + 1 == l){
						tempObj[p] = mapping.input == "input-checkbox" ? [value] : value;
					}else{
						tempObj[p] = {};
					}
				}else{
					if(j + 1 == l){
						if(mapping.input == "input-checkbox"){
							tempObj[p].push(value);
						}else{
							tempObj[p] = value;
							console.log("warning: 重复的mapping[" + mapping.exps + "]");
						}
					}else if(_isArray(tempObj[p])){
						console.log("warning: 重复且互斥的mapping[" + mapping.exps + "]" + p);
					}
				}
				tempObj = tempObj[p];
			}
		}
		return model;
	}
	
	setter = {
		"attr": function(attr){
			return function(value){
				this.element[attr] = value;
			}
		},
		"text": function(){
			return function(value){
				this.element.innerHTML = value;
			}
		},
		"model": function(input){
			if(input == "input-checkbox"){
				return function(value){
					if(_isArray(value)){
						for(var i = 0,l = value.length;i < l;i++){
							if(value[i] == this.element.value){
								this.element.checked = true;
								return;
							}
						}
						this.element.checked = false;
					}else{
						this.element.checked = this.element.value == value;
					}
				}
			}else if(input == "input-radio"){
				return function(value){
					this.element.checked = this.element.value == value;
				}
			}else{
				return function(value){
					this.element.value = value;
				}
			}
		}
	}
	
	getter = function(input){
		if(input == "input-checkbox"){
			return function(){
				return this.element.checked ? this.element.value : false;
			}
		}else if(input == "input-radio"){
			return function(){
				return this.element.checked ? this.element.value : false;
			}
		}else{
			return function(){
				return this.element.value;
			}
		}
	}
	
	solveInputType = function(element){
		var tagName = element.tagName.toLowerCase();
		switch(tagName){
			case "select" : return "select";
			case "textarea" : return "textarea";
			case "input" : return "input-"+element.type;
			default: return "none";
		}
	}
	
	_scan = function(node, mappings){
		if(!mappings) mappings = [];
		if(node.hasChildNodes()){
			for(var i = 0, l = node.childNodes.length;i < l;i++){
				var child = node.childNodes[i];
				if(child.nodeType == 1 && child.hasAttributes()){
					for(var j = 0, al = child.attributes.length;j < al;j++){
						var attr = child.attributes[j];
						if(attr.name.indexOf("rich-") == 0){
							var mapping = {
								element: child, 
								_self: attr,
								exps: attr.value,
								type: attr.name.substring(5, attr.name.length).toLowerCase(),
								input: solveInputType(child)
							};
							
							if(mapping.type.indexOf("attr-") == 0){
								var attrName = mapping.type.substring(5, mapping.type.length);
								mapping.type = "attr";
								mapping.setter = setter[mapping.type](attrName);
							}else{
								mapping.setter = setter[mapping.type](mapping.input);
							}
							
							if(mapping.type == "model"){
								mapping.getter = getter(mapping.input);
							}
							
							if(!mapping.setter){
								console.log("warning: "+attr.name+" 设置错误");
							}
							mappings.push(mapping);
						}
						_scan(child, mappings);
					}
				}
			}
		}
		node.rich_mapping = mappings;
		return mappings;
	}
	
	serializer.set = function(form, model){
		var mappings = _scan(form);
		for(var i = 0;i < mappings.length;i++){
			var mapping = mappings[i];
			mapping.fun = eval("(function(m){return m."+mapping.exps+";})");
			var value = mapping.fun(model);
			mapping.setter(value);
		}
	}
	return serializer;
})