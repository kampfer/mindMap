kampfer.require('events.EventTarget');
kampfer.require('events');
kampfer.require('Menu');
kampfer.require('dom');

kampfer.provide('mindMap.Window');
kampfer.provide('mindMap.contextMenu');

kampfer.mindMap.contextMenu = new kampfer.Menu('context-menu');

kampfer.mindMap.Window = kampfer.events.EventTarget.extend({
    initializer : function(elem) {
        var type = kampfer.type(elem),
            that = this, scrollX, scrollY, x, y;

        if(type === 'string') {
            this._element = document.getElementById(elem);
        } else if(type === 'object') {
            this._element = elem;
        } else if(type === 'undefined') {
        }

        this.beDraged = false;
    
        kampfer.events.addListener(this._element, 'contextmenu', function(event) {
            kampfer.mindMap.contextMenu.setPosition(event.pageX + scrollX, event.pageY + scrollY);
            kampfer.mindMap.contextMenu.show();
            return false;
        });

        kampfer.events.addListener(this._element, 'click', function(event) {
            if(event.which === 1) {
                kampfer.mindMap.contextMenu.hide();
                return false;
            }
        });

        kampfer.events.addListener(this._element, 'mousedown', function(event) {
            if(!that.beDraged) {
                that.beDraged = true;

                scrollX = kampfer.dom.scrollLeft(that._element);
                scrollY = kampfer.dom.scrollTop(that._element);
                x = event.pageX;
                y = event.pageY;

                return false;
            }
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