port = parseInt(document.location.port);
port2 = port + 1;

function getParameter(l_sName)
{
	var l_oMatch = window.location.search.match(new RegExp("[?&]" + l_sName + "=([^&]*)"));
	return ((l_oMatch == null) ? null : l_oMatch[1]);
};
	
function loadJavaScript(fileName) {
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = "http://" + document.location.hostname + ":" + port + "/" + fileName;
   head.appendChild(script);
}

loadJavaScript("channel/bcsocket.js");
setTimeout(function() {
	loadJavaScript("share/share.js");
},50);
setTimeout(function() {
	loadJavaScript("share/ace.js");
},100);

var DirectoryHandler = function(directoryString) {
	jQuery.ajax( {
		url: "http://" + document.location.hostname + ":" + port2 + "/index.html?getFiles=" + directoryString,
		success: this.displayCode});
}

DirectoryHandler.prototype.displayCode = function(responseText) {
		nav.style.overflow = "scroll";
		nav.style.display = "block";
		nav.innerHTML = responseText;
};

var EditorHandler = function(urlString, request) {
    var self = this;
    this.cleanCodeEditor();
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
		exec: function() {self.save(urlString)}
	});			
		
	editor.commands.addCommand({
		name: 'close',
		bindKey: {win: 'Esc', mac: 'Esc'},
		exec: function() {closeCodeMirror()}
	});
	
	fileId = urlString.replace(/\//g, "_");
	console.log(fileId + "x"); //To avoid Dom Exception 18 for some reason
	sharejs.open(fileId, 'text', "http://" + document.location.hostname + ":" + port + "/channel", function(error, docIn) {
		docIn.attach_ace(editor);
		if (editor.getValue() == "") {
			editor.setValue(request.responseText);
		}
		editor.moveCursorTo(0,0);
		doc = docIn;
	});
};

EditorHandler.prototype.cleanCodeEditor = function() {
	codeDiv.innerHTML = "";
	codeDiv.env = null;
}

EditorHandler.prototype.save = function(saveFile) {
    $.ajax({  
    type: "POST",  
	url: "http://" + document.location.hostname +":" + port2,
	data: {file: saveFile, body: editor.getValue()},
	success: function() {  
	}  
    });  
}

function loadCode(urlString) {
	
	function displayCode() {
		new EditorHandler(urlString, request);
	};
	
     var request = jQuery.ajax( {url: "http://" + document.location.hostname + ":" + port2 + "/index.html?getFile=" + urlString, success: displayCode});
};

function closeCodeMirror() { 
	ide.style.display = "none";
	document.body.focus();
};
  
var initialise = function()
{
    ide = document.getElementById("ide");
    codeDiv = document.getElementById("editor");
    nav = document.getElementById("nav");
    directoryString = "/Temp/temp-bladeset/blades/temp";
 
 
    function showIDE() {
	    ide.style.display = "block";
    }
    key('ctrl+enter', showIDE);

    key('esc', function(){ 
	    closeCodeMirror();
    });

    var directoryString = getParameter("directory");
    directoryString = directoryString.replace(/\\/g,"/");

    new DirectoryHandler(directoryString);	
    showIDE();
}

loadDirectory = function(directoryString) {
	new DirectoryHandler(directoryString);	
}

  initialise();