/*global kampfer*/
kampfer.provide('string');

(function(kampfer) {
	
	var trim = String.prototype.trim,
		trimLeft = /^\s+/,
		trimRight = /\s+$/;

	kampfer.string.trim = trim ? 
		//native method
		function(string) {
			return kampfer.isDefAndNotNull(string) ? 
				trim.call(String) : 
				'';
		} : 
		//my method
		function(string) {
			return kampfer.isDefAndNotNull(string) ? 
				string.toString().replace(trimLeft, '').replace(trimRight, '') :
				'';
		};
	
})(kampfer);
