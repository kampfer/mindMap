/*global kampfer*/
kampfer.require('Class');

kampfer.provide('mindMap.MapManager');

kampfer.mindMap.MapManager = kampfer.Class.extend({
	
	init : function(data) {
		this.data = data;
	},
	
	getNode : function(id) {
		var node = this.data.nodes[id];
		if(node) {
			return node;
		}
	},
	
	getRootNode : function() {
		return this.getNode('root');
	},
	
	getChildren : function(id) {
		var node = this.data.nodes[id], 
			nodes = [];
		if(node && node.children.length > 0) {
			for(var i = 0, l = node.children.length; i < l; i++) {
				nodes.push( this.getNode(node.children[i]) );
			}
		}
		return nodes;
	},
	
	getOptions : function() {}
	
});
