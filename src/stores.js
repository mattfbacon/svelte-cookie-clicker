import { writable, derived, get } from 'svelte/store';

import itemData from './ItemData.js';

export const cookiesPerClick = writable(1);

const _cookies = writable(0);
export const cookies = {
	..._cookies,
	click() {
		_cookies.update(n => n + get(cookiesPerClick));
	},
	increment(amount) {
		_cookies.update(n => n + amount);
	},
	purchase(price) {
		if (get(_cookies) >= price) {
			_cookies.update(n => n - price);
			return true;
		} else {
			return false;
		}
	}
};

const _items = writable(itemData.map(_ => 0));
export const items = {
	..._items,
	buy(item_idx, amount) {
		_items.update(xs => {
			xs[item_idx] = xs[item_idx] + amount;
			return xs;
		});
	},
	setItem(item_idx, amount) {
		_items.update(xs => {
			xs[item_idx] = amount;
			return xs;
		});
	}
};

const _itemCps = derived(items, $items => $items.reduce((acc, item_amt, idx) => acc + (itemData[idx].cps * item_amt), 0));
export const itemCps = {
	..._itemCps,
	get: () => get(_itemCps)
};

export const sesameOpened = writable(false);
