<script>
	import { cookies, items } from './stores.js';
	let newCookies = 0;
</script>

<aside>
	<label>
	<input type="number" bind:value={newCookies}>
	New cookies
	</label>
	<button on:click={() => cookies.set(newCookies)}>Set</button>
</aside>
