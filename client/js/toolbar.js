kampfer.require('Component');
kampfer.require('events');
kampfer.require('Menu');

kampfer.provide('mindMap.ToolBar');

//TODO 构造器使用与menu相同的逻辑
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

	addMenu : function(menu, trigger) {
		this.addChild( new kampfer.Menu(menu, trigger), true );
	}
});