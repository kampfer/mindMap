/*global kampfer*/

/**
 * 为对象管理数据
 * @module data
 * https://github.com/jquery/jquery/blob/master/src/data.js
 */

kampfer.require('browser.support');

kampfer.provide('dataManager');
	
(function(kampfer) {
	
	function _isEmptyDataObj(obj) {
		for(var name in obj) {
			//检查用户定义的data（即cache.data）
			if( name === 'data' && kampfer.isEmptyObject(obj[name]) ) {
				continue;
			}
			if( name !== 'toJSON' ) {
				return false;
			}
		}
		return true;
	}

	kampfer.dataManager = {
		
		cache : {},
			
		cacheId  : 0,
		
		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData : {
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},
		
		isEmptyDataObj : function(obj) {
			for(var name in obj) {
				//检查用户定义的data（即cache.data）
				if( name === 'data' && kampfer.isEmptyObject(obj[name]) ) {
					continue;
				}
				if( name !== 'toJSON' ) {
					return false;
				}
			}
			return true;
		},
		
		//判断是否已经有储存数据
		hasData : function( elem ) {
			elem = elem.nodeType ? 
				kampfer.dataManager.cache[ elem[kampfer.expando] ] :
				elem[kampfer.expando];
			return !!elem && !_isEmptyDataObj(elem);
		},
		
		//判断是否能够储存数据
		acceptData : function( elem ) {
			// 判断DOM元素
			if( elem.nodeName ) {
				var match = kampfer.dataManager.noData[ elem.nodeName.toLowerCase() ];
				if( match ) {
					return !(match === true || elem.getAttribute('classid') !== match);
				}
			}
			return true;
		},
		
		//读取、储存数据
		//当对象还没有缓存过数据时，会创建并返回新的缓存对象。
		data : function( elem, name, value, inInternal ) {
			
			if( !kampfer.dataManager.acceptData( elem ) ) {
				return;
			}
			
			var expando = kampfer.expando,
				isNode = !!elem.nodeType,
				getByName = typeof name === 'string',
				cache = isNode ? kampfer.dataManager.cache : elem,
				cacheId = isNode ? elem[expando] : elem[expando] && expando,
				ret, thisCache;
			
			// 尝试读取未储存数据的DOM对象
			if( (!cacheId || !cache[cacheId]) && getByName && value === undefined ) {
				return;
			}
			
			if( !cacheId ) {
				if(isNode) {
					elem[expando] = cacheId = ++kampfer.dataManager.cacheId;
				}else{
					cacheId = kampfer.expando;
				}
			}
			
			if( !cache[cacheId] ) {
				cache[cacheId] = {};
				// Avoids exposing metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					cache[cacheId].toJSON = kampfer.emptyFn;
				}
			}
			
			thisCache = cache[cacheId];
			
			if( typeof name === 'object' ) {
				if( !inInternal ) {
					thisCache.data = kampfer.extend( thisCache.data, name );
				} else {
					thisCache = kampfer.extend( thisCache, name );
				}
			}
			
			// 用户调用data方法时，数据存储在thisCache.data中
			// 避免用户定义的数据与kampfer内部定义的数据冲突
			if( !inInternal ) {
				if( !thisCache.data ) {
					thisCache.data = {};
				}
				thisCache = thisCache.data;
			}
			
			//@TODO 对name进行处理（camelCase）
			if( value !== undefined ) {
				thisCache[name] = value;
			}
			
			//@TODO 对name进行处理（camelCase）
			if( getByName ) {
				ret = thisCache[name];
			} else {
				ret = thisCache;
			}
			
			return ret;
			
		},
		
		removeData : function( elem, name, inInternal ) {
			
			if( !kampfer.dataManager.acceptData( elem ) ) {
				return;
			}
			
			var expando = kampfer.expando,
				isNode = !!elem.nodeType,
				cacheId = isNode ? elem[expando] : elem[expando] && expando,
				cache = isNode ? kampfer.dataManager.cache : elem,
				thisCache;
				
			if( !cache[cacheId] ) {
				return;
			}
			
			if( name ) {
				thisCache = inInternal ? cache[cacheId] : cache[cacheId].data;
				if( thisCache ) {
					if( !kampfer.isArray(name) ) {
						if( name in thisCache ) {
							name = [name];
						}
					}
					for( var i = 0, l = name.length; i < l; i++ ) {
						delete thisCache[name[i]];
					}
					if( !_isEmptyDataObj( thisCache ) ) {
						return;
					}
				}
			}
			
			if( !inInternal ) {
				delete cache[cacheId].data;
				if( !_isEmptyDataObj( cache[cacheId] ) ) {
					return;
				}
			}
			
			// Browsers that fail expando deletion also refuse to delete expandos on
			// the window, but it will allow it on all other JS objects; other browsers
			// don't care
			if ( kampfer.browser.support.deleteExpando || !cache.setInterval ) {
				delete cache[cacheId];
			} else {
				cache[cacheId] = null;
			}
			
			if(isNode) {
				// IE does not allow us to delete expando properties from nodes,
				// nor does it have a removeAttribute function on Document nodes;
				// we must handle all of these cases
				if ( kampfer.browser.support.deleteExpando ) {
					delete elem[ expando ];
				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( expando );
				} else {
					elem[ expando ] = null;
				}
			}
			
		},
		
		_data : function( elem, name, value ) {
			return kampfer.dataManager.data( elem, name, value, true );
		},
		
		_removeData : function( elem, name ) {
			return kampfer.dataManager.removeData( elem, name, true );
		}
		
	};

})(kampfer);