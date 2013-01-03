/*global kampfer console*/
kampfer.require('Component');
kampfer.require('dom');
kampfer.require('events');

kampfer.provide('Menu');
kampfer.provide('MenuItem');

kampfer.Menu = kampfer.Component.extend({

	initializer : function(elemId) {
		var type = kampfer.type(elemId);

		if(type === 'string') {
			this._element = this._doc.getElementById(elemId);
		} else if(type === 'object') {
			this._element = elemId;
		} else if(type === 'undefined') {
		}

		kampfer.events.addListener(this._element, 'click', function(event) {
			var command = event.target.getAttribute('command');
			if( command && !(/disabled/.test(event.target.parentNode.className)) ) {
				this.hide();
				this.dispatch(command);
				console.log(command);
				event.preventDefault();
			}
		}, this);
	},

	disable : function(index) {
		if(typeof index === 'number') {
			kampfer.dom.addClass(this._element.children[index], 'disabled');
		}
	},

	enable : function(index) {
		if(typeof index === 'number') {
			kampfper.dom.removeClass(this._element.children[index], 'disabled');
		}
	},

	dispose : function() {
		kampfer.mindMap.Menu.superClass.dispose.apply(this, arguments);
		kampfer.events.removeListener(this._element);
	}

});