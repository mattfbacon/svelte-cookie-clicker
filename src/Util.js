export function floatToString(x, prec = 2) {
	/*
	const badStr = x.toFixed(prec);
	const betterStr = badStr.replace(/^0+(?=\d\.)|0+$/g, '');
	if (betterStr.endsWith('.')) {
		return betterStr.slice(0, -1);
	} else {
		return betterStr;
	}
	*/
	if (x < 1) {
		return parseFloat(+x.toFixed(prec)).toString();
	} else {
		return humanFormat(x, { decimals: prec });
	}
}
