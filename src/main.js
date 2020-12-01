document.addEventListener('DOMContentLoaded', function() { 

var commands = {
	"help" : cmdHelp,
	"cd"   : cmdCd,
	"ls"   : cmdLs,
	"cat"  : cmdCat,
	"pwd"  : cmdPwd,
	"run"  : cmdRun,
	"cls"  : cmdCls,
	"mkdir": cmdMkdir,
	"touch": cmdTouch
};

// constants
var OFFSET_FROM_TOP_OF_MONITOR = 724,
	MAX_CHARS = 80;

// globals ('file' scoped)
var compScreen, 
	overlay,
	curLine,
	curLineNum,
	curLineCharCount,
	visibleCount,
	root,
	workingDirectory,
	prompt,
  roofer,
  invaders,
  tunnel,
  plasma;
	
// entry point
init(); 

// functions
function init () {
	compScreen = document.getElementById('screen');
	overlay = document.getElementById('overlay');
	curLine = document.getElementById('line1');
	curLineNum = 1; 
	curLineCharCount = 0; 
	visibleCount = 1;
	prompt = ">>$ ";

	document.addEventListener('keydown', handleInput);

	// init directories and files 
	initFilesystem();
}

// TODO(shaw): cleanup
function initFilesystem() {
  var slash = Directory("/");
  //var home = Directory("/home");
  var home = Directory("home");
  var p    = Directory("projects"); 
  var c    = Directory("classified");
  var g    = Directory("games");
  var d    = Directory("demos");

  home.parent = slash;

  g.parent = home; 
  p.parent = home;
  d.parent = home;
  c.parent = p;

  slash.children.push(home);
  home.children.push(p,g,d);
  p.children.push(c);

  // games
  var gamesList = ["roofer", "invaders"];
  for (var i=0; i<gamesList.length; i++) {
    var exe = Executable(gamesList[i]);
    exe.parent = g;
    g.children.push(exe);
  }
  roofer = createRoofer();
  invaders = createInvaders();

  // demos
  var demoList = ["tunnel", "plasma"]
  for (var i=0; i<demoList.length; i++) {
      var exe = Executable(demoList[i]);
      exe.parent = d;
      d.children.push(exe);
  }
  tunnel = createTunnel();
  plasma = createPlasma();

  // projects

  // other files
	var f = File("readme.txt"); 
	f.contents = "Welcome to the SD6969DX. Let's hack.";
	f.parent = home;
	home.children.push(f);
	
	root = slash;
	workingDirectory = home;
}

function handleEnter() {
	// parse the current line
	var sanitized = curLine.textContent
					.replace(prompt, "")
					.toLowerCase()
					.trim()
					.split(' ');
	var cmd = sanitized[0];
	var args = sanitized.slice(1); 

	if (cmd == "") {
		createNewline();
		return;
	}

	// check for a recognized command
	if (commands[cmd]) {
		// call the command execution function and pass all arguments
		createNewline(); 
		commands[cmd](args);
	} else {
		createNewline(); 
		cPrint("Unrecognized command, type help to view commands."); 
	}
}

function handleInput(e) {

	// konami code
	konami(e.key);

	// handle delete
	if (e.key == 'Backspace') {
		deleteChar(); 
		return;
	}

	// handle enter
	if (e.key == 'Enter') {
		handleEnter();
		return;
	}
	
	var char; 

	// handle fucked up punctuation 
	if (e.key == ';') 
		char = ';';
	else if (e.key == '+')
		char = '+';
	else if (e.key == ',') 
		char = ',';
	else if (e.key == '-') 
		char = '-';
	else if (e.key == '.') 
		char = '.';
	else if (e.key == '/') 
		char = '/';
	else if (e.key == '`') 
		char = '`';
	else if (e.key == '[') 
		char = '[';
	else if (e.key == '\\') 
		char = '\\';
	else if (e.key == ']') 
		char = ']';
	else if (e.key == '\'') 
		char = '\''; 

	// regular alpha-numerics
	else if (e.key.length < 2 && e.key.match(/[A-Za-z0-9 _.,!"'/$]*/)) {
		char = e.key; 
	} else {
		return;
	}

	if (curLineCharCount >= MAX_CHARS) {
		curLine.textContent += '\n'; 
		curLineCharCount = 0;
	}
	curLine.textContent += char;
	curLineCharCount++;
}

// Command Exec Functions
function cmdHelp(args) {
	cPrint(
`cd <dir>      change the current directory to DIR
ls            list directory contents
pwd           print the current working directory
cat <file>    copies each FILE (or standard input) to standard output
run <file>    execute FILE
cls           clear screen

press 'q' to quit a running program
`
  ); 
}

// TODO(shaw): handle ls with directory as argument
function cmdLs(args) {
	// print out the immediate children of this directory
	for (var i=0; i<workingDirectory.children.length; i++) {
		cPrint(workingDirectory.children[i].name);
	}
}

function cmdPwd(args) {
	var reversePath = [];
	var cursor = workingDirectory.parent;

	// get path from home dir
	while (cursor) {
		reversePath.push(cursor.name); 
		cursor = cursor.parent; 
	}

	// print path from home dir
	var pathString = "";
	for (var i = reversePath.length - 1; i >= 0; i--) {
		if (reversePath[i] != "/") {
			pathString += reversePath[i];
		}
		pathString += "/";
	}
	pathString += workingDirectory.name;
	cPrint(pathString);
}

function cmdCat(args) {
	var path = args[0];

	if (!path || path == "") {
		cPrint("cat must be called with more than zero arguments"); 
		return;
	}
	
	// parse filename from the path
	var filename = path; 
	
	// traverse the filesystem, for each leaf, check if it matches the arg, print its contents if it does
	var queue = [root]; 
	while (queue.length > 0) {
		var current = queue.shift();

		if (!current.children || current.children.length == 0) { // if leaf
			
			// do check
			if (current.name.toLowerCase() == filename.toLowerCase()) {
				cPrint(current.contents); 
			}

		} else {
			for (var i=0; i<current.children.length; i++) {
				queue.push(current.children[i]);
			}
		}
	}

}

function cmdCls(args) {
	var lines = document.getElementsByClassName('line'); 
	var linesDelete = [];
	for (var i=0; i<lines.length; i++) {
		if (lines[i].id !== curLine.id) {
			linesDelete.push(lines[i]); 
		}
	}

	for (var i=0; i<linesDelete.length; i++) {
		linesDelete[i].parentNode.removeChild(linesDelete[i]);
	}

	curLine.style.paddingTop = '15px';
}

function cmdCd(args) {

	if (args.length > 1) {
		cPrint("Too many arguments: CD takes a single file or directory");
		return;
	}

	var dir = args[0];

	// root directory
	if (dir == "/") {
		workingDirectory = root;
		return;
	}

	// .. to go up a directory
	if (dir == ".." && workingDirectory.parent) {
		workingDirectory = workingDirectory.parent;
		return;
	}

  // absolute path
  if (dir[0] == "/") {
    var path = dir.split("/");
    var targetDirectory = root;

    // start at 1 as first element is ""
    for (var i=1; i<path.length; i++) {

      // check target dir for child dir with name path[i]
      targetDirectory = findChildDir(targetDirectory, path[i]);

      if (!targetDirectory) {
        cPrint("No such file or directory: ", path[i]);
        return;
      }

      if (targetDirectory.type !== "directory") {
        var message = targetDirectory.name + " is a " + targetDirectory.type + " not a directory";
        cPrint(message);
        return;
      }
    }
    workingDirectory = targetDirectory;
    return;
  }

  // local path: check in current working directory
  foundDirectory = findChildDir(workingDirectory, dir);
  if (!foundDirectory) {
    cPrint("No such file or directory");
    return;
  }

  if (foundDirectory.type !== "directory") {
    var message = foundDirectory.name + " is a " + foundDirectory.type + " not a directory";
    cPrint(message);
    return;
  }

  workingDirectory = foundDirectory; 

}

function cmdMkdir(args) {
	var message = args.length > 0
		? "mkdir: " + args.join(': ') + ": Permission denied"
		: "mkdir: Permission denied";
	cPrint(message); 
}

function cmdTouch(args) {
	var message = args.length > 0
		? "touch: " + args.join(': ') + ": Permission denied"
		: "touch: Permission denied";
	cPrint(message); 
}

function cmdRun(args) {
	var exe = args[0]; 

	// search working directory for exe 
	for (var i=0; i<workingDirectory.children.length; i++) {
		if (workingDirectory.children[i].name == exe) {
			run(exe); 
		}
	}
}

function run(exe) {
	switch(exe) {
		case "roofer": 
			runRoofer(); 
			break;
		case "invaders": 
			runInvaders(); 
			break;
		case "tunnel": 
		case "plasma": 
			runDemo(exe); 
            break;
		default:
			cPrint("Executable not found");
			break;
	}
}

function runRoofer() {
	overlay.style.display = 'block';

	// stop listening for events on the terminal 
	document.removeEventListener('keydown', handleInput); 

	roofer.init();
	roofer.startGame();
	// roofer.playMusic();

	document.addEventListener('keypress', function exitOnPressEscape(e) {
		if (e.key == "q") {
			roofer.quit = true; 
			// roofer.pauseMusic(); 
			document.addEventListener('keydown', handleInput);
			overlay.style.display = 'none'; 
			document.removeEventListener('keypress', exitOnPressEscape); 
		}
	}); 
}

function runInvaders() {
	overlay.style.backgroundColor = '#000';
	overlay.style.display = 'block';

	// stop listening for events on the terminal 
	document.removeEventListener('keydown', handleInput); 

    invaders.run();

	document.addEventListener('keypress', function exitOnPressEscape(e) {
		if (e.key == "q") {
			invaders.quit();
			document.addEventListener('keydown', handleInput);
			overlay.style.display = 'none'; 
            overlay.style.backgroundColor = '';
			document.removeEventListener('keypress', exitOnPressEscape); 
		}
	}); 
}

function runDemo(name) {
	overlay.style.display = 'block';

	// stop listening for events on the terminal 
	document.removeEventListener('keydown', handleInput); 

  if (name == "tunnel")
    tunnel.run();
  else if (name == "plasma")
    plasma.run();

	document.addEventListener('keypress', function exitOnPressEscape(e) {
		if (e.key == "q") {
      if (name == "tunnel")
        tunnel.quit();
      else if (name == "plasma")
        plasma.quit();
			document.addEventListener('keydown', handleInput);
			overlay.style.display = 'none'; 
			document.removeEventListener('keypress', exitOnPressEscape); 
		}
	}); 
}

// Utilities
function deleteChar() {
	var text = curLine.textContent;
	curLine.textContent = text.slice(0, text.length - 1); 
	// TODO(shaw): take a closer look at text wrapping 
	curLineCharCount = (text[text.length-1] === '\n') 
        ? MAX_CHARS 
        : curLineCharCount - 1; 
}

function createNewline() {
	var newLine = document.createElement('pre');
	newLine.id = 'line' + curLineNum++; 
	newLine.textContent = prompt;
	newLine.className = 'line cursor';
	curLine.className = 'line'; 
	compScreen.appendChild(newLine);
	curLine = newLine;
  curLineCharCount = prompt.length;

	// TODO(shaw): this is placeholder screen overflow, fix this shit later
	if (curLine.offsetTop >= OFFSET_FROM_TOP_OF_MONITOR) {
		cmdCls(); 
	}
}

function cWrite(message) {
	console.log("curline: ", curLine);
	console.log("text content before: ", curLine.textContent);
	curLine.textContent += message;
	console.log('curline id: ', curLine.id);
	console.log("text content after: ", curLine.textContent);
}

function cPrint(message) {
	curLine.textContent = message;
	createNewline(); 
}

// returns the directory with the name dirNameToFind if it exists in dir
// returns null if not found
function findChildDir(dir, childDirName) {
	for (var i=0; i<dir.children.length; i++) { 
		var current = dir.children[i];
		if (current.name === childDirName) {
			return current;
		}
	}
  return null;
}


}, false);

