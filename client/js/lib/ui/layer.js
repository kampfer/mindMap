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
		
		kampfer.extend(true, this, kampfer.ui.Layer.defaultOptions, opts);
		
	},
	
	getDocument : function() {
		return kampfer.global.document;	
	},
	
	//创建dom元素
	createElement : function() {
		var div = this.element = kampfer.dom.create('div');
		kampfer.style.setStyle(div, 'display', 'none');
		kampfer.dom.addClass(div, this.cssName);
	},
	
	//将layer从document中移除
	exitDocument : function() {
		
		if(this.element && this.isInDocument) {
			this.getDocument().body
				.removeChild(this.element);
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
		
		this.getDocument().body
			.appendChild(this.element);
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
	//TODO 不传递参数，layer将移动到父元素的正中间
	move : function(x, y) {
		x = x + 'px';
		y = y + 'px';
		kampfer.style.setStyle(this.element, {
			left : x,
			top : y
		});
	},
	
	//显示layer
	show : function() {
		
		if( !kampfer.event.trigger(this, 'beforeshow') ) {
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
		
		if( !kampfer.event.trigger(this, 'beforehide') ) {
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
	
	cssName : 'kampfer-layer'
	
};