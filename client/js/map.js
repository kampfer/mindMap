/*global kampfer console*/
kampfer.require('events');
kampfer.require('dom');
kampfer.require('Component');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Map');


kampfer.mindMap.Map = kampfer.Component.extend({
	
	initializer : function() {
		this._id = 'map';
	},
	
	decorate : function() {
		var winSize = this.getWindowRect();
		
		this._element.id = 'map';
		this._element.setAttribute('node-type', 'map');
		kampfer.dom.addClass(this._element, 'map');
		kampfer.dom.setStyle(this._element, {
			width : '2000px',
			height : '2000px',
			left : winSize.width / 2 - 1000 + 'px',
			top : winSize.height / 2 - 1000 + 'px'
		});
		//this.manager.setMapPosition(winSize.width / 2 - 1000, winSize.height / 2 - 1000);
	},
	
	getWindowRect : function() {
		return {
			width : Math.max(document.documentElement.clientWidth,
				document.documentElement.clientWidth),
			height : Math.max(document.documentElement.clientHeight,
				document.documentElement.clientHeight)
		};
	},

	addChildren : function() {
		var children = this.manager.getChildren( this.getId() );
		if(children) {
			for(var i = 0, l = children.length; i < l; i++) {
				var child = children[i];
				this.addChild( new kampfer.mindMap.Node(child, this.manager) );
			}
		}
	}
	
});