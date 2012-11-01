/*global kampfer*/
kampfer.require('mindMap.Composition');
kampfer.require('style');

kampfer.provide('mindMap.Component');

kampfer.mindMap.Component = kampfer.mindMap.Composition.extend({
	
	_element : null,
	
	_doc : kampfer.global.document,
	
	_wasDecorated : false,
	
	_inDocument : false,
	
	addChild : function(child, render) {
		this._super(child);
		if(child._inDocument && this._inDocument) {
		//如果父子component都在文档流中，那么将子component剪切到父component
			this._element.appendChild( child.getElement() );
		} else if(render) {
		//如果需要渲染子component，那么先确保父component已经生成了dom对象
		//注意：这是个强制行为
			if(!this._element) {
				this.createDom();
			}
			child.render();
		} else if(!child._inDocument && this._inDocument) {
		//如果子component不在文档流中，而父component在。那么如果子component已生成了dom对象，
		//就将子component插入文档流
			if( child.getElement() ) {
				child.enterDocument();
			}
		}
	},
	
	removeChild : function(child, unrender) {
		child = this._super(child);
		if(unrender) {
			child.exitDocument();
			var childElement = child.getElement();
			if(child.childElement) {
				child.childElement.parentNode.removeChild(child.childElement);
			}
		}
	},
	
	isInDocument : function() {
		return this._inDocument;
	},
	
	wasDecorated : function() {
		return this._wasDecorated;
	},
	
	render : function() {
		if(!this._inDocument) {
			if(!this._element) {
				this.createDom();
			}
			
			this.enterDocument();
			
			this.decorate();
			
			this.eachChild(function(child) {
				child.render();
			});
		}
	},
	
	createDom : function() {
		this._element = this._doc.createElement('div');
	},
	
	getElement : function() {
		return this._element;
	},
	
	/* 子类应该重写这个方法 */
	decorate : function() {
		if(!this._inDocument) {
			throw ('component not in document');
		}
		
		this._wasDecorated = true;
	},
	
	enterDocument : function(parent) {
		this._inDocument = true;
		
		if(parent && parent.nodeType) {
			parent.appendChild(this._element);
		} else if( this._parent && this._parent.getElement() ) {
			this._parent.getElement().appendChild(this._element);
		} else {
			this._doc.body.appendChild(this._element);
		}
	},
	
	exitDocument : function() {
		//if( this._parent && this._parent.getElement() ) {
		//	this._parent.getElement().removeChild(this._element);
		//} else {
		//	this._doc.body.removeChild(this._element);
		//}
		this._element.parentNode.removeChild(this._element);

		this._inDocument = false;
	},
	
	getPosition : function() {
		if(this._element) {
			return {
				left : parseInt( kampfer.style.getStyle(this._element, 'left'), 10 ),
				top : parseInt( kampfer.style.getStyle(this._element, 'top'), 10 )
			};
		}
	},
	
	setPosition : function(left, top) {
		if(this._element) {
			//kampfer.style.setStyle(this._element, {
			//	left : left + 'px',
			//	top : top + 'px'
			//});
			this._element.style.left = left + 'px';
			this._element.style.top = top + 'px';
		}
	},
	
	getSize : function() {
		if(this._inDocument) {
			return {
				width : this._element.offsetWidth,
				height : this._element.offsetHeight
			};
		}
	}
	
});