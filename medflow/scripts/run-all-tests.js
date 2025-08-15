#!/usr/bin/env node

/**
 * MedFlow Comprehensive Test Runner
 * 
 * This script runs all tests in the MedFlow application including:
 * - Unit tests (Vitest)
 * - Integration tests
 * - End-to-end tests (Playwright)
 * - Performance tests
 * - Stress tests
 * - Security tests
 * 
 * Features:
 * - Sequential test execution
 * - Comprehensive reporting
 * - Failure analysis
 * - Performance metrics
 * - Coverage reporting
 * - Test result aggregation
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { performance } = require('perf_hooks')

// Configuration
const CONFIG = {
  testTimeout: 300000, // 5 minutes per test suite
  coverageThreshold: 80, // Minimum coverage percentage
  maxTestFailures: 5, // Maximum allowed test failures
  performanceThreshold: 5000, // Maximum test execution time in ms
  outputDir: path.join(__dirname, '..', 'test-results'),
  reportsDir: path.join(__dirname, '..', 'coverage')
}

// Test results storage
const testResults = {
  startTime: Date.now(),
  suites: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  coverage: {},
  performance: {},
  errors: [],
  warnings: []
}

/**
 * Utility functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    test: '🧪'
  }[type] || 'ℹ️'
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    
    log(`Running: ${command} ${args.join(' ')}`, 'test')
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    })
    
    let stdout = ''
    let stderr = ''
    
    child.stdout.on('data', (data) => {
      stdout += data.toString()
      if (options.verbose) {
        process.stdout.write(data)
      }
    })
    
    child.stderr.on('data', (data) => {
      stderr += data.toString()
      if (options.verbose) {
        process.stderr.write(data)
      }
    })
    
    child.on('close', (code) => {
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      const result = {
        command,
        args,
        code,
        stdout,
        stderr,
        executionTime,
        success: code === 0
      }
      
      if (code === 0) {
        log(`Command completed successfully in ${executionTime.toFixed(2)}ms`, 'success')
      } else {
        log(`Command failed with code ${code}`, 'error')
      }
      
      resolve(result)
    })
    
    child.on('error', (error) => {
      log(`Command execution error: ${error.message}`, 'error')
      reject(error)
    })
    
    // Set timeout
    if (options.timeout) {
      setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`Command timed out after ${options.timeout}ms`))
      }, options.timeout)
    }
  })
}

/**
 * Test suite definitions
 */
const testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['run', 'test'],
    description: 'Runs Vitest unit tests with coverage',
    critical: true,
    timeout: CONFIG.testTimeout
  },
  {
    name: 'Unit Tests (UI)',
    command: 'npm',
    args: ['run', 'test:ui'],
    description: 'Runs Vitest unit tests with UI interface',
    critical: false,
    timeout: CONFIG.testTimeout
  },
  {
    name: 'Coverage Report',
    command: 'npm',
    args: ['run', 'test:coverage'],
    description: 'Generates comprehensive coverage report',
    critical: true,
    timeout: CONFIG.testTimeout
  },
  {
    name: 'End-to-End Tests',
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: 'Runs Playwright end-to-end tests',
    critical: true,
    timeout: CONFIG.testTimeout * 2
  },
  {
    name: 'Performance Tests',
    command: 'npm',
    args: ['run', 'test:performance'],
    description: 'Runs performance and load testing',
    critical: false,
    timeout: CONFIG.testTimeout * 3
  },
  {
    name: 'Stress Tests',
    command: 'npm',
    args: ['run', 'test:stress'],
    description: 'Runs stress testing under high load',
    critical: false,
    timeout: CONFIG.testTimeout * 4
  },
  {
    name: 'Linting',
    command: 'npm',
    args: ['run', 'lint'],
    description: 'Runs ESLint code quality checks',
    critical: true,
    timeout: 60000
  },
  {
    name: 'Type Checking',
    command: 'npx',
    args: ['tsc', '--noEmit'],
    description: 'Runs TypeScript type checking',
    critical: true,
    timeout: 120000
  },
  {
    name: 'Build Test',
    command: 'npm',
    args: ['run', 'build'],
    description: 'Tests production build process',
    critical: true,
    timeout: 180000
  }
]

