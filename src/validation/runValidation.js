import { runCoordinateChecks } from './coordinateChecks.js'
import { runDeterministicChecks } from './deterministicChecks.js'
import { runNodeChecks } from './nodeChecks.js'
import { runNormalizationChecks } from './normalizationChecks.js'
import { runTruncationChecks } from './truncationChecks.js'

export function collectValidationResults() {
  return [
    ...runCoordinateChecks(),
    ...runDeterministicChecks(),
    ...runNormalizationChecks(),
    ...runNodeChecks(),
    ...runTruncationChecks(),
  ]
}

export function runValidation() {
  const results = collectValidationResults()

  for (const result of results) {
    const summary = `${result.pass ? 'PASS' : 'FAIL'} ${result.checkName}`
    console.log(summary)
    console.log(`  tolerance: ${result.tolerance}`)
    console.log(`  measured: ${JSON.stringify(result.measuredResult)}`)
  }

  console.log(`Validation complete: ${results.length} checks passed.`)
}

try {
  runValidation()
} catch (error) {
  console.error(`Validation failed: ${error.message}`)
  process.exitCode = 1
}
