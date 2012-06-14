/*global kampfer*/
kampfer.provide('style');

kampfer.style.getComputedStyle = function(element, property) {
	var doc = kampfer.global.document;
	if(doc.defaultView && doc.defaultView.getComputedStyle) {
		var styles = doc.defaultView.getComputedStyle(element, null);
		if(styles) {
			// element.style[..] is undefined for browser specific styles
			// as 'filter'.
			return styles[property] || styles.getPropertyValue(property);
		}
	}
	return '';
};

//for IE
kampfer.style.getCascadedStyle = function(element, style) {
	return element.currentStyle ? element.currentStyle[style] : null;
};

kampfer.style.getStyle = function(element, style) {
	return kampfer.style.getComputedStyle(element, style) || 
		kampfer.style.getCascadedStyle(element, style) || 
		element.style[style];
};

//需要输入正确的javascript格式名
//TODO 处理样式名
kampfer.style.setStyle = function(element, name, value) {
	if( kampfer.isDefAndNotNull(value) && 
		kampfer.type(name) === 'string' ) {
		element.style[name] = value;
	} else if( kampfer.isObject(name) ) {
		for(var attr in name) {
			kampfer.style.setStyle(element, attr, name[attr]);
		}
	}
};
