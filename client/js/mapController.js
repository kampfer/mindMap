/*global kampfer*/

/*
 * map控制器类，控制map在浏览器的表现
 */
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.nodeController');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.Class.extend({
	
	init : function(container) {
	 
		if(!container) {
			return;
		}

	},
	
	createDom : function() {
		var div = document.createElement('div');
	},
	
	render : function() {}
	
});