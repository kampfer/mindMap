/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('dom');
kampfer.require('events');

kampfer.provide('mindMap.Menu');
kampfer.provide('mindMap.MenuItem');

kampfer.mindMap.MenuItem = kampfer.mindMap.Component.extend({
	
	init : function(caption, command) {
		this._caption = caption;
		this._disabled = false;
		this._command = command;
	},

	getId : function() {
		return this._caption;
	},
	
	decorate : function() {
		kampfer.dom.addClass(this._element, 'menu-item');
		
		this._element.setAttribute('role', 'menuItem');
		
		this._element.id = this.getId();
		
		this._element.innerHTML = this._caption;
	},
		
	enterDocument : function() {
		this._super( this._parent.getBody() );
	},
	
	disable : function() {
		this._disabled = true;
		kampfer.dom.addClass(this._element, 'disabled');
		this._element.setAttribute('disabled', 'true');
	},
	
	enable : function() {
		this._disabled = false;
		kampfer.dom.removeClass(this._element, 'disabled');
		this._element.setAttribute('disabled', 'false');
	},
	
	isDisabled : function() {
		return this._disabled;
	},

	getCommand : function() {
		return this._command;
	},

	dispose : function() {
		this._command = null;
	}
	
});

kampfer.mindMap.Menu = kampfer.mindMap.Component.extend({
	
	init : function(view, model, controller) {
		this.monitorEvents();
	},
	
	createDom : function() {
		this._super();
		
		this._body = this._doc.createElement('div');
		this._element.appendChild(this._body);
	},
	
	decorate : function() {
		this._super();
		
		this.setVisible(this._element, false);
		this.setVisible(this._body, false);
		
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
		this.fireEvent('show');
	},
	
	hide : function() {
		this.setVisible(this._element, false);
		this.setVisible(this._body, false);
		this.fireEvent('hide');
	},
	
	setVisible : function(element, visible) {
		if(!element || !element.nodeType) {
			return;
		}
		
		var display = visible ? '' : 'none';
		element.style.display = display;
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
				this.fireEvent('clickitem', event);
				this.fireEvent(event.target.innerHTML, event);

				var command = this.getChild(event.target.id).getCommand();
				if( command && command.isAvailable() ) {
					command = new command(event, this.view, this.model);
					command.execute();
					command.push2Stack();
				}
			}
			if( event.target.getAttribute('disabled') !== 'true' ) {
				this.hide();
			}
		}
		
	},
	
	monitorEvents : function() {
		if(!this._element) {
			this.createDom();
		}
		
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