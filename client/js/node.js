/*global kampfer console*/
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');
kampfer.require('mindMap.Branch');

kampfer.provide('mindMap.Node');

kampfer.mindMap.Node = kampfer.ui.Layer.extend({
	
	init : function(data, map) {
		
		this._super({
			cssName : 'node',
			parentNode : data.id === 'root' ? 
				map.element : 
				map.getNode(data.parent).element
		});
		
		this.data = data;
		
		this.id = data.id;
		this.content = data.content;
		this.offset = data.offset;
		
	},
	
	render : function() {
		this.createDom();
		this.setContent(this.content);
		this.moveTo(this.offset.x, this.offset.y);
		this.enterDocument();
		this.createBranch();
	},
	
	createDom : function() {
		this.createElement();
		this.decorateElement();
		this.createContentContainer();
	},
	
	createContentContainer : function() {
		if(!this.contentDiv) {
			var contentDiv = document.createElement('div');
			contentDiv.className = 'node-caption';
			contentDiv.id = 'node-caption-' + this.id;
			this.contentDiv = contentDiv;
		}
		this.element.appendChild(this.contentDiv);
	},
	
	createBranch : function() {
		if(this.id !== 'root' && !this.branch) {
			this.branch = new kampfer.mindMap.Branch(this);
			this.branch.render();
		}
	},
	
	decorateElement : function() {
		this.element.id = this.id;
		this.element.setAttribute('node-type', 'node');
	},
	
	setContent : function(text) {
		this.contentDiv.innerHTML = text;
	},
	
	getSize : function() {
		return {
			width : this.contentDiv.offsetWidth,
			height : this.contentDiv.offsetHeight
		};
	},
	
	getParentSize : function() {
		if(this.data.parent) {
			var parentNode = document.getElementById('node-caption-' + this.data.parent);
			return {
				width : parentNode.offsetWidth,
				height : parentNode.offsetHeight
			};
		}
	},
	
	move : function(x, y) {
		var currentPosition = this.data.offset;
		this.data.offset.x = x += currentPosition.x;
		this.data.offset.y = y += currentPosition.y;
		this.moveTo(x, y);
	}
	
});