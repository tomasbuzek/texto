function searchAce(skip) {
	var editor = ace.edit("editor");
	var text = document.getElementById('searchTextValue').value;
	editor.find(text, {backwards: false, skipCurrent: skip});
}

function changeSyntaxHighliting(value) {
	var editor = ace.edit("editor");
	if (value == "latex") { editor.getSession().setMode('ace/mode/latex'); }
	if (value == "java") { editor.getSession().setMode('ace/mode/java'); }
	if (value == "cpp") { editor.getSession().setMode('ace/mode/c_cpp'); }
}

function changeFontSize(increase) {
	var deltaValue = 2;
	var editor = ace.edit("editor");
	var fontSizeStr = document.getElementById('editor').style.fontSize;
	var fontSize = parseInt(fontSizeStr.substring(0, fontSizeStr.length-2));
	if (!fontSize) { fontSize = 12; }
	if (increase == true) {
		if (fontSize+deltaValue < 24) {
			document.getElementById('editor').style.fontSize = (fontSize+deltaValue) + "px";
		}
	} else {
		if (fontSize-deltaValue > 8) {
			document.getElementById('editor').style.fontSize = (fontSize-deltaValue) + "px";
		}
	}
	
}

function loadPDF() {
	var destUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + "/document/" + documentID + "/pdf";
	document.getElementById('viewer').src = "/pdf.viewer/viewer.html?file=" + destUrl;
}

function loadDoc() {
	window.onload = function() {
		var editor = ace.edit("editor");
		editor.setReadOnly(true);
		var addr = 'http://' + location.hostname + ':8000' + '/channel';
		var connection = new sharejs.Connection(addr);
		connection.openExisting(documentID, function(error, doc) {
			if (error) {
				console.log("Open document error:");
				console.log(error);
			} else {
				doc.attach_ace(editor);
				editor.setReadOnly(false);
				var syntaxSelect = document.getElementById('syntaxLanguage');
				changeSyntaxHighliting(syntaxSelect.options[syntaxSelect.selectedIndex].value);
				loadPDF();
			}
		});
	}
}

loadDoc();