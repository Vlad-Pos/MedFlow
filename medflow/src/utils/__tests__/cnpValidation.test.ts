/**
 * Automated Tests for Romanian CNP Validation Utility
 * 
 * Tests basic CNP validation as per requirements:
 * - Simple 13-digit format validation only
 * - No complex birth date, gender, or county validation needed
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  validateCNP, 
  extractBirthDateFromCNP, 
  formatCNPForDisplay, 
  sanitizeCNP 
} from '../cnpValidation'

describe('CNP Validation Utility', () => {
  describe('validateCNP', () => {
    describe('Valid CNP Numbers (13 digits only)', () => {
      test('should validate CNP with exactly 13 digits', () => {
        const result = validateCNP('1234567890123')
        expect(result.isValid).toBe(true)
      })

      test('should validate CNP with spaces (13 digits)', () => {
        const result = validateCNP('123 456 789 0123')
        expect(result.isValid).toBe(true)
      })

      test('should validate CNP with any 13 digits', () => {
        const result = validateCNP('1111111111111')
        expect(result.isValid).toBe(true)
      })

      test('should validate CNP with zeros', () => {
        const result = validateCNP('0000000000000')
        expect(result.isValid).toBe(true)
      })
    })

    describe('Invalid CNP Numbers', () => {
      test('should reject CNP with less than 13 digits', () => {
        const result = validateCNP('123456789012')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
      })

      test('should reject CNP with more than 13 digits', () => {
        const result = validateCNP('12345678901234')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
      })

      test('should reject CNP with non-digit characters', () => {
        const result = validateCNP('123abc789def')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
      })

      test('should reject CNP with special characters', () => {
        const result = validateCNP('123-456-789-012')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
      })
    })

    describe('Edge Cases', () => {
      test('should handle empty string', () => {
        const result = validateCNP('')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să fie o valoare validă')
      })

      test('should handle null input', () => {
        const result = validateCNP(null as any)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să fie o valoare validă')
      })

      test('should handle undefined input', () => {
        const result = validateCNP(undefined as any)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să fie o valoare validă')
      })

      test('should handle whitespace-only input', () => {
        const result = validateCNP('   ')
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('CNP-ul trebuie să aibă exact 13 cifre')
      })
    })
  })

  describe('extractBirthDateFromCNP', () => {
    test('should extract birth date from valid CNP', () => {
      const birthDate = extractBirthDateFromCNP('1234567890123')
      expect(birthDate).toBeInstanceOf(Date)
    })

    test('should return null for invalid CNP', () => {
      const birthDate = extractBirthDateFromCNP('123456789012')
      expect(birthDate).toBeNull()
    })

    test('should handle malformed CNP gracefully', () => {
      const birthDate = extractBirthDateFromCNP('invalid')
      expect(birthDate).toBeNull()
    })
  })

  describe('formatCNPForDisplay', () => {
    test('should format CNP with spaces for readability', () => {
      const formatted = formatCNPForDisplay('1234567890123')
      expect(formatted).toBe('1 23 45 67 89 012 3')
    })

    test('should return original string if not 13 digits', () => {
      const formatted = formatCNPForDisplay('123456789012')
      expect(formatted).toBe('123456789012')
    })

    test('should handle empty string', () => {
      const formatted = formatCNPForDisplay('')
      expect(formatted).toBe('')
    })
  })

  describe('sanitizeCNP', () => {
    test('should remove non-digit characters', () => {
      const sanitized = sanitizeCNP('123-456 789.0123')
      expect(sanitized).toBe('1234567890123')
    })

    test('should handle string with only digits', () => {
      const sanitized = sanitizeCNP('1234567890123')
      expect(sanitized).toBe('1234567890123')
    })

    test('should handle empty string', () => {
      const sanitized = sanitizeCNP('')
      expect(sanitized).toBe('')
    })

    test('should handle string with only non-digits', () => {
      const sanitized = sanitizeCNP('abc-def.ghi')
      expect(sanitized).toBe('')
    })
  })
})
