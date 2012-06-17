/**
 * 用于检测浏览器的功能特性
 * @module support.js
 * @author l.w.kampfer@gmail.com
 */

kampfer.provide('browser.support');

(function(kamp) {
	
	var support = {
		deleteExpando : true
	};
	
	var div = document.createElement('div');
	
	try{
		delete div.test;
	} catch(e) {
		support.deleteExpando = false;
	}
	
	kamp.browser.support = support;
	
})(kampfer);