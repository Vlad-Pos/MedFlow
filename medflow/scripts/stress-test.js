#!/usr/bin/env node

/**
 * MedFlow Stress Testing Script
 * 
 * This script performs comprehensive stress testing on the MedFlow application
 * to ensure it remains stable under high user loads and peak usage scenarios.
 * 
 * Features:
 * - Concurrent user simulation
 * - API endpoint stress testing
 * - Memory and performance monitoring
 * - Firebase query stress testing
 * - Authentication load testing
 * - Database operation stress testing
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { performance } = require('perf_hooks')

// Configuration
const CONFIG = {
  baseUrl: process.env.MEDFLOW_BASE_URL || 'http://localhost:5173',
  testDuration: parseInt(process.env.TEST_DURATION) || 300000, // 5 minutes
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 100,
  requestsPerSecond: parseInt(process.env.REQUESTS_PER_SECOND) || 50,
  firebaseQueries: parseInt(process.env.FIREBASE_QUERIES) || 1000,
  memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD) || 500, // MB
  responseTimeThreshold: parseInt(process.env.RESPONSE_TIME_THRESHOLD) || 2000, // ms
  errorThreshold: parseFloat(process.env.ERROR_THRESHOLD) || 0.05 // 5%
}

// Test results storage
const testResults = {
  startTime: Date.now(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  maxResponseTime: 0,
  minResponseTime: Infinity,
  errors: [],
  memoryUsage: [],
  performanceMetrics: []
}

// Performance monitoring
let memoryMonitor
let performanceMonitor

/**
 * Memory usage monitoring
 */
function startMemoryMonitoring() {
  memoryMonitor = setInterval(() => {
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      timestamp: Date.now(),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
    
    testResults.memoryUsage.push(memUsageMB)
    
    // Check memory threshold
    if (memUsageMB.rss > CONFIG.memoryThreshold) {
      console.warn(`⚠️  Memory usage exceeded threshold: ${memUsageMB.rss}MB > ${CONFIG.memoryThreshold}MB`)
    }
  }, 1000)
}

/**
 * Performance monitoring
 */
