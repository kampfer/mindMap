/*global kampfer*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');

kampfer.provide('ui.Layer');

kampfer.ui.Layer = kampfer.Class.extend({
	
	init : function(opts) {

		this.isVisible = false;
		
		this.isInDocument = false;
		
		kampfer.extend(this, kampfer.ui.Layer.defaultOptions, opts);
		
	},
	
	render : function() {
		this.createElement();
		this.enterDocument();
	},
	
	getDocument : function() {
		return kampfer.global.document;	
	},
	
	//创建dom元素
	//每次调用都会重新创建新的element
	createElement : function() {
		var div = this.element = kampfer.dom.create('div');
		kampfer.style.setStyle(div, 'display', 'none');
		kampfer.dom.addClass(div, this.cssName);
	},
	
	//将layer从document中移除
	exitDocument : function() {
		if(this.element && this.isInDocument) {
			this.parentNode.removeChild(this.element);
			this.isInDocument = false;
		}
	},
	
	//将layer添加到document
	enterDocument : function() {
		
		if(this.isInDocument) {
			return;
		}
		
		if(!this.element) {
			this.createElment();
		}
			
		this.parentNode.appendChild(this.element);
		this.isInDocument = true;
		
	},
	
	//重置layer的大小
	resize : function(w, h) {
		w = w + 'px';
		h = h + 'px';
		kampfer.style.setStyle(this.element, {
			width : w,
			height : h
		});
	},
	
	//移动layer
	moveTo : function(x, y) {
		x = x + 'px';
		y = y + 'px';
		kampfer.style.setStyle(this.element, {
			left : x,
			top : y
		});
	},
	
	//显示layer
	show : function() {
		
		if(!this.isInDocument){
			return;
		}
		
		if( kampfer.event.trigger(this, 'beforeshow') === false ) {
			return;
		}
		
		if(!this.isVisible && this.element) {
			kampfer.style.setStyle(this.element, 'display', '');
			this.isVisible = true;
		}
		
		kampfer.event.trigger(this, 'show');
	
	},
	
	//隐藏layer
	hide : function() {
		
		if(!this.isInDocument){
			return;
		}
		
		if( kampfer.event.trigger(this, 'beforehide') === false ) {
			return;
		}
		
		if(this.isVisible && this.element) {
			kampfer.style.setStyle(this.element, 'display', 'none');
			this.isVisible = false;
		}
		
		kampfer.event.trigger(this, 'hide');
		
	}
	
});

kampfer.ui.Layer.defaultOptions = {
	
	cssName : 'kampfer-layer',
	
	parentNode : kampfer.global.document.body
	
};