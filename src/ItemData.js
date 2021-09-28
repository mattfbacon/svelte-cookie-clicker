export default [
	{
		name: "Cursor",
		cps: 0.1,
		price: 15,
	}, {
		name: "Grandma",
		cps: 1,
		price: 100,
	}, {
		name: "Farm",
		cps: 8,
		price: 1100,
	}, {
		name: "Mine",
		cps: 47,
		price: 12000,
	}, {
		name: "Factory",
		cps: 260,
		price: 1.3e5,
	}, {
		name: "Bank",
		cps: 1400,
		price: 1.4e6,
	}, {
		name: "Temple",
		cps: 7800,
		price: 20e6,
	}, {
		name: "Wizard Tower",
		cps: 44e3,
		price: 330e6,
	}, {
		name: "Shipment",
		cps: 260e3,
		price: 5.1e9,
	}, {
		name: "Alchemy Lab",
		cps: 1.6e6,
		price: 75e9,
	}, {
		name: "Portal",
		cps: 10e6,
		price: 1e12,
	}, {
		name: "Time Machine",
		cps: 65e6,
		price: 14e12,
	}, {
		name: "Antimatter Condenser",
		cps: 430e6,
		price: 170e12,
	}, {
		name: "Prism",
		cps: 2.9e9,
		price: 2.1e15,
	}, {
		name: "Chancemaker",
		cps: 21e9,
		price: 26e15,
	}, {
		name: "Fractal Engine",
		cps: 150e9,
		price: 310e15,
	}, {
		name: "JavaScript Console",
		cps: 1.1e12,
		price: 71e18,
	}, {
		name: "Idleverse",
		cps: 8.3e12,
		price: 12e21,
	},
];

export function calculateCurrentPrice(item, amount) {
	// return (((amount + 1) * priceIncreaseIncrease + 2 * priceIncrease) * amount + 2 * price) / 2;
	return Math.ceil(item?.price * Math.pow(1.15, amount));
}
