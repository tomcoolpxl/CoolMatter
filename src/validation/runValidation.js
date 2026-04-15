import { runCoordinateChecks } from './coordinateChecks.js'
import { runNodeChecks } from './nodeChecks.js'
import { runNormalizationChecks } from './normalizationChecks.js'

function main() {
  const results = [
    ...runCoordinateChecks(),
    ...runNormalizationChecks(),
    ...runNodeChecks(),
  ]

  for (const result of results) {
    const summary = `${result.pass ? 'PASS' : 'FAIL'} ${result.checkName}`
    console.log(summary)
    console.log(`  tolerance: ${result.tolerance}`)
    console.log(`  measured: ${JSON.stringify(result.measuredResult)}`)
  }

  console.log(`Validation complete: ${results.length} checks passed.`)
}

try {
  main()
} catch (error) {
  console.error(`Validation failed: ${error.message}`)
  process.exitCode = 1
}
