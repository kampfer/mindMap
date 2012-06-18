/*global kampfer console*/
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');
kampfer.provide('mindMap.Node');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.ui.Layer.extend({
	
	init : function(opts) {
		
		this._super(opts);
	
	}
	
});