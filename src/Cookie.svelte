<script>
	import { cookies } from './stores.js';

	let isFocusActive = false;

	function keyDown(e) {
		if (e.code == 'Enter') isFocusActive = true;
		if (e.repeat) { e.preventDefault(); return false; }
	}
	function keyUp(e) {
		if (e.code == 'Enter') isFocusActive = false;
	}
</script>

<button on:click={cookies.click} on:keydown={keyDown} on:keyup={keyUp} class:focus-active={isFocusActive}>
	<img src="/cookie.png" alt="Cookie">
</button>

<style>
* {
	user-select: none;
	-webkit-user-drag: none;
}
button {
	margin: 0;
	padding: 0;
	background: none;
	border: none;
	transition: transform .1s ease;
	position: relative;
}
button img {
	max-width: 60vw;
	max-height: 90vh;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
button:focus {
	outline: none;
}
button:hover {
	transform: scale(1.03);
}
button:focus img {
	filter: drop-shadow(0px 0px 5px darkorange);
}
button:active {
	transform: scale(0.97);
}
button.focus-active:focus {
	transform: scale(0.97);
}
</style>
