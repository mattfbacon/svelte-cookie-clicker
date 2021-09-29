<script>
	import { cookies, itemCps, sesameOpened } from './stores.js';
	import { floatToString } from './Util.js';
	import { slide } from 'svelte/transition';

	import Cookie from './Cookie.svelte';
	import Items from './Items.svelte';

	setInterval(() => {
		cookies.increment(itemCps.get());
	}, 1000);
</script>

<main>
	<h2 style="grid-area:title;">
		{#if $sesameOpened}
			<input type="number" bind:value={$cookies}>
		{:else}
			<span>{floatToString($cookies)}</span>
		{/if}
		<span> Cookie{$cookies == 1 ? '' : 's'}</span>
	</h2>
	<h5 style="grid-area:subtitle;align-self:baseline;">{floatToString($itemCps)} CPS from upgrades</h5>
	<div style="grid-area:cookie;" id="cookie-container"><Cookie /></div>
	<h3 style="grid-area:items-title;align-self:baseline;">Items</h3>
	<div style="grid-area:items;"><Items /></div>
</main>

<style>
main {
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-rows: auto auto 1fr auto 1fr max-content;
	grid-auto-flow: column;
	gap: .3rem 1rem;
	grid-template-areas:
		"title ."
		"subtitle items-title"
		"cookie items"
		"cookie upgrades-title"
		"cookie upgrades"
	;
	text-align: center;
	align-items: start;
}
#cookie-container {
	align-self: stretch;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
