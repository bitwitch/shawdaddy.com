document.addEventListener('DOMContentLoaded', function(){ 

// commands dispatch
var commands = {
	"help" : cmdHelp,
	"cd" : cmdCd,
	"ls" : cmdLs,
	"pwd" : cmdPwd,	
}; 

// globals
var compScreen, 
cursor, 
cursorVisible, 
curLineNum,
curLine,
curLineCharCount,
workingDirectory,
maxChars;


// entry point
init(); 


// functions
function init () {
	window.addEventListener('keydown', handleInput); 
	compScreen = document.getElementById('screen');
	cursor = document.getElementById('cursor');
	curLine = document.getElementById('line1');
	curLineNum = 1; 
	cursorVisible = true;
	maxChars = 80;
	curLineCharCount = 0; 

	var home = Directory("/");
	var p = Directory("projects"); 
	var g = Directory("games"); 
	home.children.push(p,g); 

	workingDirectory = home;

	// start cursor blink
	// window.setInterval(function() {
	// 	cursor.style.visibility =  cursorVisible ? 'visible' : 'hidden'; 
	// 	cursorVisible = !cursorVisible; 
	// }, 500); 
}

function handleEnter() {
	// parse the current line
	var sanitized = curLine.textContent.toLowerCase().trim().split(' '); 
	var cmd = sanitized[0];
	var args = sanitized.slice(1); 

	console.log(cmd); 

	// check for a recognized command
	if (commands[cmd]) {
		// call the command execution function and pass all arguments
		createNewline(); 
		commands[cmd](args);
	} else {
		createNewline(); 
		cPrint("Unrecognized command, type help to view commands."); 
		createNewline(); 
	}
}

function handleInput(e) {
	// handle delete
	if (e.keyCode === 8) {
		deleteChar(); 
		return;
	}

	// handle enter
	if (e.keyCode === 13) {
		handleEnter();
	}
	

	var char; 
	// handle fucked up punctuation 
	
	if (e.keyCode === 186) 
		char = ';';
	else if (e.keyCode === 187)
		char = '+';
	else if (e.keyCode === 188) 
		char = ',';
	else if (e.keyCode === 189) 
		char = '-';
	else if (e.keyCode === 190) 
		char = '.';
	else if (e.keyCode === 191) 
		char = '?';
	else if (e.keyCode === 192) 
		char = '`';
	else if (e.keyCode === 219) 
		char = '[';
	else if (e.keyCode === 220) 
		char = '\\';
	else if (e.keyCode === 221) 
		char = ']';
	else if (e.keyCode === 222) 
		char = '\'';

	// regular alpha-numerics
	else {
		char = String.fromCharCode(e.keyCode); 
	}
	
	// console.log('keycode: ', e.keyCode);
	if (curLineCharCount >= maxChars) {
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
run <file>    execute FILE
`
	); 
}

function cmdLs(args) {
	// print out the immediate children of this directory
	for (var i=0; i<workingDirectory.children.length; i++) {
		cPrint(workingDirectory.children[i].name);
		createNewline(); 
	}
}

function cmdPwd(args) {
	cPrint(workingDirectory.name);
	createNewline();
}

function cmdCd(args) {

}

// Utilities
function deleteChar() {
	var text = curLine.textContent;
	curLine.textContent = text.slice(0, text.length - 1); 
	// TODO(shaw): take a closer look at text wrapping 
	curLineCharCount =  (text[text.length-1] === '\n') ? maxChars : curLineCharCount - 1; 
}

function createNewline() {
	var newLine = document.createElement('pre');
	newLine.id = 'line' + curLineNum++; 
	newLine.className = 'line cursor';
	curLine.className = 'line'; 
	compScreen.appendChild(newLine);
	curLine = newLine;
}

function cPrint(message) {
	curLine.textContent = message;
	createNewline(); 
}



}, false);

