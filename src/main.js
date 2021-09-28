import App from './App.svelte';
import { sesameOpened } from './stores.js';

const app = new App({
	target: document.body
});

function openSesame() {
	sesameOpened.update(x => !x);
}
app.openSesame = openSesame;

export default app;
