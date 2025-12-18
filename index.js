'use strict';

// This file is kept for backward compatibility.
// The actual implementation is now in TypeScript and compiled to dist/
const WMSDownloader = require(__dirname + '/dist/index.js').default;
module.exports = WMSDownloader;
