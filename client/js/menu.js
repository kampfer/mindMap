/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('dom');
kampfer.require('events');

kampfer.provide('mindMap.Menu');
kampfer.provide('mindMap.MenuItem');

kampfer.mindMap.MenuItem = kampfer.mindMap.Component.extend({
	
	init : function(content) {
		this._content = content;
		this._disabled = false;
	},
	
	decorate : function() {
		kampfer.dom.addClass(this._element, 'menu-item');
		if(this._disabled) {
			kampfer.dom.addClass(this._element, 'disable');
		}
		
		this._element.setAttribute('role', 'menuItem');
		
		this._element.id = this.getId();
		
		this._element.innerHTML = this._content;
	},
		
	enterDocument : function() {
		this._super( this._parent.getBody() );
	},
	
	disable : function() {
		this._disabled = true;
	},
	
	enable : function() {
		this._disabled = false;
	},
	
	isDisabled : function() {
		return this._disabled;
	}
	
});

kampfer.mindMap.Menu = kampfer.mindMap.Component.extend({
	
	createDom : function() {
		this._super();
		
		this._body = this._doc.createElement('div');
		this._element.appendChild(this._body);
	},
	
	decorate : function() {
		this._super();
		
		this.setVisible(this._element, false);
		this.setBodyVisible(false);
		this.setLabelVisible(false);
		
		kampfer.dom.addClass(this._element, 'menu');
		kampfer.dom.addClass(this._body, 'menu-body');
	},
	
	getBody : function() {
		return this._body;
	},
	
	addItem : function(item) {
		this.addChild(item, true);
	},
	
	show : function() {
		this.setVisible(this._element, true);
		this.setVisible(this._body, true);
	},
	
	hide : function() {
		this.setVisible(this._element, false);
		this.setVisible(this._body, false);
	},
	
	setVisible : function(element, visible) {
		if(!element || !element.nodeType) {
			return;
		}
		
		var display = visible ? '' : 'none';
		element.style.display = display;
	},
	
	setBodyVisible : function(visible) {
		this.setVisible(this._body, visible);
	},
	
	setLabelVisible : function(visible) {
		this.setVisible(this._label, visible);
	},
	
	action2Function : {
		
		mouseover : function(event) {
			if( this.isMenuItem(event.target) ) {
				event.currentItem = event.target;
				this.fireEvent('initem', event);
			}
		},
		
		mouseout : function(event) {
			if( this.isMenuItem(event.target) ) {
				event.currentItem = event.target;
				this.fireEvent('outitem', event);
			}
		},
		
		click : function(event) {
			if( this.isMenuItem(event.target) ) {
				event.currentItem = event.target;
				this.fireEvent('clickitem', event);
			}
		}
		
	},
	
	monitorEvents : function() {
		kampfer.events.addEvent(this._element, 'mouseover mouseout click'.split(' '), 
			this._handleEvents, this);
	},
	
	_handleEvents : function(event) {
		var handler = this.action2Function[event.type];
		if(!handler) {
			handler = this.action2Function.unexceptedEvent;
		}
		handler.call(this, event);
	},
	
	isMenuItem : function(elem) {
		if( elem.getAttribute('role') === 'menuItem' ) {
			return true;
		}
		return false;
	}
	
});