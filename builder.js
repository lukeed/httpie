const fs = require('fs');
const mkdir = require('mk-dirs');
const sizer = require('gzip-size');
const pretty = require('pretty-bytes');
const { minify } = require('terser');
const pkg = require('./package');

let keys = [];
let data = fs.readFileSync('src/index.js', 'utf8');

mkdir('dist').then(() => {
	// Copy as is for ESM
	fs.writeFileSync(pkg.module, data);

	// Minify & print gzip-size
	let { code } = minify(data, { toplevel:true });
	console.log(`> gzip size: ${pretty(sizer.sync(code))}`);

	data = data
		// Mutate exports for CJS
		.replace(/export const (.+?)(?=(\s|\=))/gi, (_, x) => `exports.${x}`)
		.replace(/export function\s?(.+?)(?=\()/gi, (_, x) => keys.push(x) && `function ${x}`)
		// Mutate imports for CJS
		.replace(/import ([\s\S]*?) from (.*)/gi, (_, req, dep) => {
			return `const ${req} = require(${dep.replace(';', '')});`;
		});

	keys.sort().forEach(key => {
		data += `\nexports.${key} = ${key};`;
	});
	fs.writeFileSync(pkg.main, data + '\n');
});
