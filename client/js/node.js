/*global kampfer console*/
kampfer.require('events');
kampfer.require('dom');
kampfer.require('Component');
kampfer.require('mindMap.Branch');
kampfer.require('mindMap.Caption');

kampfer.provide('mindMap.Node');

//TODO node should take care of its position itself
kampfer.mindMap.Node = kampfer.Component.extend({
	
	initializer : function(data, manager) {
		this.data = data;
		this.manager = manager;
		
		this._id = this.data.id;
		this.offsetX = data.offset.x;
		this.offsetY = data.offset.y;
		
		this.addCaption();
		if(this.data.parent && this.data.parent !== 'map') {
			this.addBranch();
		}
	},
	
	addCaption : function() {
		var caption = new kampfer.mindMap.Caption(this, this.manager);
		this.addChild(caption);
	},
	
	addBranch : function() {
		var branch = new kampfer.mindMap.Branch(this, this.manager);
		this.addChild(branch);
	},
	
	getBranch : function() {
		return this.getChild('branch-' + this._id);
	},
	
	getCaption : function() {
		return this.getChild('caption-' + this._id);
	},
	
	getQuadrant : function() {
		var x = this.offsetX,
			y = this.offsetY;
		
		if(x > 0 && y < 0) {
			return 1;
		}
		if(x === 0 && y < 0) {
			return 'topY';
		}
		if(x < 0 && y < 0) {
			return 2;
		}
		if(x < 0 && y === 0) {
			return 'leftX';
		}
		if(x < 0 && y > 0) {
			return 3;
		}
		if(x === 0 && y > 0) {
			return 'bottomY';
		}
		if(x > 0 && y > 0) {
			return 4;
		}
		if(x > 0 && y === 0) {
			return 'rightX';
		}
	},
	
	/* 拓展此方法 */
	decorate : function() {
		this._super();
		
		this._element.id = this._id;
		kampfer.dom.addClass(this._element, 'node');
		this._element.setAttribute('node-type', 'node');
		
		kampfer.style.setStyle(this._element, {
			left : this.data.offset.x + 'px',
			top : this.data.offset.y + 'px'
		});
	},
	
	move : function(x, y) {
		var oriPosition = this.getPosition();
		
		x += oriPosition.left;
		y += oriPosition.top;
		
		this.moveTo(x, y);
	},
	
	moveTo : function(x, y) {
		var rect = this.getCaption().getSize();

		this.offsetX = x;
		this.offsetY = y;

		//只有顶级结点才判断边界,那么其他结能够被移出到map外
		//似乎在现有的树形结构下没法在所有结点移动时判断边界, 那么这里的判断略显多余
		if( this.data.parent === 'map' ) {
			if(x < rect.width / 2) {
				x = rect.width / 2;
			} else if(x > 2000 - rect.width / 2) {
				x = 2000 - rect.width / 2;
			}
			if(y < rect.height / 2) {
				y = rect.height / 2;
			} else if(y > 2000 - rect.height / 2) {
				y = 2000 - rect.height / 2;
			}
		}
	
		this.setPosition(x, y);
		//如果是node就同步更新branch视图
		if(this.data.parent && this.data.parent !== 'map') {
			this.getBranch().decorate();
		}
	}
	
});