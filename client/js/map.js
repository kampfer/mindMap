/*global kampfer console*/
kampfer.require('events');
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
		var winSize = this.getWindowRect();
		
		this._element.id = 'map';
		kampfer.dom.addClass(this._element, 'map');
		kampfer.style.setStyle(this._element, {
			width : '2000px',
			height : '2000px',
			left : winSize.width / 2 - 1000 + 'px',
			top : winSize.height / 2 - 1000 + 'px'
		});
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
	},
	
	getWindowRect : function() {
		return {
			width : Math.max(document.documentElement.clientWidth,
				document.documentElement.clientWidth),
			height : Math.max(document.documentElement.clientHeight,
				document.documentElement.clientHeight)
		};
	},
	
	move : function(x, y) {
		var oriPosition = this.getPosition();
		
		x += oriPosition.left;
		y += oriPosition.top;
			
		this.setPosition(x, y);
	}
	
});