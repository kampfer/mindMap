/*global kampfer*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('ui.Layer');

kampfer.ui.Layer = kampfer.Class.extend({
	
	init : function(opts) {

		this.isVisible = false;
		
		this.opts = kampfer.extend({}, {
			css : 'kampfer-layer',
			cssBg : 'kampfer-layer-bg'
		}, opts);
		
	},
	
	createContainer : function() {
		var div = this.element = kampfer.dom.create('div');
		kampfer.style.setStyle(div, 'display', 'none');
		kampfer.dom.addClass(div, this.opts.css);
	},
	
	destory : function() {
		var docBody = kampfer.global.document.body;
		docBody.removeChild(this.bgDiv);
		docBody.removeChild(this.element);
		this.bgDiv = null;
		this.element = null;
	},
	
	render : function() {
		var docBody = kampfer.global.document.body;
		this.createDiv();
		this.createBgDiv();
		this.createBgIframe();
		docBody.appendChild(this.bgDiv);
		docBody.appendChild(this.element);
		this.resizeBg();
		this.move();
	},
	
	move : function(x, y) {
		//fake data
		//TODO kampfer提供getSize方法
		var docElem = kampfer.global.document.documentElement,
			layerSize = {width:300,height:150};
		
		if(!x) {
			x = Math.max(docElem.scrollLeft + docElem.clientWidth / 2 - 
				layerSize.width / 2, 0);
		}
		if(!y) {
			y = Math.max(docElem.scrollTop + docElem.clientHeight / 2 - 
				layerSize.height / 2, 0);
		}
		
		this.element.style.left = x + 'px';
		this.element.style.top = y + 'px';
	},
	
	show : function() {
		
		if( !kampfer.event.trigger(this, 'beforeshow') ) {
			return;
		}
		
		if(this.element) {
			this.element.style.display = '';
		}
		this.isVisible = true;
		
		kampfer.event.trigger(this, 'show');
	
	},
	
	hide : function() {
		
		if( !kampfer.event.trigger(this, 'beforehide') ) {
			return;
		}
		
		if(this.element) {
			this.element.style.display = 'none';
		}
		this.isVisible = false;
		
		kampfer.event.trigger(this, 'hide');
		
	}
	
});