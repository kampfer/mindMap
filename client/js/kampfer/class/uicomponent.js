kampfer.require('Composition');

kampfer.provide('UIComponent');

kampfer.UIComponent = kampfer.Composition.extend({
    _element : null,

    _inDocument : false,

    isInDocument : function() {
        return this._inDocument;
    },

    setElement : function() {
        this._element = element;
    },

    getElement :  function() {
        return this._element;
    },

    createDom : function() {
        this._element = document.createElement('div');
        return this._element;
    },

    decorate : function() {},

    enterDocument : function() {
        this._inDocument = true;
        this.walk('enterDocument');
    },

    exitDocument : function() {
        this._inDocument = true;
        this.walk('exitDocument');
    },

    render : function(parentElement, beforeNode) {
        if(this._inDocument) {
            return;
        }

        if(!this._element) {
            this.createDom();
        }

        if(parentElement) {
            parentElement.insertBefore(this._element, beforeNode || null);
        } else {
            document.body.appendChild(this._element);
        }

        // If this component has a parent component that isn't in the document yet,
        // we don't call enterDocument() here.  Instead, when the parent component
        // enters the document, the enterDocument() call will propagate to its
        // children, including this one.  If the component doesn't have a parent
        // or if the parent is already in the document, we call enterDocument().
        if( !this._parent || this._parent.isInDocument() ) {
            this.enterDocument();
        }
    },

    addChild : function(child, render) {
        this.addChildAt(child, this.getChildCount(), render);
    },

    addChildAt : function(child, index, render) {
        kampfer.UIComponent.superClass.addChildAt.call(this, child, index);

        if( child._inDocument && this._inDocument && child.getParent() === this ) {
            var parentElement = this.getElement();
            parentElement.insertBefore( child.getElement(),
                (parentElement.childNodes[index] || null) );
        } else if(render) {
            if (!this._element) {
                this.createDom();
            }
            var sibling = this.getChildAt(index + 1);
            child.render_(this.getElement(), sibling ? sibling._element : null);
        }
    },

    removeChild : function(child, unrender) {
        kampfer.UIComponent.superClass.removeChild.call(this, child);

        if(unrender) {
            child.exitDocument();
            if( child._element ) {
                child._element.parentNode.removeChild(child._element);
            }
        }
    },

    removeChildAt : function(index, unrender) {
        this.remochild( this.getChildAt(index), unrender );
    },

    dispose : function() {
        kampfer.UIComponent.superClass.dispose.call(this);
        delete this._element;
    }
});