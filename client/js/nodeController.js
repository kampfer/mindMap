/*global kampfer*/

/*
 * node控制器类，控制node在浏览器的表现
 */
kampfer.require('ui.Layer');

kampfer.provide('mindMap.NodeController');

kampfer.mindMap.NodeController = kampfer.ui.Layer.extend({
	
	init : function(data, opts) {
		
		this._super(opts);
		
	}
	
});