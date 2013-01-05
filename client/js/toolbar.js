kampfer.require('Component');
kampfer.require('events');
kampfer.require('Menu');

kampfer.provide('mindMap.ToolBar');

kampfer.mindMap.ToolBar = kampfer.Component.extend({
	initializer : function(id) {
		var type = kampfer.type(id),
            that = this;

        if(type === 'string') {
            this._element = this._doc.getElementById(id);
            this._id = id;

            if(!this._element) {
                this.render();
            }
        } else {
            return;
        }
	},

	addMenu : function(id, render) {
		var menuId = id + '-menu';
		this.addChild( new kampfer.Menu(menuId), render );

		var menu = this.getMenu(id);
		kampfer.events.addListener(document.getElementById(id),
			'mouseover', menu.show, menu);

		kampfer.events.addListener(document.getElementById(id),
			'mouseout', menu.hide, menu);
	},

	getMenu : function(id) {
		return this.getChild( id + '-menu');
	}
});