/*global kampfer console*/
kampfer.require('Class');
kampfer.require('style');

kampfer.provide('mindMap.Component');

kampfer.mindMap.Component = kampfer.Class.extend({
	
	init : function() {},
	
	//父component
	_parent : null,
	
	//hash
	_children : null,
	
	_id : null,
	
	_element : null,
	
	_doc : kampfer.global.document,
	
	_wasDecorated : false,
	
	_inDocument : false,
	
	setId : function(id) {
		if(this._parent && this._parent._children) {
			delete this._parent._children[this._id];
			this._parent.addChild(id, this);
		}
		
		this._id = id;
	},
	
	getId : function() {
		return this._id ? this._id : 
			( this._id = this.generateUniqueId() );
	},
	
	/*
	 * 生成唯一id
	 * 直接使用时间戳不可行
	 * 以下方法摘自http://www.cnblogs.com/NoRoad/archive/2010/03/12/1684759.html
	 */
	generateUniqueId : function() {
		var guid = "";
		for(var i = 1; i <= 32; i++) {
			var n = Math.floor(Math.random() * 16.0).toString(16);
			guid += n;
			if((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
				guid += "-";
			}
		}
		return guid;
	},
	
	setParent : function(parent) {
		if(this._parent || parent === this) {
			return;
		}
		this._parent = parent;
	},
	
	//第三方不应该直接访问parent，而应该使用此方法
	getParent : function() {
		return this._parent;
	},
	
	addChild : function(child, render) {
		var id = child.getId();
	
		if(!this._children) {
			this._children = {};
		}
		
		if(!this._children[id]) {
			this._children[id] = child;
		}else{
			throw('can not add child');
		}
		
		child.setParent(this);
		
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
		if(child) {
			var id = kampfer.type(child) === 'string' ? child : child.getId();
			delete this._children[id];
			
			if(unrender) {
				child.exitDocument();
				var childElement = child.getElement();
				if(child.childElement) {
					child.childElement.parentNode.removeChild(child.childElement);
				}
			}
			
			child.setParent(null);
		}
		
		return child;
	},
	
	//composition只负责子component
	getChild : function(id) {
		if(this._children) {
			return this._children[id];
		}
	},
	
	//TODO kampfer提供迭代对象的方法
	eachChild : function(fn, context) {
		if(this._children) {
			for(var id in this._children) {
				if( fn.call(context, this._children[id], id) === false ) {
					return;
				}
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
			kampfer.style.setStyle(this._element, {
				left : left + 'px',
				top : top + 'px'
			});
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