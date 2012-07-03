/*global kampfer console*/
kampfer.require('style');
kampfer.require('event');
kampfer.require('mindMap.Component');
kampfer.require('mindMap.Branch');
kampfer.require('mindMap.caption');

kampfer.provide('mindMap.Node');

kampfer.mindMap.Node = kampfer.mindMap.Component.extend({
	
	init : function(data, controller, manager) {
		this.data = data;
		this.controller = controller;
		this.manager = manager;
		
		this._id = this.data.id;
		
		this.addCaption();
		this.addBranch();
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
			this.addChild( new kampfer.mindMap.Node(newchild, this.controller, this.manager) );
		}
	},
	
	getContent : function() {
		return this.data.content;
	},
	
	getOffset : function() {
		return this.data.offset;
	},
	
	getQuadrant : function() {
		var x = this.data.offset.x,
			y = this.data.offset.y;
		
		if(x > 0 && y < 0) {
			return 1;
		}
		if(x === 0 && y < 0) {
			return 'topY';
		}
		if(x < 0 && y < 0) {
			return 2;
		}
		if(x < 0 && Y === 0) {
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
		kampfer.style.addClass(this._element, 'node');
	}
	
});