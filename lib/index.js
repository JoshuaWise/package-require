'use strict';
const { dirname, join, sep } = require('path');
const { existsSync } = require('fs');

module.exports = (module, path) => {
	if (typeof module !== 'object' || module === null) throw new TypeError('Expected module to be an object');
	if (typeof path !== 'string') throw new TypeError('Expected path to be a string');
	return require(join(getProjectRoot(module), join(sep, path)));
}

const getProjectRoot = ({ filename }) => {
	if (typeof filename !== 'string' && filename !== null) throw new TypeError('Expected module.filename to be a string or null');
	const start = filename !== null ? dirname(filename) : process.cwd();
	let location = start;
	do {
		if (existsSync(join(location, 'package.json'))) return location;
	} while (location !== (location = dirname(location)))
	throw new Error(`Cannot find project root from: ${start}`);
};
