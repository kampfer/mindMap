kampfer.require('Component');
kampfer.require('events');
kampfer.require('Menu');
kampfer.require('dom');

kampfer.provide('mindMap.Window');
kampfer.provide('mindMap.contextMenu');

kampfer.mindMap.contextMenu = new kampfer.Menu( document.getElementById('context-menu') );

//TODO 构造器使用与menu相同的逻辑
kampfer.mindMap.Window = kampfer.Component.extend({
    initializer : function(id) {
        var type = kampfer.type(id),
            that = this, scrollX, scrollY, x, y;

        if(type === 'string') {
            this._element = this._doc.getElementById(id);
            this._id = id;

            if(!this._element) {
                this.render();
            }
        } else {
            return;
        }

        this.beDraged = false;

        kampfer.events.addListener(this._element, 'mousedown', function(event) {
            kampfer.mindMap.contextMenu.hide();

            scrollX = kampfer.dom.scrollLeft(that._element);
            scrollY = kampfer.dom.scrollTop(that._element);
            x = event.pageX;
            y = event.pageY;

            if(event.which === 1) {
                //不存在map或已经开始拖拽不执行处理逻辑
                if( !that.beDraged && that.getChild('map') ) {
                    that.beDraged = true;
                }
            }
        });

        kampfer.events.addListener(this._element, 'contextmenu', function(event) {
            kampfer.mindMap.contextMenu.setPosition(event.pageX + scrollX, event.pageY + scrollY);
            kampfer.mindMap.contextMenu.show();
            return false;
        });

        kampfer.events.addListener(this._element, 'mouseup', function(event) {
            if(that.beDraged) {
                that.beDraged = false;
                return false;
            }
        });

        kampfer.events.addListener(this._element, 'mousemove', function(event) {
            if(that.beDraged) {
                that.scrollLeft(scrollX + x - event.pageX);
                that.scrollTop(scrollY + y - event.pageY);

                return false;
            }
        });
    },

    scrollLeft : function(offset) {
        kampfer.dom.scrollLeft(this._element, offset);
    },

    scrollTop : function(offset) {
        kampfer.dom.scrollTop(this._element, offset);
    },

    beDraged : null,

    dispose : function() {
        kampfer.mindMap.Window.superClass.dispose.apply(this);
        this._element = null;
        kampfer.events.removeListener(this._element);
    }
});