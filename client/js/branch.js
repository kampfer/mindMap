/*global kampfer console*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('mindMap.Branch');

kampfer.mindMap.Branch = kampfer.Class.extend({
	
	init : function(parent) {
		
		this.parent = parent;
		
	},
	
	render : function() {
		if(!this.element) {
			this.createElement();
			this.decorateElement();
			this.drawLine();
		}
		this.parent.element.appendChild(this.element);
	},
	
	createElement : function() {
		this.element = kampfer.global.document.createElement('canvas');
	},
	
	decorateElement : function() {
		this.getSize();
		this.getPosition();
		kampfer.style.setStyle(this.element, {
			left : this.left + 'px',
			top : this.top + 'px'
		});
		this.element.width = this.width;
		this.element.height = this.height;
		this.element.id = this.prefix + this.parent.id;
	},
	
	getSize : function() {
		var parentCenterPosition = this.parent.getCenterPosition(),
			parentQuadrant = this.parent.getQuadrant(),
			grandparentSize = this.parent.getParentSize();

		this.width = Math.abs(parentCenterPosition.x - grandparentSize.width / 2);
		this.height = Math.abs(parentCenterPosition.y - grandparentSize.height / 2);
		
		if(this.width === 0 ) {
			this.width = 10;
		}
		
		if(this.height === 0 ) {
			this.height = 10;
		}
	},
	
	getPosition : function() {
		var x = this.parent.data.offset.x,
			y = this.parent.data.offset.y,
			quadrant = this.parent.getQuadrant();
		if(quadrant === 1) {
			this.left = -(this.width - this.parent.getSize().width / 2);
			this.top = this.parent.getSize().height / 2;
		}
		if(quadrant === 2) {
			this.left = this.parent.getSize().width / 2;
			this.top = this.parent.getSize().height / 2;
		}
		if(quadrant === 3) {
			this.left = this.parent.getSize().width / 2;
			this.top = -(this.height - this.parent.getSize().height / 2);
		}
		if(quadrant === 4) {
			this.left = -(this.width - this.parent.getSize().width / 2);
			this.top = -(this.height - this.parent.getSize().height / 2);
		}
	},
	
	drawLine : function() {
		var quadrant = this.parent.getQuadrant(),
			ctx = this.element.getContext('2d');
		ctx.beginPath();
		if(quadrant === 1) {
			ctx.moveTo(0, ctx.canvas.height - 6);
			ctx.lineTo(6, ctx.canvas.height);
			ctx.lineTo(ctx.canvas.width, 0);
		}
		if(quadrant === 2) {
			ctx.moveTo(ctx.canvas.width, ctx.canvas.height - 6);
			ctx.lineTo(ctx.canvas.width - 6, ctx.canvas.height);
			ctx.lineTo(0, 0);
		}
		if(quadrant === 3) {
			ctx.moveTo(ctx.canvas.width - 6, 0);
			ctx.lineTo(ctx.canvas.width, 6);
			ctx.lineTo(0, ctx.canvas.height);
		}
		if(quadrant === 4) {
			ctx.moveTo(6, 0);
			ctx.lineTo(0, 6);
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
		}
		ctx.fill();
	},
	
	prefix : 'canvas-'
	
});
