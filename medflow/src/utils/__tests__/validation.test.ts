/**
 * Automated Tests for Enhanced Validation Utility
 * 
 * Tests all validation functions including:
 * - Basic validation rules
 * - CNP validation
 * - Phone validation
 * - Email validation
 * - Field validation
 * - Error handling
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  validationRules, 
  validateField, 
  validateEmail, 
  validatePassword, 
  validatePatientName, 
  validateSymptoms, 
  validateDateTime, 
  validateCNP, 
  validatePhoneNumber 
} from '../validation'

describe('Enhanced Validation Utility', () => {
  describe('validationRules', () => {
    describe('required', () => {
      test('should return true for non-empty string', () => {
        expect(validationRules.required('test')).toBe(true)
        expect(validationRules.required('  test  ')).toBe(true)
        expect(validationRules.required('123')).toBe(true)
      })

      test('should return false for empty string', () => {
        expect(validationRules.required('')).toBe(false)
        expect(validationRules.required('   ')).toBe(false)
      })
    })

    describe('email', () => {
      test('should return true for valid emails', () => {
        expect(validationRules.email('test@example.com')).toBe(true)
        expect(validationRules.email('user.name+tag@domain.co.uk')).toBe(true)
        expect(validationRules.email('123@456.789')).toBe(true)
      })

      test('should return false for invalid emails', () => {
        expect(validationRules.email('test@')).toBe(false)
        expect(validationRules.email('@example.com')).toBe(false)
        expect(validationRules.email('test.example.com')).toBe(false)
        expect(validationRules.email('')).toBe(false)
      })
    })

    describe('minLength', () => {
      test('should return true for strings with sufficient length', () => {
        const minLength5 = validationRules.minLength(5)
        expect(minLength5('12345')).toBe(true)
        expect(minLength5('123456')).toBe(true)
      })

      test('should return false for strings that are too short', () => {
        const minLength5 = validationRules.minLength(5)
        expect(minLength5('1234')).toBe(false)
        expect(minLength5('')).toBe(false)
      })
    })

    describe('maxLength', () => {
      test('should return true for strings within length limit', () => {
        const maxLength5 = validationRules.maxLength(5)
        expect(maxLength5('12345')).toBe(true)
        expect(maxLength5('1234')).toBe(true)
        expect(maxLength5('')).toBe(true)
      })

      test('should return false for strings that are too long', () => {
        const maxLength5 = validationRules.maxLength(5)
        expect(maxLength5('123456')).toBe(false)
      })
    })

    describe('phone', () => {
      test('should return true for valid phone numbers', () => {
        expect(validationRules.phone('+40 712 345 678')).toBe(true)
        expect(validationRules.phone('(555) 123-4567')).toBe(true)
        expect(validationRules.phone('712345678')).toBe(true)
        expect(validationRules.phone('+1 555 123 4567')).toBe(true)
      })

      test('should return false for invalid phone numbers', () => {
        expect(validationRules.phone('abc')).toBe(false)
        expect(validationRules.phone('123')).toBe(false) // Too short
        expect(validationRules.phone('')).toBe(false)
      })
    })

    describe('cnp', () => {
      test('should return true for valid CNP format', () => {
        expect(validationRules.cnp('1234567890123')).toBe(true)
        expect(validationRules.cnp('123 456 789 0123')).toBe(true)
        expect(validationRules.cnp('123-456-789-0123')).toBe(true)
      })

      test('should return false for invalid CNP format', () => {
        expect(validationRules.cnp('123456789012')).toBe(false) // Too short
        expect(validationRules.cnp('12345678901234')).toBe(false) // Too long
        expect(validationRules.cnp('123abc789def')).toBe(false) // Contains letters
        expect(validationRules.cnp('')).toBe(false)
      })
    })

    describe('date', () => {
      test('should return true for valid dates', () => {
        expect(validationRules.date('2024-01-15')).toBe(true)
        expect(validationRules.date('2024/01/15')).toBe(true)
        expect(validationRules.date('01/15/2024')).toBe(true)
      })

      test('should return false for invalid dates', () => {
        expect(validationRules.date('invalid')).toBe(false)
        expect(validationRules.date('2024-13-45')).toBe(false)
        expect(validationRules.date('')).toBe(false)
      })
    })

    describe('futureDate', () => {
      test('should return true for future dates', () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        expect(validationRules.futureDate(tomorrow.toISOString().split('T')[0])).toBe(true)
      })

      test('should return false for past dates', () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        expect(validationRules.futureDate(yesterday.toISOString().split('T')[0])).toBe(false)
      })

      test('should return false for today', () => {
        const today = new Date().toISOString().split('T')[0]
        expect(validationRules.futureDate(today)).toBe(false)
      })
    })

    describe('alphanumeric', () => {
      test('should return true for alphanumeric strings', () => {
        expect(validationRules.alphanumeric('abc123')).toBe(true)
        expect(validationRules.alphanumeric('ABC 123')).toBe(true)
        expect(validationRules.alphanumeric('123')).toBe(true)
        expect(validationRules.alphanumeric('abc')).toBe(true)
      })

      test('should return false for strings with special characters', () => {
        expect(validationRules.alphanumeric('abc@123')).toBe(false)
        expect(validationRules.alphanumeric('abc-123')).toBe(false)
        expect(validationRules.alphanumeric('abc.123')).toBe(false)
      })
    })

    describe('noSpecialChars', () => {
      test('should return true for strings without special characters', () => {
        expect(validationRules.noSpecialChars('abc123')).toBe(true)
        expect(validationRules.noSpecialChars('ABC 123')).toBe(true)
        expect(validationRules.noSpecialChars('')).toBe(true)
      })

      test('should return false for strings with special characters', () => {
        expect(validationRules.noSpecialChars('abc<123')).toBe(false)
        expect(validationRules.noSpecialChars('abc>123')).toBe(false)
        expect(validationRules.noSpecialChars('abc"123')).toBe(false)
        expect(validationRules.noSpecialChars('abc\'123')).toBe(false)
        expect(validationRules.noSpecialChars('abc&123')).toBe(false)
      })
    })
  })

  describe('validateField', () => {
    test('should return valid result for valid input', () => {
      const rules = [
        { test: validationRules.required, message: 'Field is required' },
        { test: validationRules.minLength(3), message: 'Minimum 3 characters' }
      ]
      
      const result = validateField('test', rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result with errors for invalid input', () => {
      const rules = [
        { test: validationRules.required, message: 'Field is required' },
        { test: validationRules.minLength(5), message: 'Minimum 5 characters' }
      ]
      
      const result = validateField('test', rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Minimum 5 characters')
    })

    test('should handle multiple validation failures', () => {
      const rules = [
        { test: validationRules.required, message: 'Field is required' },
        { test: validationRules.minLength(5), message: 'Minimum 5 characters' },
        { test: validationRules.maxLength(10), message: 'Maximum 10 characters' }
      ]
      
      const result = validateField('', rules)
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Field is required')
    })
  })

  describe('validateEmail', () => {
    test('should return valid result for valid email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for invalid email', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errorMessage).toBe('Email-ul nu este valid')
    })

    test('should return invalid result for empty email', () => {
      const result = validateEmail('')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Email-ul este obligatoriu')
    })

    test('should return invalid result for email that is too long', () => {
      const longEmail = 'a'.repeat(255) + '@example.com'
      const result = validateEmail(longEmail)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Email-ul este prea lung')
    })
  })

  describe('validatePassword', () => {
    test('should return valid result for valid password', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for password that is too short', () => {
      const result = validatePassword('123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Parola trebuie să aibă cel puțin 8 caractere')
    })

    test('should return invalid result for empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Parola este obligatorie')
    })
  })

  describe('validatePatientName', () => {
    test('should return valid result for valid patient name', () => {
      const result = validatePatientName('Ion Popescu')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for name that is too short', () => {
      const result = validatePatientName('A')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Numele trebuie să aibă cel puțin 2 caractere')
    })

    test('should return invalid result for name that is too long', () => {
      const longName = 'A'.repeat(101)
      const result = validatePatientName(longName)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Numele este prea lung')
    })

    test('should return invalid result for name with special characters', () => {
      const result = validatePatientName('Ion@Popescu')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      // Check for the actual error message from the implementation
      expect(result.errors[0]).toContain('caractere')
    })
  })

  describe('validateSymptoms', () => {
    test('should return valid result for valid symptoms', () => {
      const result = validateSymptoms('Dureri de cap și febră')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for symptoms that are too long', () => {
      const longSymptoms = 'A'.repeat(1001)
      const result = validateSymptoms(longSymptoms)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Descrierea simptomelor este prea lungă')
    })

    test('should return invalid result for symptoms with special characters', () => {
      const result = validateSymptoms('Dureri <script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Descrierea conține caractere nepermise')
    })
  })

  describe('validateDateTime', () => {
    test('should return valid result for valid future date time', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateTime = tomorrow.toISOString().slice(0, 16)
      
      const result = validateDateTime(dateTime)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for empty date time', () => {
      const result = validateDateTime('')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Data și ora sunt obligatorii')
    })

    test('should return invalid result for invalid date time', () => {
      const result = validateDateTime('invalid-date')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Data și ora nu sunt valide')
    })

    test('should return invalid result for past date time', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateTime = yesterday.toISOString().slice(0, 16)
      
      const result = validateDateTime(dateTime)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Data și ora trebuie să fie în viitor')
    })
  })

  describe('validateCNP', () => {
    test('should return valid result for valid CNP', () => {
      const result = validateCNP('1234567890123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for CNP that is too short', () => {
      const result = validateCNP('123456789012')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('CNP-ul trebuie să aibă exact 13 cifre')
    })

    test('should return invalid result for CNP that is too long', () => {
      const result = validateCNP('12345678901234')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('CNP-ul trebuie să aibă exact 13 cifre')
    })

    test('should return invalid result for CNP with letters', () => {
      const result = validateCNP('123abc789def')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('CNP-ul trebuie să aibă exact 13 cifre')
    })

    test('should return invalid result for empty CNP', () => {
      const result = validateCNP('')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('CNP-ul este obligatoriu')
    })
  })

  describe('validatePhoneNumber', () => {
    test('should return valid result for valid phone number', () => {
      const result = validatePhoneNumber('+40 712 345 678')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return invalid result for phone number that is too short', () => {
      const result = validatePhoneNumber('123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Numărul de telefon nu este valid')
    })

    test('should return invalid result for phone number with letters', () => {
      const result = validatePhoneNumber('abc123def')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Numărul de telefon nu este valid')
    })

    test('should return invalid result for empty phone number', () => {
      const result = validatePhoneNumber('')
      expect(result.isValid).toBe(false)
      // Multiple validation rules may fail, so we check for at least one error
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBe('Numărul de telefon este obligatoriu')
    })

    test('should return invalid result for phone number that is too long', () => {
      const longPhone = '1'.repeat(21)
      const result = validatePhoneNumber(longPhone)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('Numărul de telefon este prea lung')
    })
  })
})
