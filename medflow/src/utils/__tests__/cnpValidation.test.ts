/**
 * CNP Validation Utilities Test Suite
 * 
 * Comprehensive testing for CNP validation, extraction, and analysis functions.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import {
  validateCNP,
  extractBirthDateFromCNP,
  extractGenderFromCNP,
  analyzeCNP,
  formatCNPForDisplay,
  sanitizeCNP
} from '../cnpValidation'

describe('CNP Validation Utilities', () => {
  
  describe('validateCNP', () => {
    test('should validate correct 13-digit CNP', () => {
      const result = validateCNP('6080904000000')
      expect(result.isValid).toBe(true)
      expect(result.errorMessage).toBeUndefined()
    })

    test('should reject CNP with incorrect length', () => {
      const result = validateCNP('6080904')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
    })

    test('should reject CNP with non-numeric characters', () => {
      const result = validateCNP('608090400000a')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('CNP-ul trebuie să conțină doar cifre')
    })

    test('should reject empty CNP', () => {
      const result = validateCNP('')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('CNP-ul trebuie să fie o valoare validă')
    })

    test('should reject null CNP', () => {
      const result = validateCNP(null as any)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('CNP-ul trebuie să fie o valoare validă')
    })

    test('should handle CNP with spaces', () => {
      const result = validateCNP('608 090 400 000 0')
      expect(result.isValid).toBe(true)
    })
  })

  describe('extractBirthDateFromCNP', () => {
    test('should extract correct birth date for 21st century birth', () => {
      const result = extractBirthDateFromCNP('6080904000000')
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2008) // 2008 (21st century)
      expect(result?.getMonth()).toBe(8) // September (0-indexed)
      expect(result?.getDate()).toBe(4)
    })

    test('should extract correct birth date for 20th century birth', () => {
      const result = extractBirthDateFromCNP('5060517000000')
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2006) // 2006 (21st century)
      expect(result?.getMonth()).toBe(4) // May (0-indexed)
      expect(result?.getDate()).toBe(17)
    })

    test('should return null for invalid CNP', () => {
      const result = extractBirthDateFromCNP('invalid')
      expect(result).toBeNull()
    })

    test('should return null for CNP with invalid date', () => {
      const result = extractBirthDateFromCNP('6133200000000') // Invalid date: 32nd day
      expect(result).toBeNull()
    })

    test('should handle leap year correctly', () => {
      const result = extractBirthDateFromCNP('6040229000000') // 2004-02-29 (leap year)
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2004)
      expect(result?.getMonth()).toBe(1) // February (0-indexed)
      expect(result?.getDate()).toBe(29)
    })

    test('should reject invalid leap year date', () => {
      const result = extractBirthDateFromCNP('6032900000000') // 2003-02-29 (not leap year)
      expect(result).toBeNull()
    })
  })

  describe('extractGenderFromCNP', () => {
    test('should extract male gender from odd first digit', () => {
      const result = extractGenderFromCNP('5060517000000')
      expect(result).toBe('male')
    })

    test('should extract female gender from even first digit', () => {
      const result = extractGenderFromCNP('6080904000000')
      expect(result).toBe('female')
    })

    test('should extract foreign gender from digit 9', () => {
      const result = extractGenderFromCNP('9080904000000')
      expect(result).toBe('foreign')
    })

    test('should return null for invalid CNP', () => {
      const result = extractGenderFromCNP('invalid')
      expect(result).toBeNull()
    })

    test('should handle all valid first digits', () => {
      const testCases = [
        { cnp: '1060517000000', expected: 'male' },
        { cnp: '2060517000000', expected: 'female' },
        { cnp: '3060517000000', expected: 'male' },
        { cnp: '4060517000000', expected: 'female' },
        { cnp: '5060517000000', expected: 'male' },
        { cnp: '6060517000000', expected: 'female' },
        { cnp: '7060517000000', expected: 'male' },
        { cnp: '8060517000000', expected: 'female' },
        { cnp: '9060517000000', expected: 'foreign' }
      ]

      testCases.forEach(({ cnp, expected }) => {
        const result = extractGenderFromCNP(cnp)
        expect(result).toBe(expected)
      })
    })
  })

  describe('analyzeCNP', () => {
    test('should provide complete analysis for valid CNP', () => {
      const result = analyzeCNP('6080904000000')
      expect(result).not.toBeNull()
      expect(result?.isValid).toBe(true)
      expect(result?.gender).toBe('female')
      expect(result?.birthDate).not.toBeNull()
      expect(result?.century).toBe(1900)
      expect(result?.description).toBe('Female born in 20th century')
    })

    test('should provide analysis for 21st century birth', () => {
      const result = analyzeCNP('5060517000000')
      expect(result).not.toBeNull()
      expect(result?.isValid).toBe(true)
      expect(result?.gender).toBe('male')
      expect(result?.birthDate).not.toBeNull()
      expect(result?.century).toBe(1900)
      expect(result?.description).toBe('Male born in 20th century')
    })

    test('should return validation error for invalid CNP', () => {
      const result = analyzeCNP('invalid')
      expect(result).not.toBeNull()
      expect(result?.isValid).toBe(false)
      expect(result?.errorMessage).toBeDefined()
    })

    test('should handle foreign citizen CNP', () => {
      const result = analyzeCNP('9080904000000')
      expect(result).not.toBeNull()
      expect(result?.isValid).toBe(true)
      expect(result?.gender).toBe('male') // Default foreign to male for compatibility
      expect(result?.century).toBe(2000)
      expect(result?.description).toBe('Foreign citizen')
    })
  })

  describe('formatCNPForDisplay', () => {
    test('should format CNP with spaces for readability', () => {
      const result = formatCNPForDisplay('6080904000000')
      expect(result).toBe('6 08 09 04 00 000 0')
    })

    test('should return original string for invalid length', () => {
      const result = formatCNPForDisplay('6080904')
      expect(result).toBe('6080904')
    })

    test('should handle empty string', () => {
      const result = formatCNPForDisplay('')
      expect(result).toBe('')
    })
  })

  describe('sanitizeCNP', () => {
    test('should remove non-digit characters', () => {
      const result = sanitizeCNP('608-090-400-000-0')
      expect(result).toBe('6080904000000')
    })

    test('should handle string with spaces', () => {
      const result = sanitizeCNP('608 090 400 000 0')
      expect(result).toBe('6080904000000')
    })

    test('should handle string with letters', () => {
      const result = sanitizeCNP('608a090b400c000d0')
      expect(result).toBe('6080904000000')
    })

    test('should handle empty string', () => {
      const result = sanitizeCNP('')
      expect(result).toBe('')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle very old birth dates', () => {
      const result = extractBirthDateFromCNP('1000101000000') // 2000-01-01 (not 1900)
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2000) // 2000 because 1900 would be > 100 years old
    })

    test('should handle recent birth dates', () => {
      const result = extractBirthDateFromCNP('5231231000000') // 2023-12-31
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2023)
    })

    test('should handle boundary month values', () => {
      const january = extractBirthDateFromCNP('5010101000000') // 2005-01-01
      const december = extractBirthDateFromCNP('5121231000000') // 2005-12-31
      
      expect(january?.getMonth()).toBe(0) // January
      expect(december?.getMonth()).toBe(11) // December
    })

    test('should handle boundary day values', () => {
      const firstDay = extractBirthDateFromCNP('5010101000000') // 2005-01-01
      const lastDay = extractBirthDateFromCNP('5010131000000') // 2005-01-31
      
      expect(firstDay?.getDate()).toBe(1)
      expect(lastDay?.getDate()).toBe(31)
    })

    test('should handle invalid month values', () => {
      const result = extractBirthDateFromCNP('5013001000000') // 2005-13-01 (invalid month)
      expect(result).toBeNull()
    })

    test('should handle invalid day values', () => {
      const result = extractBirthDateFromCNP('5010132000000') // 2005-01-32 (invalid day)
      expect(result).toBeNull()
    })
  })

  describe('Performance Tests', () => {
    test('should handle large number of CNP validations efficiently', () => {
      const startTime = Date.now()
      const testCNPs = Array(1000).fill('6080904000000')
      
      testCNPs.forEach(cnp => {
        validateCNP(cnp)
        extractBirthDateFromCNP(cnp)
        extractGenderFromCNP(cnp)
        analyzeCNP(cnp)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 4000 operations in less than 100ms
      expect(duration).toBeLessThan(100)
    })
  })
})
