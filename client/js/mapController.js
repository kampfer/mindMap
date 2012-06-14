/*global kampfer*/

/*
 * map控制器类，控制map在浏览器的表现
 */
kampfer.require('dom');		
kampfer.require('ui.Layer');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.nodeController');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.ui.Layer.extend({
	
	init : function() {
		this._super();
	}
	
});