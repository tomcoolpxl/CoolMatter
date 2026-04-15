import { pathToFileURL } from 'node:url'

import { runCoordinateChecks } from './coordinateChecks.js'
import { runDeterministicChecks } from './deterministicChecks.js'
import { runHistogramChecks } from './histogramChecks.js'
import { runNodeChecks } from './nodeChecks.js'
import { runNormalizationChecks } from './normalizationChecks.js'
import { runSuperpositionChecks } from './superpositionChecks.js'
import { runTruncationChecks } from './truncationChecks.js'

export function collectValidationResults() {
  return [
    ...runCoordinateChecks(),
    ...runDeterministicChecks(),
    ...runHistogramChecks(),
    ...runNormalizationChecks(),
    ...runNodeChecks(),
    ...runSuperpositionChecks(),
    ...runTruncationChecks(),
  ]
}

export function runValidation() {
  const results = collectValidationResults()
  const summary = summarizeValidationResults(results)

  for (const result of results) {
    const summary = `${result.pass ? 'PASS' : 'FAIL'} ${result.checkName}`
    console.log(summary)
    console.log(`  tolerance: ${result.tolerance}`)
    console.log(`  measured: ${JSON.stringify(result.measuredResult)}`)
  }

  console.log(`Validation complete: ${summary.passedChecks}/${summary.totalChecks} checks passed.`)
  assertValidationPassed(summary)

  return summary
}

export function summarizeValidationResults(results) {
  const failedChecks = results
    .filter((result) => !result.pass)
    .map((result) => result.checkName)

  return {
    totalChecks: results.length,
    passedChecks: results.length - failedChecks.length,
    failedChecks,
  }
}

export function assertValidationPassed(summary) {
  if (summary.failedChecks.length === 0) {
    return
  }

  throw new Error(
    `Validation checks failed: ${summary.failedChecks.join(', ')}`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runValidation()
  } catch (error) {
    console.error(`Validation failed: ${error.message}`)
    process.exitCode = 1
  }
}
