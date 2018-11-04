var konamiIndex = 0; 
var kabuki = new Audio('../assets/kabuki.mp3');
var konamiCode = [
	'ArrowUp', 
	'ArrowUp', 
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'b',
	'a'
]

function konami(key) {
	if (key == konamiCode[konamiIndex]) {

		if (konamiIndex == konamiCode.length - 1) {
			console.log('YOOOOOOOOOO!');
			kabuki.play();
			konamiIndex = 0;
		}

		konamiIndex++;
	} else {
		konamiIndex = 0;
	}
}
