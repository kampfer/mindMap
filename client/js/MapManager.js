/*global kampfer*/
kampfer.require('Class');
kampfer.require('store');

kampfer.provide('mindMap.MapManager');

/*
 * MapManager类为mindmap提供数据支持。
 * 注意:1.MapManager依赖的第三方组件store.js依赖JSON，当浏览器不原生支持JSON时，
 * 		需要额外引入JSON.js实现兼容。
 *		2.MapManager提供的查询方法返回的都是对数据的引用，因此它们都是只读的，绝对不要直接
 * 		对它们进行写操作。
 */

kampfer.mindMap.MapManager = kampfer.Class.extend({
	
	/**
	 * 实例化一个MapManager对象。
	 * 当传递给构建函数的参数是一个对象，那么这个对象被用作mindmap数据来源，
	 * 如果传递的参数是一个字符串，那么会以字符串作为name，创建一个新的数据对象，
	 * 如果以上两种情况都不符合，将使用模板对象
	 * @param	name{string|object|null}
	 */
	init : function(data) {
		var type = kampfer.type(data), name;
		if( type !== 'object' ) {
			if( type === 'string' ) {
				name = data;
			}
			//data = kampfer.extend(true, {}, this.mapTemplate);
			data = {
				nodes : {
					map : {
						id : 'map',
						children : null
					}
				},
				name : {}
			};
			if( name ) {
				data.name = name;
			}
		}
		this._mapName = data.name;
		this._mapData = data;
	},
	
	mapTemplate : {
		nodes : {
			root : {
				id : 'root',
				parent : '',
				children : [],
				content : 'root',
				offset : {
					x : '1000',
					y : '1000'
				},
				style : 'root'
			}
		},
		name : 'template',
		config : {}
	},
	
	_mapName : null,
	
	_mapData : null,
	
	_left : null,
	
	_top: null,
	
	getMapData : function() {
		return this._mapData;
	},
	
	dataToJSON : function() {
		return JSON.stringify(this._mapData);
	},
	
	getMapName : function() {
		return this._mapName;
	},
	
	getNode : function(id) {
		return this._mapData.nodes[id];
	},
	
	getChildren : function(id) {
		var node = this._mapData.nodes[id], 
			nodes = [];
		if(node && node.children && node.children.length > 0) {
			for(var i = 0, l = node.children.length; i < l; i++) {
				nodes.push( this.getNode(node.children[i]) );
			}
		}
		return nodes;
	},
	
	addNode : function(node) {
		if( kampfer.type(node) === 'object' ) {
			var pid = node.parent,
				id = node.id;
			if(id) {
				this._mapData.nodes[id] = node;
			}
			if(pid && this._mapData.nodes[pid]) {
				if(!this._mapData.nodes[pid].children) {
					this._mapData.nodes[pid].children = [];
				}
				this._mapData.nodes[pid].children.push(id);
			}
		}
	},
	
	createNode : function(data) {
		var node = {
			id : null,
			parent : null,
			children : null,
			content : 'node',
			offset : {
				x : 100,
				y : 100
			},
			style : null
		}, type = kampfer.type(data);
		if( type === 'object' ) {
			for(var attr in node) {
				if(attr in data) {
					if(attr === 'offset') {
						node[attr].x = data[attr].x;
						node[attr].y = data[attr].y;
					} else {
						node[attr] = data[attr];
					}
				}
			}
		} else if( type === 'string' ) {
			node.parent = data;
		}
		if(!node.id) {
			node.id = this.generateUniqueId();
		}
		return node;
	},
	
	deleteNode : function(id) {
		var node = this._mapData.nodes[id],
			parent = this._mapData.nodes[node.parent],
			i, l;
		if(node && node.children) {
			for(i = 0, l = node.children.length; i < l; i++) {
				this.deleteNode(node.children[i]);
			}
		}
		delete this._mapData.nodes[id];
		if(parent && parent.children) {
			for(i = 0, l = parent.children.length; i < l; i++) {
				if(parent.children[i] === id) {
					parent.children.splice(i, 1);
				}
			}
		}
	},
	
	setNodeContent : function(id, text) {
		this._mapData.nodes[id].content = text;
	},
	
	setNodePosition : function(id, x, y) {
		if(kampfer.type(id) === 'object') {
			id = id.id;
		}
		this._mapData.nodes[id].offset.x = x;
		this._mapData.nodes[id].offset.y = y;
	},
	
	renameMap : function(name) {
		this._mapName = name;
		this._mapData.name = name;
	},
	
	setMapPosition : function(left, top) {
		this._left = left;
		this._top = top;
	},
	
	getMapPosition : function() {
		return {
			left : this._left,
			top : this._top
		};
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
	
	dispose : function() {
		this._mapData = null;
	}
	
});
