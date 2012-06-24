/*global kampfer console*/
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.ui.Layer.extend({
	
	init : function(controller, manager) {
		
		this._super({
			cssName : 'map',
			parentNode : document.getElementById('container')
		});
		
		this.controller = controller;
		this.manager = manager;
		this.nodes = {};
	
	},
	
	render : function() {
		this._super();
		this.createNodes();
		this.listenController();
	},
	
	createNodes : function() {
		if(this.element) {
			var nodes = this.manager.getAllNodes();
			for(var id in nodes) {
				this.nodes[id] = new kampfer.mindMap.Node(nodes[id], this);
				this.nodes[id].render();
				this.nodes[id].show();
			}
		}
	},
	
	getMapPosition : function() {
		var x = parseInt( kampfer.style.getStyle(this.element, 'left'), 10 ),
			y = parseInt( kampfer.style.getStyle(this.element, 'top'), 10 );
		return {x:x,y:y};
	},
	
	move : function(x, y) {
		var currentPosition = this.getMapPosition();
		x += currentPosition.x;
		y += currentPosition.y;
		this.moveTo(x, y);
	},
	
	getNode : function(id) {
		return this.nodes[id];
	},
	
	listenController : function() {
		var that = this;
	
		function handler(offset) {
			that.move(offset.x, offset.y);
		}
		
		kampfer.addEvent(this.controller, 'moveMap', handler);
	}
	
});