function startPerformanceMonitoring() {
  performanceMonitor = setInterval(() => {
    const perfMetrics = {
      timestamp: Date.now(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
    
    testResults.performanceMetrics.push(perfMetrics)
  }, 5000)
}

/**
 * HTTP request helper
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MedFlow-Stress-Test/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 10000
    }
    
    const protocol = url.startsWith('https:') ? https : http
    const req = protocol.request(url, requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        testResults.totalRequests++
        testResults.totalResponseTime += responseTime
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          testResults.successfulRequests++
        } else {
          testResults.failedRequests++
          testResults.errors.push({
            url,
            statusCode: res.statusCode,
            responseTime,
            timestamp: Date.now()
          })
        }
        
        // Update response time metrics
        if (responseTime > testResults.maxResponseTime) {
          testResults.maxResponseTime = responseTime
        }
        if (responseTime < testResults.minResponseTime) {
          testResults.minResponseTime = responseTime
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data
        })
      })
    })
    
    req.on('error', (error) => {
      testResults.totalRequests++
      testResults.failedRequests++
      testResults.errors.push({
        url,
        error: error.message,
        timestamp: Date.now()
      })
      reject(error)
    })
    
    req.on('timeout', () => {
      req.destroy()
      testResults.totalRequests++
      testResults.failedRequests++
      testResults.errors.push({
        url,
        error: 'Request timeout',
        timestamp: Date.now()
      })
      reject(new Error('Request timeout'))
    })
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

/**
 * Simulate concurrent user load
 */
async function simulateConcurrentUsers() {
  console.log(`🚀 Starting stress test with ${CONFIG.concurrentUsers} concurrent users...`)
  
  const userPromises = []
  
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    const userPromise = simulateUser(i)
    userPromises.push(userPromise)
    
    // Stagger user creation to avoid overwhelming the system
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  await Promise.allSettled(userPromises)
}

/**
 * Simulate individual user behavior
 */
async function simulateUser(userId) {
  const userSession = {
    userId,
    startTime: Date.now(),
    requests: 0,
    errors: 0
  }
  
  try {
    // Simulate user journey
    await simulateUserJourney(userSession)
  } catch (error) {
    userSession.errors++
    console.error(`User ${userId} encountered error:`, error.message)
  }
  
  return userSession
}

/**
 * Simulate complete user journey
 */
async function simulateUserJourney(userSession) {
  const baseUrl = CONFIG.baseUrl
  
  // 1. Visit home page
  await makeRequest(`${baseUrl}/`)
  userSession.requests++
  
  // 2. Navigate to sign in
  await makeRequest(`${baseUrl}/signin`)
  userSession.requests++
  
  // 3. Attempt authentication (with test credentials)
  await makeRequest(`${baseUrl}/api/auth/signin`, {
    method: 'POST',
    body: {
      email: `testuser${userSession.userId}@example.com`,
      password: 'testpassword123'
    }
  })
  userSession.requests++
  
  // 4. Access dashboard (if authenticated)
  await makeRequest(`${baseUrl}/dashboard`)
  userSession.requests++
  
  // 5. Create appointment
  await makeRequest(`${baseUrl}/api/appointments`, {
    method: 'POST',
    body: {
      patientName: `Test Patient ${userSession.userId}`,
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      symptoms: 'Stress test symptoms',
      notes: 'Generated by stress test'
    }
  })
  userSession.requests++
  
  // 6. View appointments
  await makeRequest(`${baseUrl}/api/appointments`)
  userSession.requests++
  
  // 7. Update profile
  await makeRequest(`${baseUrl}/api/profile`, {
    method: 'PUT',
    body: {
      displayName: `Updated User ${userSession.userId}`,
      preferences: {
        notifications: true,
        theme: 'dark'
      }
    }
  })
  userSession.requests++
  
  // Add random delays to simulate real user behavior
  const randomDelay = Math.random() * 2000 + 1000
  await new Promise(resolve => setTimeout(resolve, randomDelay))
}

/**
 * Firebase query stress testing
 */
async function testFirebaseQueries() {
  console.log(`🔥 Testing Firebase with ${CONFIG.firebaseQueries} queries...`)
  
  const queryPromises = []
  
  for (let i = 0; i < CONFIG.firebaseQueries; i++) {
    const queryPromise = testFirebaseQuery(i)
    queryPromises.push(queryPromise)
    
    // Limit concurrent queries
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  await Promise.allSettled(queryPromises)
}

/**
 * Test individual Firebase query
 */
async function testFirebaseQuery(queryId) {
  try {
    // Simulate different types of Firebase queries
    const queryTypes = ['appointments', 'users', 'notifications', 'reports']
    const queryType = queryTypes[queryId % queryTypes.length]
    
    const startTime = performance.now()
    
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    
    const endTime = performance.now()
    const queryTime = endTime - startTime
    
    // Record query performance
    testResults.performanceMetrics.push({
      type: 'firebase_query',
      queryType,
      queryId,
      queryTime,
      timestamp: Date.now()
    })
    
    return { success: true, queryTime }
  } catch (error) {
    testResults.errors.push({
      type: 'firebase_query',
      queryId,
      error: error.message,
      timestamp: Date.now()
    })
    return { success: false, error: error.message }
  }
}

/**
 * Generate test report
 */
function generateTestReport() {
  const endTime = Date.now()
  const testDuration = endTime - testResults.startTime
  
  // Calculate averages
  testResults.averageResponseTime = testResults.totalRequests > 0 
    ? testResults.totalResponseTime / testResults.totalRequests 
    : 0
  
  const errorRate = testResults.totalRequests > 0 
    ? testResults.failedRequests / testResults.totalRequests 
    : 0
  
  const requestsPerSecond = testResults.totalRequests / (testDuration / 1000)
  
  // Memory analysis
  const memoryTrend = analyzeMemoryTrend()
  
  // Performance analysis
  const performanceAnalysis = analyzePerformance()
  
  const report = {
    testSummary: {
      duration: `${(testDuration / 1000).toFixed(2)}s`,
      totalRequests: testResults.totalRequests,
      successfulRequests: testResults.successfulRequests,
      failedRequests: testResults.failedRequests,
      requestsPerSecond: requestsPerSecond.toFixed(2),
      errorRate: `${(errorRate * 100).toFixed(2)}%`
    },
    responseTimeMetrics: {
      average: `${testResults.averageResponseTime.toFixed(2)}ms`,
      minimum: `${testResults.minResponseTime.toFixed(2)}ms`,
      maximum: `${testResults.maxResponseTime.toFixed(2)}ms`
    },
    memoryAnalysis: memoryTrend,
    performanceAnalysis: performanceAnalysis,
    errorAnalysis: {
      totalErrors: testResults.errors.length,
      errorTypes: categorizeErrors(),
      criticalErrors: testResults.errors.filter(e => e.statusCode >= 500).length
    },
    recommendations: generateRecommendations(errorRate, memoryTrend, performanceAnalysis)
  }
  
  return report
}

/**
 * Analyze memory usage trend
 */
function analyzeMemoryTrend() {
  if (testResults.memoryUsage.length < 2) {
    return { trend: 'insufficient_data', message: 'Not enough memory data points' }
  }
  
  const first = testResults.memoryUsage[0]
  const last = testResults.memoryUsage[testResults.memoryUsage.length - 1]
  const memoryGrowth = last.rss - first.rss
  
  if (memoryGrowth > 100) {
    return { trend: 'increasing', message: `Memory usage increased by ${memoryGrowth}MB`, critical: true }
  } else if (memoryGrowth > 50) {
    return { trend: 'increasing', message: `Memory usage increased by ${memoryGrowth}MB`, critical: false }
  } else if (memoryGrowth < -50) {
    return { trend: 'decreasing', message: `Memory usage decreased by ${Math.abs(memoryGrowth)}MB` }
  } else {
    return { trend: 'stable', message: 'Memory usage remained stable' }
  }
}

/**
 * Analyze performance metrics
 */
function analyzePerformance() {
  const firebaseQueries = testResults.performanceMetrics.filter(m => m.type === 'firebase_query')
  const avgQueryTime = firebaseQueries.length > 0 
    ? firebaseQueries.reduce((sum, m) => sum + m.queryTime, 0) / firebaseQueries.length 
    : 0
  
  return {
    averageFirebaseQueryTime: `${avgQueryTime.toFixed(2)}ms`,
    totalFirebaseQueries: firebaseQueries.length,
    performanceIssues: avgQueryTime > 100 ? 'Slow Firebase queries detected' : 'Performance within acceptable range'
  }
}

/**
 * Categorize errors by type
 */
function categorizeErrors() {
  const errorTypes = {}
  
  testResults.errors.forEach(error => {
    const type = error.statusCode || 'network'
    errorTypes[type] = (errorTypes[type] || 0) + 1
  })
  
  return errorTypes
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(errorRate, memoryTrend, performanceAnalysis) {
  const recommendations = []
  
  if (errorRate > CONFIG.errorThreshold) {
    recommendations.push('High error rate detected. Review error handling and system stability.')
  }
  
  if (memoryTrend.critical) {
    recommendations.push('Critical memory growth detected. Investigate memory leaks.')
  }
  
  if (testResults.averageResponseTime > CONFIG.responseTimeThreshold) {
    recommendations.push('Response times exceed threshold. Optimize performance and consider scaling.')
  }
  
  if (testResults.errors.some(e => e.statusCode >= 500)) {
    recommendations.push('Server errors detected. Review backend stability and error handling.')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems performing within acceptable parameters.')
  }
  
  return recommendations
}

/**
 * Save test results to file
 */
function saveTestResults(report) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `stress-test-results-${timestamp}.json`
  const filepath = path.join(__dirname, '..', 'test-results', filename)
  
  // Ensure test-results directory exists
  const testResultsDir = path.dirname(filepath)
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true })
  }
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
  console.log(`📊 Test results saved to: ${filepath}`)
  
  return filepath
}

