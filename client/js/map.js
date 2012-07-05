/*global kampfer console*/
kampfer.require('event');
kampfer.require('mindMap.Component');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.mindMap.Component.extend({
	
	init : function(controller, manager) {
		this.controller = controller;
		this.manager = manager;
		
		this.addRootNode();
	},
	
	addRootNode : function() {
		var rootNode = this.manager.getRootNode();
		
		rootNode = new kampfer.mindMap.Node(rootNode, this.controller, this.manager);
		
		this.addChild(rootNode);
	},
	
	decorate : function() {
		this._element.id = 'map';
	},
	
	getNode : function(id) {
		var node;
		
		this.eachChild(function(child) {
			if(child.getId() === id) {
				node = child;
				return false;
			}else {
				child.eachChild(arguments.callee);
			}
		});

		return node;
	}
	
});