/**
 * Run individual test suite
 */
async function runTestSuite(suite) {
  log(`Starting ${suite.name}...`, 'test')
  log(`Description: ${suite.description}`, 'info')
  
  try {
    const result = await runCommand(suite.command, suite.args, {
      timeout: suite.timeout,
      verbose: suite.critical
    })
    
    const suiteResult = {
      name: suite.name,
      description: suite.description,
      critical: suite.critical,
      success: result.success,
      executionTime: result.executionTime,
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      timestamp: Date.now()
    }
    
    // Parse test results if available
    if (result.stdout) {
      suiteResult.testCounts = parseTestOutput(result.stdout)
    }
    
    // Parse coverage if available
    if (result.stdout && suite.name.includes('Coverage')) {
      suiteResult.coverage = parseCoverageOutput(result.stdout)
    }
    
    testResults.suites.push(suiteResult)
    
    if (result.success) {
      log(`${suite.name} completed successfully`, 'success')
    } else {
      log(`${suite.name} failed`, 'error')
      if (suite.critical) {
        testResults.errors.push({
          suite: suite.name,
          error: `Exit code: ${result.code}`,
          stderr: result.stderr
        })
      }
    }
    
    return suiteResult
    
  } catch (error) {
    log(`${suite.name} failed with error: ${error.message}`, 'error')
    
    const suiteResult = {
      name: suite.name,
      description: suite.description,
      critical: suite.critical,
      success: false,
      executionTime: 0,
      code: -1,
      stdout: '',
      stderr: error.message,
      timestamp: Date.now(),
      error: error.message
    }
    
    testResults.suites.push(suiteResult)
    
    if (suite.critical) {
      testResults.errors.push({
        suite: suite.name,
        error: error.message,
        stderr: error.message
      })
    }
    
    return suiteResult
  }
}

/**
 * Parse test output for counts
 */
function parseTestOutput(output) {
  const testCounts = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
  
  // Parse Vitest output
  const vitestMatch = output.match(/(\d+)\s+passed.*?(\d+)\s+failed.*?(\d+)\s+skipped/)
  if (vitestMatch) {
    testCounts.passed = parseInt(vitestMatch[1]) || 0
    testCounts.failed = parseInt(vitestMatch[2]) || 0
    testCounts.skipped = parseInt(vitestMatch[3]) || 0
    testCounts.total = testCounts.passed + testCounts.failed + testCounts.skipped
  }
  
  // Parse Playwright output
  const playwrightMatch = output.match(/(\d+)\s+passed.*?(\d+)\s+failed/)
  if (playwrightMatch) {
    testCounts.passed = parseInt(playwrightMatch[1]) || 0
    testCounts.failed = parseInt(playwrightMatch[2]) || 0
    testCounts.total = testCounts.passed + testCounts.failed
  }
  
  return testCounts
}

/**
 * Parse coverage output
 */
function parseCoverageOutput(output) {
  const coverage = {}
  
  // Parse coverage percentages
  const coverageMatch = output.match(/All files\s+\|\s+(\d+\.?\d*)\s+\|\s+(\d+\.?\d*)\s+\|\s+(\d+\.?\d*)\s+\|\s+(\d+\.?\d*)/)
  if (coverageMatch) {
    coverage.statements = parseFloat(coverageMatch[1])
    coverage.branches = parseFloat(coverageMatch[2])
    coverage.functions = parseFloat(coverageMatch[3])
    coverage.lines = parseFloat(coverageMatch[4])
  }
  
  return coverage
}

/**
 * Run all test suites
 */
