
function Directory(name) {
	var dir = {}; 
	dir.name = name;
	dir.children = []; 
	dir.parent = null; 
	return dir;
}