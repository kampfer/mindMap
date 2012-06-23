/*global kampfer console*/
//kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.ui.Layer.extend({
	
	init : function(controller, manager) {
		
		this._super({
			cssName : 'map',
			parentNode : document.getElementById('map-container')
		});
		
		this.controller = controller;
		
		this.manager = manager;
	
	},
	
	render : function() {
		this._super();
		this.listenController();
	},
	
	getMapPosition : function() {
		var x = parseInt( kampfer.style.getStyle(this.element, 'left'), 10 ),
			y = parseInt( kampfer.style.getStyle(this.element, 'top'), 10 );
		return {x:x,y:y};
	},
	
	listenController : function() {
		var that = this;
	
		function handler(offset) {
			var x, y, currentPosition;
			
			currentPosition = that.getMapPosition();
			x = currentPosition.x + offset.x;
			y = currentPosition.y + offset.y;
			
			that.moveTo(x, y);
		}
		
		kampfer.addEvent(this.controller, 'moveNode', handler);
	}
	
});