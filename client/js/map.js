/*global kampfer*/

/*
 * 管理map数据
 */
kampfer.require('Class');
kampfer.require('JSON');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.Class.extend({
	
	init : function(json) {
		if(json) {
			this.parseJSON(json);
		} else {
			this.data = kampfer.mindMap.Map.getDefaultMap();
		}
		this.nodes = this.data.nodes;
	},
	
	parseJSON : function(json) {
		if(json) {
			var data = kampfer.JSON.parse(json);
			this.data = data;
			return this.data;
		}
	},
	
	nextUniqueId : 0,
	
	getUniqueId : function() {
		return this.nextUniqueId++;
	},
	
	getNode : function(id) {
		return this.nodes[id];
	},
	
	addNode : function(data) {
		var id = this.getUniqueId;
		data.id = id;
		this.nodes[id] = data;
	},
	
	removeNode : function(id) {
		delete this.nodes[id];
	},
	
	setNodeContent : function(id, content) {
		
	},
	
	setNodePosition : function(id, position) {
		
	},
	
	save : function() {},
	
	destory : function() {}
	
});

kampfer.mindMap.Map.getDefaultMap = function() {
	return {
		nodes : {
			root : {
				children : [],
				content : '根节点'
			}
		}
	};
};
