import { collectValidationResults } from './src/validation/runValidation.js'
console.log(collectValidationResults().map(r => r.checkName))
