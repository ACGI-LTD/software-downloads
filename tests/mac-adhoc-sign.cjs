'use strict';

// Apple Silicon requires even locally built executable code to carry a code
// signature. An ad-hoc signature lets CI run the app, but does not identify the
// developer or satisfy Gatekeeper/notarization for public distribution.
const fs = require('node:fs');
const app = process.argv[2];
if (!app || !fs.existsSync(app)) throw new Error('Expected an extracted .app path');

import('@electron/osx-sign').then(({sign}) => sign({
  app,
  identity: '-',
  identityValidation: false,
  preAutoEntitlements: false,
  optionsForFile: () => ({hardenedRuntime: false, timestamp: 'none'}),
})).then(() => {
  console.log('Applied macOS ad-hoc code signature.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
