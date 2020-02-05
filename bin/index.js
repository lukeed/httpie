const { parse } = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const premove = require('premove');

const run = promisify(execFile);
const bundt = require.resolve('bundt');

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1);
}

async function mode(filename, args, altDir) {
	let { name } = parse(filename);
	let { stdout } = await run(bundt, [filename].concat(args || []));

	let diff = 8 - name.length;
	let spacer1 = ' '.repeat(diff < 0 ? 0 : diff);
	let spacer2 = ' '.repeat(diff < 0 ? diff * -1 : 0);

	process.stdout.write(
		stdout.replace('Filename' + spacer2, capitalize(name) + spacer1)
	);

	// Move to new directory (ensure in "files" list!)
	if (altDir) await run('mv', ['dist', altDir]);
}

(async function () {
	// Purge
	await premove('fetch');
	await premove('dist');

	// Build modes (order matters)
	await mode('src/fetch.js', ['--module', '--main', '--unpkg'], 'fetch');
	await mode('src/browser.js', ['--browser', '--unpkg']);
	await mode('src/index.js', ['--module', '--main']);
})().catch(err => {
	console.error('ERROR:', err);
	process.exit(1);
});
