function Directory(name) {
	var dir = {}; 
	dir.name = name;
	dir.children = []; 
	dir.parent = null; 
	return dir;
}

function File(name) {
	var file = {}; 
	file.name = name;
	file.parent = null;
	file.contents = "";
	return file;
}

function Executable(name) {
	var exe = {}; 
	exe.name = name; 
	exe.parent = null; 
	exe.script = null; 
	return exe;
}


