/*global kampfer*/
kampfer.require('Class');

kampfer.provide('mindMap.MapManager');

kampfer.mindMap.MapManager = kampfer.Class.extend({
	
	init : function(data) {
		this.data = data;
	},
	
	getAllNodes : function() {
		return this.data.nodes;
	},
	
	getOptions : function() {}
	
});
