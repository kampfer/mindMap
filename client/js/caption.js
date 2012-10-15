/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('style');
kampfer.require('events');

kampfer.provide('mindMap.Caption');

kampfer.mindMap.Caption = kampfer.mindMap.Component.extend({
	
	init : function(node) {
		//this.controller = controller;
		//this.manager = manager;
		this.node = node;
		this._id = this.prefix + this.node.getId();
	},
	
	decorate : function() {
		this._super();
		
		this._element.className = 'node-caption';
		this._element.id = this.prefix + this.node.getId();
		this._element.setAttribute('node-type', 'caption');
		this.setContent( this.node.getContent() );
		this.fixPosition();
	},
	
	setContent : function(text) {
		this._element.innerHTML = text;
	},
	
	getContent : function() {
		return this._element.innerHTML;
	},
	
	fixPosition : function() {
		var size = this.getSize();
		this.setPosition( -(size.width / 2), -(size.height / 2) );
	},
	
	insertTextarea : function() {
		var value = this.getContent();
		this._textarea = this._doc.createElement('textarea');
		this._textarea.value = value;
		this._textarea.id = 'node-editor';
		this._textarea.setAttribute('node-type', 'editor');
		this._textarea.className = 'node-editor';
		this._element.innerHTML = '';
		this._element.appendChild(this._textarea);
	},
	
	insertText : function() {
		//textarea存在且在文档中
		if(this._textarea && this._textarea.parentNode) {
			var text = this._textarea.value;
			this._textarea.parentNode.removeChild(this._textarea);
			this._element.innerHTML = text;
			this.fixPosition();
			return text;
		}
	},
	
	prefix : 'caption-'
	
});