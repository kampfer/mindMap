/*global kampfer*/
kampfer.require('Class');
kampfer.require('store');

kampfer.provide('mindMap.MapsManager');

/*
 * 负责维护localStorage
 * MapsManager提供的查询方法返回的都是对数据的引用，因此它们都是只读的。
 * 绝对不要直接对它们进行写操作。
 */

kampfer.mindMap.MapsManager = kampfer.Class.extend({

	init : function(mapName, appName) {
		if(mapName) {
			this._curMapName = mapName;
		}
		if(appName) {	
			this._appName = appName;
		}
	},
	
	_appName : 'mindMap',
	
	//正在使用的mindMap的名字。通过名字可以更快的查找数据。
	_curMapName : null,
	
	getAppName : function() {
		return this._appName;
	},
	
	setCurMapName : function(name) {
		this._curMapName = name;
	},
	
	getCurMapName : function() {
		return this._curMapName;
	},
	
	//从localStorage中读取mindMap保存的数据。
	//如果没有任何数据，那么就创建一个新的空的数据对象，并将它写入 localStorage。
	getMapStorage : function() {
		var mapStore = kampfer.store.get(this._appName);
		if(!mapStore) {
			mapStore = {};
			mapStore.maps = {};
			mapStore.maps._count = 0;
			kampfer.store.set(this._appName, mapStore);
		}
		return mapStore;
	},
	
	getMapData : function(name) {
		var mapStore = this.getMapStorage();
		if(name) {
			return mapStore.maps[name];
		}
	},
	
	getCurMap : function() {
		if(this._curMapName) {
			return this.getMapData(this._curMapName);
		}
	},
	
	//只接受object作为参数
	saveMapToLocalStorage : function(data) {
		if( kampfer.type(data) === 'object' ) {
			var mapStorage = this.getMapStorage(),
				name = data.name;
			if( !(name in mapStorage.maps) ) {
				mapStorage.maps._count++;
			}
			mapStorage.maps[name] = data;
			kampfer.store.set(this._appName, mapStorage);
		}
	},
	
	getMapCount : function() {
		var mapStorage = this.getMapStorage();
		return mapStorage.maps._count;
	}

});