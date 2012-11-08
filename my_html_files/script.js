function getParameter(l_sName)
{
	var l_oMatch = window.location.search.match(new RegExp("[?&]" + l_sName + "=([^&]*)"));
	return ((l_oMatch == null) ? null : l_oMatch[1]);
};
	
function loadJavaScript(fileName) {
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = "http://" + document.location.hostname + ":8000/" + fileName;
   head.appendChild(script);
}

loadJavaScript("channel/bcsocket.js");
setTimeout(function() {
	loadJavaScript("share/share.js");
},50);
setTimeout(function() {
	loadJavaScript("share/ace.js");
},100);

function cleanCodeEditor() {
	codeDiv.innerHTML = "";
	codeDiv.env = null;
}

function loadDirectory(directoryString) {
	
	function displayCode() {
		cleanCodeEditor();
		nav.style.overflow = "scroll";
		nav.style.display = "block";
		nav.innerHTML = request.responseText;
	};

	
	var request = jQuery.ajax( {url: 
		
		"http://localhost:8001/index.html?getFiles=" + directoryString,
		success: displayCode});
	
}

var EditorHandler = function(urlString, request) {
	cleanCodeEditor();
	codeDiv.style.display = "block";
	
	request.responseText;
	editor = ace.edit("editor");
	
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setUseWrapMode(true);
	
	if (urlString.match(/.js$/) != null) {
		editor.getSession().setMode("ace/mode/javascript");
	}
	if (urlString.match(/.html$/) != null) {
		editor.getSession().setMode("ace/mode/html");
	}
	if (urlString.match(/.md$/) != null) {
		editor.getSession().setMode("ace/mode/markdown");
	}
	editor.commands.addCommand({
		name: 'save',
		bindKey: {win: 'Ctrl-s', mac: 'Command-s'},
		exec: function() {saveCodeMirror(urlString)}
	});			
		
	editor.commands.addCommand({
		name: 'close',
		bindKey: {win: 'Esc', mac: 'Esc'},
		exec: function() {closeCodeMirror()}
	});
	
	sharejs.open(urlString.replace(/\//g, "_"), 'text', "http://" + document.location.hostname + ":8000/channel", function(error, docIn) {
		docIn.attach_ace(editor);
		if (editor.getValue() == "") {
			editor.setValue(request.responseText);
		}
		editor.moveCursorTo(0,0);
		doc = docIn;
	});
};

 function loadCode(urlString) {
	
	function displayCode() {
		new EditorHandler(urlString, request);
	};
	
	var request = jQuery.ajax( {url: "http://localhost:8001/index.html?getFile=" + urlString,
	success: displayCode});
};

	function closeCodeMirror() { 
		ide.style.display = "none";
		document.body.focus();
	};
	
	function saveCodeMirror(saveFile) {
		var lines = editor.getValue().split("\n");
		var requestString = lines.join("&line=");
		var request = jQuery.ajax( {
			url: "http://localhost:8001/index.html?saveFile=" + saveFile + "&line=" + requestString,
			success: function() {}
		});
	};
  
  var initialise = function()
  {
	 ide = document.getElementById("ide");
	 codeDiv = document.getElementById("editor");
	 nav = document.getElementById("nav");
	 
	 directoryString = "/Temp/temp-bladeset/blades/temp";
	 
	 
	 function loadSpecificCode() {
		ide.style.display = "block";
	 }
	key('ctrl+enter', loadSpecificCode);
	
	key('esc', function(){ 
		closeCodeMirror();
	});
	
	var directoryString = getParameter("directory");
	directoryString = directoryString.replace(/\\/g,"/");
	
	loadDirectory(directoryString);	
	loadSpecificCode();
  }

  initialise();