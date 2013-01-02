/*global kampfer console*/
kampfer.require('mindMap.Component');
kampfer.require('dom');
kampfer.require('events');

kampfer.provide('mindMap.Menu');
kampfer.provide('mindMap.MenuItem');

kampfer.mindMap.Menu = kampfer.mindMap.Component.extend({

	initializer : function(elemId) {
		var type = kampfer.type(elemId);

		if(type === 'string') {
			this._element = this._doc.getElementById(elemId);
		} else if(type === 'object') {
			this._element = elemId;
		} else if(type === 'undefined') {
		}

		this.hide();
	},

	disable : function(index) {
		if(typeof index === 'number') {
			kampfer.dom.addClass(this._element.children[index], 'disabled');
		}
	}

});