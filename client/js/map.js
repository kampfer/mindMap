/*global kampfer console*/
kampfer.require('events');
kampfer.require('mindMap.Component');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Map');


kampfer.mindMap.Map = kampfer.mindMap.Component.extend({
	
	init : function(manager) {
		this.manager = manager;
		this.currentNode = this;

		this.addChildren();
	},
	
	getId : function() {
		return 'map';
	},
	
	decorate : function() {
		var winSize = this.getWindowRect();
		
		this._element.id = 'map';
		this._element.setAttribute('node-type', 'map');
		kampfer.dom.addClass(this._element, 'map');
		kampfer.style.setStyle(this._element, {
			width : '2000px',
			height : '2000px',
			left : winSize.width / 2 - 1000 + 'px',
			top : winSize.height / 2 - 1000 + 'px'
		});
		//this.manager.setMapPosition(winSize.width / 2 - 1000, winSize.height / 2 - 1000);
	},
	
	getNode : function(id) {
		var node;
		
		this.eachChild(function(child, cid) {
			if(cid === id) {
				node = child;
				return false;
			}else {
				child.eachChild(arguments.callee);
			}
		});

		return node;
	},
	
	getWindowRect : function() {
		return {
			width : Math.max(document.documentElement.clientWidth,
				document.documentElement.clientWidth),
			height : Math.max(document.documentElement.clientHeight,
				document.documentElement.clientHeight)
		};
	},
	
	moveTo : function(x, y) {
		//var startTime = +new Date();
		var winSize = this.getWindowRect();

		if(x > 0) {
			x = 0;
		} else if(x < winSize.width - 2000) {
			x = winSize.width - 2000;
		}
		if(y > 0) {
			y = 0;
		} else if(y < winSize.height - 2000) {
			y = winSize.height - 2000;
		}
			
		this.setPosition(x, y);
		//console.log(+new Date() - startTime);
	},

	addChildren : function() {
		var children = this.manager.getChildren( this.getId() );
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			this.addChild( new kampfer.mindMap.Node(child, this.manager) );
		}
	},
	
});