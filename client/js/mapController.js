/*global kampfer*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.Class.extend({
	
	init : function(currentMapManager) {
		
		this.currentMapManager = currentMapManager;
		
	},
	
	createMap : function() {
	
		if(!this.currentMap) {
			
			var nodes = this.currentMapManager.getNodes(),
				opts = this.currentMapManager.getOptions;
			
			this.currentMap = new kampfer.mindMap.Map(nodes, opts);
			
		}
		
	}
	
});
