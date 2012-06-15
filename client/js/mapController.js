/*global kampfer*/

/*
 * map控制器类，控制map在浏览器的表现
 */
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.ui.Layer.extend({
	
	init : function(opts) {
		
		this._super(opts);
		
		this.currentState = this.initialState;

	},
	
	render : function() {},
	
	center : function() {
		this.move();
	},
	
	saveCursorPosition : function() {},
	
	initialState : 'active',
	
	handleEvent : function(event) {
		
	},
	
	actionTransitionFunctions : {
		
		active : {
			
			click : function() {},
			
			mousedown : function() {},
			
			mouseout : function() {}
			
		},
		
		capture : {
			
			mousemove : function() {},
			
			mouseup : function() {}
			
		},
		
		//TODO 与capture状态重复，删除。
		move : {
			
			mousemove : function() {},
			
			mouseup : function() {}
		
		},
		
		afk : {
			
			mouseover : function() {}
			
		}
		
	},
	
	unexpectedEvent : function() {}
	
});