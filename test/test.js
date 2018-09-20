'use strict';
const memfs = require('memfs');
const { expect } = require('chai');

const pr = (() => {
	const source = require('fs').readFileSync(require.resolve('../.'), 'utf8');
	const fakeProcess = { cwd: () => '/a/b/c' }
	const fakeModule = { exports: {} };
	new Function('process', 'module', 'require', source)(fakeProcess, fakeModule, (path) => {
		if (typeof path !== 'string') throw new TypeError('Expected a string path');
		if (!path.startsWith('/')) return path === 'fs' ? memfs : require(path);
		return memfs.readFileSync(path, 'utf8');
	});
	return fakeModule.exports;
})();

describe('packageRequire()', function () {
	before(function () {
		memfs.mkdirSync('/a');
		memfs.mkdirSync('/a/b');
		memfs.mkdirSync('/a/b/c');
		memfs.mkdirSync('/a/p');
		memfs.mkdirSync('/m');
		memfs.mkdirSync('/m/p');
		memfs.writeFileSync('/a/b/c/x.js', 'from');
		memfs.writeFileSync('/a/p/y.js', 'to');
		memfs.writeFileSync('/m/p/y.js', 'bad');
	});
	it('should throw on invalid input', function () {
		expect(() => pr()).to.throw(TypeError);
		expect(() => pr('p/y.js')).to.throw(TypeError);
		expect(() => pr({ filename: '/a/b/c/x.js' })).to.throw(TypeError);
		expect(() => pr('p/y.js', { filename: '/a/b/c/x.js' })).to.throw(TypeError);
		expect(() => pr(null, 'p/y.js')).to.throw(TypeError);
		expect(() => pr({ filename: '/a/b/c/x.js' }, new String('p/y.js'))).to.throw(TypeError);
		expect(() => pr({ filename: '/a/b/c/x.js' }, null)).to.throw(TypeError);
		expect(() => pr({ filename: new String('/a/b/c/x.js') }, 'p/y.js')).to.throw(TypeError);
	});
	it('should throw when no project root is found', function () {
		expect(() => pr({ filename: '/a/b/c/x.js' }, 'p/y.js')).to.throw(Error);
	});
	it('should work when a project root is found', function () {
		memfs.writeFileSync('/a/package.json', 'json');
		expect(pr({ filename: '/a/b/c/x.js' }, 'p/y.js')).to.equal('to');
	});
	it('should only recognize the first project root found', function () {
		memfs.writeFileSync('/a/b/package.json', 'json');
		expect(() => pr({ filename: '/a/b/c/x.js' }, 'p/y.js')).to.throw(Error);
		memfs.unlinkSync('/a/b/package.json');
	});
	it('should work when module.filename is null', function () {
		expect(pr({ filename: null }, 'p/y.js')).to.equal('to');
	});
	it('should work with absolute-style paths', function () {
		expect(pr({ filename: '/a/b/c/x.js' }, '/p/y.js')).to.equal('to');
	});
	it('should work with relative-style paths', function () {
		expect(pr({ filename: '/a/b/c/x.js' }, './p/y.js')).to.equal('to');
	});
	it('should protect files outside the project root', function () {
		expect(() => pr({ filename: '/a/b/c/x.js' }, '../m/p/y.js')).to.throw(Error);
		memfs.mkdirSync('/a/m');
		memfs.mkdirSync('/a/m/p');
		memfs.writeFileSync('/a/m/p/y.js', 'aside');
		expect(pr({ filename: '/a/b/c/x.js' }, '../m/p/y.js')).to.equal('aside');
	});
});
