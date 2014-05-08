function searchAce(skip) {
	var editor = ace.edit("editor");
	var text = document.getElementById('searchTextValue').value;
	editor.find(text, {backwards: false, skipCurrent: skip});
}

function changeSyntaxHighliting(value) {
	var editor = ace.edit("editor");
	var index = 0;
	if (value == "plain") { editor.getSession().setMode('ace/mode/plain_text'); index = 0; }
	if (value == "latex") { editor.getSession().setMode('ace/mode/latex'); index = 1; }
	if (value == "java") { editor.getSession().setMode('ace/mode/java'); index = 2; }
	if (value == "cpp") { editor.getSession().setMode('ace/mode/c_cpp'); index = 3; }
	document.getElementById('syntaxLanguage').selectedIndex = index;
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

function drawLogRed(draw) {
	var logAreaElement = document.getElementById('logArea');
	if (draw) {
		logAreaElement.className = "logAreaError";
	} else {
		logAreaElement.className = "logAreaNormal";
	}
}

function showLog(show) {
	var logAreaElement = document.getElementById('logArea');
	var logAreaButton = document.getElementById('buttonShowLog');
	if (show == null) {
		show = logAreaElement.style.display == "none";
	}
	if (show) {
		logAreaElement.style.display = "block";
		logAreaButton.value = "Skrýt log";
	} else {
		logAreaElement.style.display = "none"
		logAreaButton.value = "Zobrazit log";
	}
}

function loadPDF() {
	var destUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + "/document/" + documentID + "/pdf";
	document.getElementById('viewer').src = "/pdf.viewer/viewer.html?file=" + destUrl;
	document.getElementById('createPDFButton').className = "pdfButtonEnabled";
	document.getElementById('createPDFButton').disabled = false;
}

function boldText(editor) {
	var editor = ace.edit("editor");
	var text = editor.session.getTextRange(editor.getSelectionRange());
	editor.insert('\\textbf{' + text + "}");
}

function italicText(editor) {
	var editor = ace.edit("editor");
	var text = editor.session.getTextRange(editor.getSelectionRange());
	editor.insert('\\textit{' + text + "}");
}

function underlineText(editor) {
	var editor = ace.edit("editor");
	var text = editor.session.getTextRange(editor.getSelectionRange());
	editor.insert('\\underline{' + text + "}");
}

function setEditorShortcuts(editor) {
	editor.commands.addCommand({
	    name: 'LaTeX - BOLD',
	    bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
	    exec: function(editor) {
	    	boldText();
	    },
	    readOnly: true
	});
	editor.commands.addCommand({
	    name: 'LaTeX - ITALIC',
	    bindKey: {win: 'Ctrl-I',  mac: 'Command-I'},
	    exec: function(editor) {
	    	italicText();
	    },
	    readOnly: true
	});
	editor.commands.addCommand({
	    name: 'LaTeX - UNDERLINE',
	    bindKey: {win: 'Ctrl-U',  mac: 'Command-U'},
	    exec: function(editor) {
	    	underlineText();
	    },
	    readOnly: true
	});
	editor.commands.addCommand({
	    name: 'LaTeX - PDF',
	    bindKey: {win: 'Ctrl-P',  mac: 'Command-P'},
	    exec: function(editor) {
	    	sendCreatePDFMessage();
	    },
	    readOnly: true
	});
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
				editor.setTheme("ace/theme/twilight");
				editor.setShowPrintMargin(false);
				editor.getSession().setUseWrapMode(true);
				var syntaxSelect = document.getElementById('syntaxLanguage');
				changeSyntaxHighliting("latex");
				showLog(false);
				setEditorShortcuts(editor);
				loadPDF();
			}
		});
	}
}

loadDoc();

var socket;
function initSocket() {
	var addr = window.location.protocol + "//" + window.location.hostname + ':8000';
	socket = io.connect(addr);
	socket.on('news', function (data) {
		console.log(data);
		socket.emit('documentID', { docID: documentID });
	});
	socket.on('pdfCreated', function(data) {
		if (data) {
			if (data.log != null) {
				document.getElementById('logArea').innerHTML = data.log.replace(/\n/g, "<br />");
			}
			if (data.error != null) {
				showLog(true);
				drawLogRed(true);
			} else {
				showLog(false);
				drawLogRed(false);
			}
			loadPDF();
		}
	});
	socket.on('numberOfViewersChange', function(data) {
		if (data) {
			if (data.viewers != null) {
				document.getElementById("statusBarViewers").innerHTML = "Počet uživatelů online: " + data.viewers;
			}
		}
	});
}

function sendCreatePDFMessage() {
	if (socket) {
		socket.emit('createPDF', { docID: documentID });
		document.getElementById('createPDFButton').className = "pdfButtonDisabled";
		document.getElementById('createPDFButton').disabled = true;
	}
}

initSocket();