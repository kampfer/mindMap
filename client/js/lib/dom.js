/*global kampfer*/
kampfer.require('string');

kampfer.provide('dom');

kampfer.dom.addClass = function(elem, value) {
		
	var classNames, i, l,
		setClass, c, cl;

	if ( value && typeof value === "string" ) {
		classNames = value.split( /\s+/ );

		if ( elem.nodeType === 1 ) {
			if ( !elem.className && classNames.length === 1 ) {
				elem.className = value;

			} else {
				setClass = " " + elem.className + " ";

				for ( c = 0, cl = classNames.length; c < cl; c++ ) {
					if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
						setClass += classNames[ c ] + " ";
					}
				}
				elem.className = kampfer.trim( setClass );
			}
		}
	}
	
};


kampfer.dom.removeClass = function(elem, value) {
	
	var classNames, i, l, className, c, cl;
	
	if ( (value && typeof value === "string") || value === undefined ) {
		classNames = ( value || "" ).split( /\s+/ );
	
		if ( elem.nodeType === 1 && elem.className ) {
			if ( value ) {
				className = (" " + elem.className + " ").replace( /[\n\t\r]/g, " " );
				for ( c = 0, cl = classNames.length; c < cl; c++ ) {
					className = className.replace(" " + classNames[ c ] + " ", " ");
				}
				elem.className = kampfer.trim( className );

			} else {
				elem.className = "";
			}
		}
	}
};