async function runAllTests() {
  log('🚀 Starting MedFlow comprehensive test suite...', 'info')
  log(`📋 Total test suites: ${testSuites.length}`, 'info')
  log(`⏱️  Test timeout: ${CONFIG.testTimeout / 1000}s`, 'info')
  log(`📊 Coverage threshold: ${CONFIG.coverageThreshold}%`, 'info')
  log('')
  
  // Ensure output directories exist
  ensureDirectoryExists(CONFIG.outputDir)
  ensureDirectoryExists(CONFIG.reportsDir)
  
  const startTime = performance.now()
  let criticalFailures = 0
  
  // Run test suites sequentially
  for (const suite of testSuites) {
    log(`\n${'='.repeat(60)}`, 'info')
    log(`Running: ${suite.name}`, 'test')
    log(`${'='.repeat(60)}`, 'info')
    
    const result = await runTestSuite(suite)
    
    if (!result.success && suite.critical) {
      criticalFailures++
      
      if (criticalFailures >= CONFIG.maxTestFailures) {
        log(`❌ Too many critical failures (${criticalFailures}). Stopping test execution.`, 'error')
        break
      }
    }
    
    // Add delay between test suites to avoid overwhelming the system
    if (suite !== testSuites[testSuites.length - 1]) {
      log('⏳ Waiting 2 seconds before next test suite...', 'info')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  const endTime = performance.now()
  const totalExecutionTime = endTime - startTime
  
  // Generate final report
  const finalReport = generateFinalReport(totalExecutionTime, criticalFailures)
  
  // Save results
  saveTestResults(finalReport)
  
  // Display summary
  displayTestSummary(finalReport)
  
  // Exit with appropriate code
  const exitCode = criticalFailures > 0 ? 1 : 0
  process.exit(exitCode)
}

/**
 * Generate final test report
 */
function generateFinalReport(totalExecutionTime, criticalFailures) {
  // Aggregate test counts
  const totalTests = testResults.suites.reduce((sum, suite) => {
    if (suite.testCounts) {
      return sum + suite.testCounts.total
    }
    return sum
  }, 0)
  
  const passedTests = testResults.suites.reduce((sum, suite) => {
    if (suite.testCounts) {
      return sum + suite.testCounts.passed
    }
    return sum
  }, 0)
  
  const failedTests = testResults.suites.reduce((sum, suite) => {
    if (suite.testCounts) {
      return sum + suite.testCounts.failed
    }
    return sum
  }, 0)
  
  // Aggregate coverage
  const coverageSuites = testResults.suites.filter(suite => suite.coverage && Object.keys(suite.coverage).length > 0)
  const aggregatedCoverage = {}
  
  if (coverageSuites.length > 0) {
    const latestCoverage = coverageSuites[coverageSuites.length - 1].coverage
    Object.keys(latestCoverage).forEach(key => {
      aggregatedCoverage[key] = latestCoverage[key]
    })
  }
  
  // Calculate success rates
  const successfulSuites = testResults.suites.filter(suite => suite.success).length
  const totalSuites = testResults.suites.length
  const successRate = totalSuites > 0 ? (successfulSuites / totalSuites) * 100 : 0
  
  // Performance analysis
  const performanceIssues = testResults.suites.filter(suite => 
    suite.executionTime > CONFIG.performanceThreshold
  ).map(suite => ({
    suite: suite.name,
    executionTime: suite.executionTime,
    threshold: CONFIG.performanceThreshold
  }))
  
  const report = {
    summary: {
      totalExecutionTime: `${(totalExecutionTime / 1000).toFixed(2)}s`,
      totalSuites,
      successfulSuites,
      failedSuites: totalSuites - successfulSuites,
      successRate: `${successRate.toFixed(2)}%`,
      criticalFailures
    },
    testResults: {
      totalTests,
      passedTests,
      failedTests,
      skippedTests: totalTests - passedTests - failedTests
    },
    coverage: aggregatedCoverage,
    performance: {
      performanceIssues,
      slowestSuite: testResults.suites.reduce((slowest, current) => 
        current.executionTime > slowest.executionTime ? current : slowest
      ),
      averageExecutionTime: testResults.suites.reduce((sum, suite) => 
        sum + suite.executionTime, 0
      ) / testResults.suites.length
    },
    suites: testResults.suites,
    errors: testResults.errors,
    warnings: testResults.warnings,
    recommendations: generateRecommendations(criticalFailures, successRate, aggregatedCoverage, performanceIssues)
  }
  
  return report
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(criticalFailures, successRate, coverage, performanceIssues) {
  const recommendations = []
  
  if (criticalFailures > 0) {
    recommendations.push(`Critical failures detected: ${criticalFailures}. Review and fix failing tests before deployment.`)
  }
  
  if (successRate < 90) {
    recommendations.push(`Low success rate: ${successRate.toFixed(2)}%. Investigate failing test suites.`)
  }
  
  if (coverage.statements && coverage.statements < CONFIG.coverageThreshold) {
    recommendations.push(`Low code coverage: ${coverage.statements}% < ${CONFIG.coverageThreshold}%. Add more tests.`)
  }
  
  if (performanceIssues.length > 0) {
    recommendations.push(`${performanceIssues.length} test suites exceeded performance threshold. Optimize slow tests.`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All tests passed successfully. Ready for deployment.')
  }
  
  return recommendations
}

/**
 * Save test results to file
 */
function saveTestResults(report) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `comprehensive-test-results-${timestamp}.json`
  const filepath = path.join(CONFIG.outputDir, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
  log(`📊 Test results saved to: ${filepath}`, 'info')
  
  return filepath
}

/**
 * Display test summary
 */
function displayTestSummary(report) {
  log('\n' + '='.repeat(80), 'info')
  log('📊 MEDFLOW COMPREHENSIVE TEST SUITE RESULTS', 'info')
  log('='.repeat(80), 'info')
  
  log(`\n⏱️  Total Execution Time: ${report.summary.totalExecutionTime}`, 'info')
  log(`🧪 Test Suites: ${report.summary.successfulSuites}/${report.summary.totalSuites} passed`, 'info')
  log(`📈 Success Rate: ${report.summary.successRate}`, 'info')
  
  if (report.testResults.totalTests > 0) {
    log(`\n📝 Test Results:`, 'info')
    log(`   Total Tests: ${report.testResults.totalTests}`, 'info')
    log(`   Passed: ${report.testResults.passedTests}`, 'success')
    log(`   Failed: ${report.testResults.failedTests}`, report.testResults.failedTests > 0 ? 'error' : 'info')
    log(`   Skipped: ${report.testResults.skippedTests}`, 'info')
  }
  
  if (Object.keys(report.coverage).length > 0) {
    log(`\n📊 Code Coverage:`, 'info')
    Object.entries(report.coverage).forEach(([key, value]) => {
      const status = value >= CONFIG.coverageThreshold ? 'success' : 'warning'
      log(`   ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}%`, status)
    })
  }
  
  if (report.performance.performanceIssues.length > 0) {
    log(`\n⚠️  Performance Issues:`, 'warning')
    report.performance.performanceIssues.forEach(issue => {
      log(`   ${issue.suite}: ${issue.executionTime.toFixed(2)}ms (threshold: ${issue.threshold}ms)`, 'warning')
    })
  }
  
  if (report.errors.length > 0) {
    log(`\n❌ Errors:`, 'error')
    report.errors.forEach(error => {
      log(`   ${error.suite}: ${error.error}`, 'error')
    })
  }
  
  log(`\n💡 Recommendations:`, 'info')
  report.recommendations.forEach((rec, index) => {
    log(`   ${index + 1}. ${rec}`, 'info')
  })
  
  log('\n' + '='.repeat(80), 'info')
  
  if (report.summary.criticalFailures > 0) {
    log('❌ TEST SUITE FAILED - Critical issues detected', 'error')
  } else {
    log('✅ TEST SUITE PASSED - All critical tests successful', 'success')
  }
  log('='.repeat(80), 'info')
}

/**
 * Handle process termination
 */
process.on('SIGINT', () => {
  log('\n🛑 Test execution interrupted by user', 'warning')
  process.exit(1)
})

process.on('SIGTERM', () => {
  log('\n🛑 Test execution terminated', 'warning')
  process.exit(1)
})

// Run the test suite if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`💥 Test runner failed: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  runTestSuite,
  generateFinalReport
}
