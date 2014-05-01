$(document).ready(function() {
	$("#splitterContainer").splitter({
		splitVertical : true,
		A : $('#leftPane'),
		B : $('#rightPane'),
		closeableto : 100
	});
});
/*
minAsize : 100,
maxAsize : 300,
*/
