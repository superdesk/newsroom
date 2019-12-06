/* eslint-env node */

var testsContext = require.context('.', true, /[Ss]pec.(js|jsx)$/);

testsContext.keys().forEach(testsContext);
