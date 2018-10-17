function Directory(name) {
	var dir = {}; 
	dir.name = name;
	dir.children = []; 
	dir.parent = null; 
	dir.type = "directory";
	return dir;
}

function File(name) {
	var file = {}; 
	file.name = name;
	file.parent = null;
	file.contents = "";
	file.type = "file";
	return file;
}

function Executable(name) {
	var exe = {}; 
	exe.name = name; 
	exe.parent = null; 
	exe.script = null; 
	exe.type = "executable";
	return exe;
}


