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

var Editor = function(filename, request, div) {
    this.filename = filename;
    this.request = request;
	this.editor = this.createEditor(div);
	this.setSaveHotkey();
    this.setSwitchHotkey();
    this.bindToShareJS();
};

Editor.prototype.bindToShareJS = function() {
    fileId = this.filename.replace(/\//g, "_");
    var self = this;
    sharejs.open(fileId, 'text', "http://" + document.location.hostname + ":" + port + "/channel", function(error, docIn) {
		docIn.attach_ace(self.editor);
		if (self.editor.getValue() == "") {
			self.editor.setValue(self.request.responseText);
		}
		self.editor.moveCursorTo(0,0);
		doc = docIn;
	});
}

Editor.prototype.createEditor = function(div) {
    var editor = ace.edit(div.id);
    
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setUseWrapMode(true);
	
	if (this.filename.match(/.js$/) != null) {
		editor.getSession().setMode("ace/mode/javascript");
	}
	if (this.filename.match(/.html$/) != null) {
		editor.getSession().setMode("ace/mode/html");
	}
	if (this.filename.match(/.md$/) != null) {
		editor.getSession().setMode("ace/mode/markdown");
	}
    return editor;
}

Editor.prototype.setSaveHotkey = function() {
    var self = this;
    this.editor.commands.addCommand({
        name: 'save',
		bindKey: {win: 'Ctrl-s', mac: 'Command-s'},
		exec: function() {self.save(self.filename)}
	});		
}

Editor.prototype.setSwitchHotkey = function() {
    var self = this;
    this.editor.commands.addCommand({
        name: 'switch',
		bindKey: {win: 'Ctrl+`', mac: 'Ctrl+`'},
		exec: function(event, x, y) {;
            editorHandler.switchEditor();
            return true;
    	}
	});		
}

Editor.prototype.save = function(saveFile) {
    var self = this;
    $.ajax({  
        type: "POST",  
    	url: "http://" + document.location.hostname +":" + port2,
    	data: {file: saveFile, body: self.editor.getValue()},
    	success: function() {  
    	}  
    });  
}

EditorHandler = function() {
    this.editors = new Array();
    this.currentEditor = "";
}

EditorHandler.prototype.openFile = function(urlString, request) {
    if (editorMap[urlString] != null) {
        currentDiv.style.display = "none";
        console.log("EditorMap", editorMap[urlString]);
        currentDiv = editorMap[urlString];
        currentDiv.style.display = "block";
        this.currentEditor = urlString;
    } else {
        
        var button = document.createElement("button");
        button.innerHTML = urlString.match(/[^/]*$/);
        button.onclick = function() {loadCode(urlString)};
        header.appendChild(button);
        this.editors.push(urlString);
        this.currentEditor = urlString;
        
        currentDiv.style.display = "none";
        editor = document.createElement("div");
        //background-color:white; position:absolute; z-index:1000; margin-top:10%; width:80%; height:90%; margin-left:20%;
        editor.style.backgroundColor = "white";
        editor.style.position = "absolute";
        editor.style.zIndex = "1000";
        editor.style.marginTop = "10%";
        editor.style.width = "80%";
        editor.style.height = "90%";
        editor.style.marginLeft = "20%";
        
        editor.id = editorsId++;
        currentDiv = editor;
        editorMap[urlString] = editor;
        editorsDiv.appendChild(editor);
	    new Editor(urlString, request, editor);
    }
}

EditorHandler.prototype.switchEditor = function() {
    var position = this.editors.indexOf(this.currentEditor);
    var nextEditor = (position+1) % this.editors.length;
    console.log(this.editors, position+1, this.editors.length, nextEditor);
    this.openFile(this.editors[nextEditor]);
    
}

function loadCode(urlString) {
	
	function displayCode() {
        editorHandler.openFile(urlString, request);
	};
	
     var request = jQuery.ajax( {url: "http://" + document.location.hostname + ":" + port2 + "/index.html?getFile=" + urlString, success: displayCode});
};

function closeCodeMirror() { 
	ide.style.display = "none";
	document.body.focus();
};
  
var initialise = function()
{
    editorMap = {};
    editorsId = 0;
    ide = document.getElementById("ide");
    editorsDiv = document.getElementById("editors");
    codeDiv = document.getElementById("editor");
    nav = document.getElementById("nav");
    header = document.getElementById("header");
    currentDiv = codeDiv;
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
    editorHandler = new EditorHandler();
    showIDE();
}

loadDirectory = function(directoryString) {
	new DirectoryHandler(directoryString);	
}

  initialise();