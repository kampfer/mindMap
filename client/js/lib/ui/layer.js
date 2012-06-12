/*global kampfer*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('ui.Layer');

kampfer.ui.Layer = kampfer.Class.extend({
	
	init : function(opts) {
		//this.left = 0;
		//this.top = 0;
		//this.rendered = false;
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
	
	createBg : function() {
		var div = this.bgDiv = kampfer.dom.create('div');
		kampfer.style.setStyle(div, 'display', 'none');
		kampfer.dom.addClass(div, this.opts.cssBg);
	},
	
	resizeBg : function() {
		var doc = kampfer.global.document;
		
		if(this.bgIframe) {
			this.bgIframe.style.display = 'none';
		}
		if(this.bgDiv) {
			this.bgDiv.style.display = 'none';
		}
		
		var w = Math.max(doc.body.scrollWidth, doc.documentElement.clientWidth),	
			h = Math.max(doc.body.scrollHeight, doc.documentElement.clientHeight);
		
		if(this.bgIframe) {
			this.bgIframe.width = w;
			this.bgIframe.height = h;
		}
		if(this.bgDiv) {
			this.bgDiv.style.width = w + 'px';
			this.bgDiv.style.height = h + 'px';
		}
	},
	
	destory : function() {
		var docBody = kampfer.global.document.body;
		docBody.removeChild(this.bgIframe);
		docBody.removeChild(this.bgDiv);
		docBody.removeChild(this.element);
		this.bgIframe = null;
		this.bgDiv = null;
		this.element = null;
	},
	
	render : function() {
		var docBody = kampfer.global.document.body;
		this.createDiv();
		this.createBgDiv();
		this.createBgIframe();
		docBody.appendChild(this.bgIframe);
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
		if(this.bgIframe) {
			this.bgIframe.style.display = '';
		}
		if(this.bgDiv) {
			this.bgDiv.style.display = '';
		}
		if(this.element) {
			this.element.style.display = '';
		}
		this.isVisible = true;
	},
	
	hide : function() {
		if(this.bgIframe) {
			this.bgIframe.style.display = 'none';
		}
		if(this.bgDiv) {
			this.bgDiv.style.display = 'none';
		}
		if(this.element) {
			this.element.style.display = 'none';
		}
		this.isVisible = false;
	}
	
});