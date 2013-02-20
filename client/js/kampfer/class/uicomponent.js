kampfer.require('Composition');

kampfer.provide('UIComponent');

kampfer.UIComponent = kampfer.Composition.extend({
    initializer : function() {},

    _element : null,

    _inDocument : false,

    isInDocument : function() {
        return this._inDocument;
    },

    setElement : function() {},

    getElement :  function() {},

    createDom : function() {},

    decorate : function() {},

    enterDocument : function() {},

    exitDocument : function() {},

    render : function() {},

    dispose : function() {}
});