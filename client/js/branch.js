/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('mindMap.Branch');

kampfer.mindMap.Branch = kampfer.mindMap.Component.extend({
	
	init : function(node, controller, manager) {
		this.controller = controller;
		this.manager = manager;
		this.node = node;
		
		this._id = 'branch-' + this.node.getId();
	},
	
	createDom : function() {
		this._element = kampfer.global.document.createElement('canvas');
	},
	
	decorate : function() {
		this._super();
		
		var size = this.calculateSize(),
			position = this.calculatePosition();
			
		kampfer.style.setStyle(this._element, {
			left : position.left + 'px',
			top : position.top + 'px'
		});
		
		this._element.width = size.width;
		this._element.height = size.height;
		
		this._element.id = this.prefix + this.getParent().getId();
		
		this.drawLine();
	},
	
	calculateSize : function() {
		var offset = this.node.getOffset(),
			x = Math.abs(offset.left),
			y = Math.abs(offset.top);
		x = x <= 0 ? 10 : x;
		y = y <= 0 ? 10 : y;
		return {
			width : x,
			height : y
		};
	},
	
	calculatePosition : function() {
		var quadrant = this.node.getQuadrant(),
			offset = this.node.getOffset();
		
		switch(quadrant) {
			case 1 :
				return {
					left : -offset.left,
					top : 0
				};
			case 'topY' :
				return {
					left : -5,
					top : 0
				};
			case 2 :
				return {
					left : 0,
					top : 0
				};
			case 'leftX' : 
				return {
					left : 0,
					top : -5
				};
			case 3 : 
				return {
					left : 0,
					top : -offset.top
				};
			case 'bottomY' : 
				return {
					left : -5,
					top : -offset.top
				};
			case 4 : 
				return {
					left : -offset.left,
					top : -offset.top
				};
			case 'rightX' :
				return {
					left : -offset.left,
					top : -5
				};
			default :
				throw ('invalid quadrant!');
		}
	},
	
	drawLine : function() {
		var quadrant = this.node.getQuadrant(),
			ctx = this._element.getContext('2d');
		ctx.beginPath();
		if(quadrant === 1) {
			ctx.moveTo(0, ctx.canvas.height - 6);
			ctx.lineTo(6, ctx.canvas.height);
			ctx.lineTo(ctx.canvas.width, 0);
		}
		if(quadrant === 'topY') {
			ctx.moveTo(0, ctx.canvas.height);
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
			ctx.lineTo(ctx.canvas.width / 2, 0);
		}
		if(quadrant === 2) {
			ctx.moveTo(ctx.canvas.width, ctx.canvas.height - 6);
			ctx.lineTo(ctx.canvas.width - 6, ctx.canvas.height);
			ctx.lineTo(0, 0);
		}
		if(quadrant === 'leftX') {
			ctx.moveTo(ctx.canvas.width, 0);
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
			ctx.lineTo(0, ctx.canvas.height / 2);
		}
		if(quadrant === 3) {
			ctx.moveTo(ctx.canvas.width - 6, 0);
			ctx.lineTo(ctx.canvas.width, 6);
			ctx.lineTo(0, ctx.canvas.height);
		}
		if(quadrant === 'bottomY') {
			ctx.moveTo(0, 0);
			ctx.lineTo(ctx.canvas.width, 0);
			ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
		}
		if(quadrant === 4) {
			ctx.moveTo(6, 0);
			ctx.lineTo(0, 6);
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
		}
		if(quadrant === 'rightX') {
			ctx.moveTo(0, 0);
			ctx.lineTo(0, ctx.canvas.height);
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
		}
		ctx.fill();
	},
	
	prefix : 'canvas-'
	
});
