<script>
	import { cookies, items, sesameOpened, } from './stores.js';
	import itemData, { calculateCurrentPrice } from './ItemData.js';
	import { floatToString } from './Util.js';

	function makePurchase(itemIdx, currentAmount) {
		if (!cookies.purchase(calculateCurrentPrice(itemData[itemIdx], currentAmount))) {
			alert("Not enough cookies");
		} else {
			items.buy(itemIdx, 1);
		}
	}

	function isHidden(idx, amount, doRecursion = true) {
		if (idx < 0) { return false; }
		if ($items[idx] > 0) { return false; }
		const thisItemPrice = calculateCurrentPrice(itemData[idx], amount);
		if (doRecursion && !isHidden(idx - 1, amount, false)) {
			return false;
		}
		return thisItemPrice > $cookies;
	}

	function isSemiHidden(idx, amount) {
		return isHidden(idx, amount) && !isHidden(idx - 1, amount);
	}
</script>

<table>
<thead>
	<tr>
		<th>Amount</th>
		<th>Name</th>
		<th>Price</th>
		<th>Buy</th>
	</tr>
</thead>
<tbody>
{#each $items as itemAmount, idx}
<tr class:hidden={!$sesameOpened && isHidden(idx, itemAmount)} class:semihidden={!$sesameOpened && isSemiHidden(idx, itemAmount)}>
	<td>{floatToString(itemAmount)}</td>
	<td>{itemData[idx].name}</td>
	<td>{floatToString(calculateCurrentPrice(itemData[idx], itemAmount))}</td>
	<td>
		{#if $sesameOpened}
			<input type="number" value={itemAmount} on:input={(e) => items.setItem(idx, parseInt(e.target.value, 10) || 0)}>
		{:else}
			<button on:click="{() => makePurchase(idx, itemAmount)}" disabled={calculateCurrentPrice(itemData[idx], itemAmount) > $cookies}>Buy</button>
		{/if}
	</td>
</tr>
{/each}
</tbody>
</table>

<style>
.hidden:not(.semihidden) {
display: none;
}
.semihidden td {
font-size: 0;
}
.semihidden button {
display: none;
}
.semihidden td::before {
content: "????";
font-size: 1rem;
}
</style>
