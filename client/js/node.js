/*global kampfer console*/
kampfer.require('style');
kampfer.require('event');
kampfer.require('dom');
kampfer.require('mindMap.Component');
kampfer.require('mindMap.Branch');
kampfer.require('mindMap.Caption');

kampfer.provide('mindMap.Node');

kampfer.mindMap.Node = kampfer.mindMap.Component.extend({
	
	init : function(data, controller, manager) {
		this.data = data;
		this.controller = controller;
		this.manager = manager;
		
		this._id = this.data.id;
		this.offsetX = data.offset.x;
		this.offsetY = data.offset.y;
		
		this.addCaption();
		if(this._id !== 'root') {
			this.addBranch();
		}
		this.addChildren();
	},
	
	addCaption : function() {
		var caption = new kampfer.mindMap.Caption(this, this.controller, this.manager);
		this.addChild(caption);
	},
	
	addBranch : function() {
		var branch = new kampfer.mindMap.Branch(this, this.controller, this.manager);
		this.addChild(branch);
	},
	
	addChildren : function() {
		var children = this.manager.getChildren(this.data.id);
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			this.addChild( new kampfer.mindMap.Node(child, this.controller, this.manager) );
		}
	},
	
	removeChild : function(child) {
		this._super(child, true);
	},
	
	getContent : function() {
		return this.data.content;
	},
	
	getOffset : function() {
		return this.getPosition();
	},
	
	getBoundingClientRect : function() {
		return this._element.getBoundingClientRect();
	},
	
	getBranch : function() {
		return this.getChild('branch-' + this._id);
	},
	
	getCaption : function() {
		return this.getChild('caption-' + this._id);
	},
	
	getQuadrant : function() {
		var x = this.offsetX,
			y = this.offsetY;
		
		if(x > 0 && y < 0) {
			return 1;
		}
		if(x === 0 && y < 0) {
			return 'topY';
		}
		if(x < 0 && y < 0) {
			return 2;
		}
		if(x < 0 && y === 0) {
			return 'leftX';
		}
		if(x < 0 && y > 0) {
			return 3;
		}
		if(x === 0 && y > 0) {
			return 'bottomY';
		}
		if(x > 0 && y > 0) {
			return 4;
		}
		if(x > 0 && y === 0) {
			return 'rightX';
		}
	},
	
	/* 拓展此方法 */
	decorate : function() {
		this._super();
		
		this._element.id = this._id;
		kampfer.dom.addClass(this._element, 'node');
		this._element.setAttribute('node-type', 'node');
		
		kampfer.style.setStyle(this._element, {
			left : this.data.offset.x + 'px',
			top : this.data.offset.y + 'px'
		});
	},
	
	move : function(x, y) {
		var oriPosition = this.getPosition();
		
		x += oriPosition.left;
		y += oriPosition.top;
		
		this.moveTo(x, y);
	},
	
	moveTo : function(x, y) {
		this.offsetX = x;
		this.offsetY = y;
	
		this.setPosition(x, y);
		if(this._id !== 'root') {
			this.getBranch().decorate();
		}
	}
	
});