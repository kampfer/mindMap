/*global kampfer console*/

/*
 * map控制器类，控制map在浏览器的表现
 */
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.ui.Layer.extend({
	
	init : function(data, opts) {
		
		this._super(opts);
		
		this.currentState = this.initialState;
		
		this.left = 0;
		
		this.top = 0;

	},
	
	initialState : 'active',
	
	render : function() {
		
		var that = this;
		
		this._super();
		
		this.element.innerHTML = 'test';
		
		function bind(event) {
			that.handleEvent(event);
		}	
		
		kampfer.each(['mouseover', 'mouseout', 'mousedown', 'mouseup', 'mousemove', 'click'], function(index, type){
			kampfer.addEvent(that.element, type, bind);
		});
		
	},
	
	move : function(event) {
		var offset = {
			x : event.pageX - this.lastCursorPosition.x,
			y : event.pageY - this.lastCursorPosition.y
		};
		this.moveTo(this.left + offset.x, this.top + offset.y);
	},
	
	saveCursorPosition : function(event) {
		this.lastCursorPosition = {
			x : event.pageX,
			y : event.pageY
		};
	},
	
	handleEvent : function(event) {
		
		var action = this.actionFuns[this.currentState][event.type];
		
		if(!action) {
			action = this.unexpectedEvent;
		}
		
		var nextState = action.call(this, event);
		if(!this.actionFuns[nextState]){
			nextState = this.undefinedState(nextState);
		}
		this.currentState = nextState;
	},
	
	actionFuns : {
		
		active : {
			
			click : function() {
				return 'active';
			},
			
			mousedown : function(event) {
				this.saveCursorPosition(event);
				return 'capture';
			},
			
			mouseout : function() {
				return 'afk';
			}
			
		},
		
		capture : {
			
			mousemove : function(event) {
				this.move(event);
				return 'move';
			},
			
			mouseup : function() {
				return 'active';
			}
			
		},
		
		move : {
			
			mousemove : function(event) {
				this.move(event);
				return 'move';
			},
			
			mouseup : function(event) {
				this.left += event.pageX - this.lastCursorPosition.x;
				this.top += event.pageY - this.lastCursorPosition.y;
				return 'active';
			}
		
		},
		
		afk : {
			
			mouseover : function() {
				return 'active';
			}
			
		}
		
	},
	
	unexpectedEvent : function() {
		return 'active';
	},
	
	undefinedState : function() {
		return 'active';
	}
	
});