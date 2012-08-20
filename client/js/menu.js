/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('dom');
kampfer.require('event');

kampfer.provide('mindMap.Menu');
kampfer.provide('mindMap.MenuItem');

//暂时不使用composition模式和command模式，在未来重构时再引入
kampfer.mindMap.MenuItem = kampfer.mindMap.Component.extend({
	
	init : function(content, fn) {
		this._content = content;
		this._fn = fn;
		this._disabled = false;
	},
	
	decorate : function() {
		var that = this;
		kampfer.dom.addClass(this._element, 'menu-item');
		if(this._disabled) {
			kampfer.dom.addClass(this._element, 'disable');
		}
		this._element.innerHTML = this._content;
		
		kampfer.event.addEvent(this._element, 'click', function() {
			if(!this._disabled) {
				if(that._fn) {
					that._fn();
				}
				that.getParent().hide();
			}
		});
	},
	
	enterDocument : function() {
		this._super( this._parent.getBody() );
	},
	
	disable : function() {
		this.disabled = true;
	},
	
	enable : function() {
		this.disabled = false;
	}
	
});

kampfer.mindMap.Menu = kampfer.mindMap.Component.extend({
	
	init : function() {
	},
	
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
	}
	
});