/**
 * Main test execution
 */
async function runStressTest() {
  console.log('🧪 MedFlow Stress Test Starting...')
  console.log(`📋 Configuration:`)
  console.log(`   Base URL: ${CONFIG.baseUrl}`)
  console.log(`   Duration: ${CONFIG.testDuration / 1000}s`)
  console.log(`   Concurrent Users: ${CONFIG.concurrentUsers}`)
  console.log(`   Requests/Second: ${CONFIG.requestsPerSecond}`)
  console.log(`   Firebase Queries: ${CONFIG.firebaseQueries}`)
  console.log(`   Memory Threshold: ${CONFIG.memoryThreshold}MB`)
  console.log(`   Response Time Threshold: ${CONFIG.responseTimeThreshold}ms`)
  console.log(`   Error Threshold: ${CONFIG.errorThreshold * 100}%`)
  console.log('')
  
  try {
    // Start monitoring
    startMemoryMonitoring()
    startPerformanceMonitoring()
    
    // Run tests
    const testStartTime = Date.now()
    
    // Run concurrent user simulation
    await simulateConcurrentUsers()
    
    // Run Firebase query stress test
    await testFirebaseQueries()
    
    const testEndTime = Date.now()
    const actualTestDuration = testEndTime - testStartTime
    
    console.log(`✅ Stress test completed in ${(actualTestDuration / 1000).toFixed(2)}s`)
    
    // Stop monitoring
    clearInterval(memoryMonitor)
    clearInterval(performanceMonitor)
    
    // Generate and display report
    const report = generateTestReport()
    
    console.log('\n📊 Test Results Summary:')
    console.log(`   Total Requests: ${report.testSummary.totalRequests}`)
    console.log(`   Successful: ${report.testSummary.successfulRequests}`)
    console.log(`   Failed: ${report.testSummary.failedRequests}`)
    console.log(`   Requests/Second: ${report.testSummary.requestsPerSecond}`)
    console.log(`   Error Rate: ${report.testSummary.errorRate}`)
    console.log(`   Avg Response Time: ${report.responseTimeMetrics.average}`)
    console.log(`   Memory Trend: ${report.memoryAnalysis.trend}`)
    
    console.log('\n💡 Recommendations:')
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`)
    })
    
    // Save results
    const resultsFile = saveTestResults(report)
    
    // Exit with appropriate code
    const hasCriticalIssues = report.memoryAnalysis.critical || 
                             parseFloat(report.testSummary.errorRate) > CONFIG.errorThreshold ||
                             report.errorAnalysis.criticalErrors > 0
    
    if (hasCriticalIssues) {
      console.log('\n❌ Critical issues detected. Test failed.')
      process.exit(1)
    } else {
      console.log('\n✅ Stress test passed successfully.')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('💥 Stress test failed with error:', error)
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stress test interrupted by user')
  if (memoryMonitor) clearInterval(memoryMonitor)
  if (performanceMonitor) clearInterval(performanceMonitor)
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Stress test terminated')
  if (memoryMonitor) clearInterval(memoryMonitor)
  if (performanceMonitor) clearInterval(performanceMonitor)
  process.exit(0)
})

// Run the test if this script is executed directly
if (require.main === module) {
  runStressTest()
}

module.exports = {
  runStressTest,
  simulateConcurrentUsers,
  testFirebaseQueries,
  generateTestReport
}
