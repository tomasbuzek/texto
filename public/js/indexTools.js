function createNewDoc() {
	$.ajax({
	    type: "GET",
	    url: "http://" + window.location.host + "/document/create/",
	    success: function (msg) {
	    	if (msg.uri) { window.location.replace(msg.uri); }
	    },
		error: function (error) {
			alert(error);
		}
	});
}

function deleteDoc(id) {
	$.ajax({
	    type: "GET",
	    url: "http://" + window.location.host + "/document/" + id + "/delete/",
	    success: function (msg) {
	    	if (msg) { location.reload(); }
	    },
		error: function (error) {
			alert(error);
		}
	});
}

function addUser(id, newUser) {
	$.ajax({
	    type: "POST",
	    contentType: "application/json",
	    url: "http://" + window.location.host + "/document/" + id + "/adduser/",
	    data: JSON.stringify({newUser: newUser}),
	    success: function (msg) {
	    	if (msg) { location.reload(); }
	    },
		error: function (error) {
			alert(error);
		}
	});
}

function removeUser(id, removeUser) {
	$.ajax({
	    type: "POST",
	    contentType: "application/json",
	    url: "http://" + window.location.host + "/document/" + id + "/removeuser/",
	    data: JSON.stringify({removeUser: removeUser}),
	    success: function (msg) {
	    	if (msg) { location.reload(); }
	    },
		error: function (error) {
			alert(error);
		}
	});
}

function renameDoc(id, newName) {
	$.ajax({
	    type: "POST",
	    contentType: "application/json",
	    url: "http://" + window.location.host + "/document/" + id + "/rename/",
	    data: JSON.stringify({newName: newName}),
	    success: function (msg) {
	    	if (msg) { location.reload(); }
	    },
		error: function (error) {
			alert(error);
		}
	});
}