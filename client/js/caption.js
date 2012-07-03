/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('mindMap.Caption');

kampfer.mindMap.Caption = kampfer.mindMap.Component.extend({
	
	init : function(node, controller, manager) {
		this.controller = controller;
		this.manager = manager;
		this.node = node;
		this._id = 'caption';
	},
	
	decorate : function() {
		this._element.className = 'node-caption';
		this._element.id = 'node-caption-' + this.node.getId();
		this.setContent( this.node.getContent() );
		this.fixPosition();
	},
	
	setContent : function(text) {
		this._element.innerHTML = text;
	},
	
	fixPosition : function() {
		var size = this.getSize();
		this.setPosition( -(size.width / 2), -(size.height / 2) );
	}
	
});