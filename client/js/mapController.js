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
		
		this.map = null;
		
		this.nodes = [];
		
	},
	
	render : function() {
		
		if(!this.map) {
			this.map = new kampfer.mindMap.Map(this.currentMapManager);
			this.map.render();
		}
		
		if(!this.nodes.length) {
			var nodes = this.currentMapManager.getNodes();
			kampfer.each(nodes, function(id, node){
				this.nodes[id] = new kampfer.mindMap.Node(node);
				this.nodes[id].render();
			});
		}
		
		this.monitorEvents();
		
	},
	
	addNode : function(parent) {
		
		var newNode = this.currentMapManager.addNode(parent);
		this.nodes[newNode.id] = new kampfer.mindMap.Node(newNode);
		
		newNode.render();
		
		kampfer.event.trigger(this, 'addNode');
		
	},
	
	removeNode : function(id) {
		
		this.currentMapManager.removeNode(id);
		this.nodes[id].dispose();
		delete this.nodes[id];
		
		kampfer.event.trigger(this, 'removeNode');
		
	},
	
	
	setNodeText : function(id, text) {
		
		this.currentMapManager.setNodeText(id, text);
		this.nodes[id].setText(text);
		
		kampfer.event.trigger(this, 'setNodeText');
		
	},
	
	monitorEvents : function() {
		
		var that = this;
		
		function handleEvent(event) {
			var controller = that;
			var func = controller.action2Function[controller.currentState][event.type];
			controller.currentState = func.call(func);
		}
		
		kampfer.addEvent(this.map.element, '*', handleEvent);
		
	}
	
});
