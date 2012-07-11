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
	},
	
	decorate : function() {
		kampfer.dom.addClass(this._element, 'menu-item');
		this._element.innerHTML = this._content;
		
		kampfer.event.addEvent(this._element, 'click', this._fn);
	},
	
	enterDocument : function() {
		this._super( this._parent.getBody() );
	}
	
});

kampfer.mindMap.Menu = kampfer.mindMap.Component.extend({
	
	init : function() {
	},
	
	createDom : function() {
		this._super();
		
		this._label = this._doc.createElement('div');
		this._element.appendChild(this._label);
		
		this._body = this._doc.createElement('div');
		this._element.appendChild(this._body);
	},
	
	decorate : function() {
		this._super();
		
		this.setVisible(this._element, false);
		this.setBodyVisible(false);
		this.setLabelVisible(false);
		
		kampfer.dom.addClass(this._element, 'menu');
		kampfer.dom.addClass(this._label, 'menu-label');
		kampfer.dom.addClass(this._body, 'menu-body');
	},
	
	render : function() {
		this._super();
		
		var that = this;
		kampfer.event.addEvent(this._label, 'click', function(){
			that.setVisible(that._body, true);
		});
	},
	
	getBody : function() {
		return this._body;
	},
	
	getLabel : function() {
		return this._label;
	},
	
	addItem : function(item) {
		this.addChild(item, true);
	},
	
	show : function() {
		this.setVisible(this._element, true);
		this.setVisible(this._label, true);
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


