/**
 * Automated Tests for International Phone Validation Utility
 * 
 * Tests basic phone validation as per requirements:
 * - International phone support with country prefix dropdown
 * - Basic format validation
 * - Country code selection
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { 
  COUNTRIES, 
  DEFAULT_COUNTRY, 
  findCountryByCode, 
  findCountryByDialCode, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  sanitizePhoneNumber, 
  extractCountryCode 
} from '../phoneValidation'

describe('Phone Validation Utility', () => {
  describe('COUNTRIES constant', () => {
    test('should have Romania as first country', () => {
      expect(COUNTRIES[0].code).toBe('RO')
      expect(COUNTRIES[0].name).toBe('România')
      expect(COUNTRIES[0].dialCode).toBe('+40')
      expect(COUNTRIES[0].flag).toBe('🇷🇴')
    })

    test('should have multiple countries for dropdown selection', () => {
      expect(COUNTRIES.length).toBeGreaterThanOrEqual(20)
    })

    test('all countries should have required properties for dropdown', () => {
      COUNTRIES.forEach(country => {
        expect(country).toHaveProperty('code')
        expect(country).toHaveProperty('name')
        expect(country).toHaveProperty('dialCode')
        expect(country).toHaveProperty('flag')
        expect(country).toHaveProperty('format')
        expect(country).toHaveProperty('placeholder')
      })
    })
  })

  describe('DEFAULT_COUNTRY', () => {
    test('should be Romania', () => {
      expect(DEFAULT_COUNTRY.code).toBe('RO')
      expect(DEFAULT_COUNTRY.name).toBe('România')
      expect(DEFAULT_COUNTRY.dialCode).toBe('+40')
    })
  })

  describe('findCountryByCode', () => {
    test('should find Romania by code', () => {
      const country = findCountryByCode('RO')
      expect(country).toBeDefined()
      expect(country?.code).toBe('RO')
      expect(country?.name).toBe('România')
    })

    test('should find United States by code', () => {
      const country = findCountryByCode('US')
      expect(country).toBeDefined()
      expect(country?.code).toBe('US')
      expect(country?.name).toBe('United States')
    })

    test('should return undefined for non-existent code', () => {
      const country = findCountryByCode('XX')
      expect(country).toBeUndefined()
    })
  })

  describe('findCountryByDialCode', () => {
    test('should find Romania by dial code', () => {
      const country = findCountryByDialCode('+40')
      expect(country).toBeDefined()
      expect(country?.code).toBe('RO')
      expect(country?.dialCode).toBe('+40')
    })

    test('should find United States by dial code', () => {
      const country = findCountryByDialCode('+1')
      expect(country).toBeDefined()
      expect(country?.code).toBe('US')
      expect(country?.dialCode).toBe('+1')
    })
  })

  describe('validatePhoneNumber', () => {
    describe('Valid phone numbers', () => {
      test('should validate Romanian phone number', () => {
        const result = validatePhoneNumber('+40 712 345 678', COUNTRIES[0])
        expect(result.isValid).toBe(true)
        expect(result.formattedNumber).toBeDefined()
        expect(result.countryInfo).toBeDefined()
      })

      test('should validate US phone number', () => {
        const usCountry = findCountryByCode('US')!
        const result = validatePhoneNumber('+1 (555) 123-4567', usCountry)
        expect(result.isValid).toBe(true)
        expect(result.formattedNumber).toBeDefined()
      })

      test('should validate phone number with spaces and separators', () => {
        const result = validatePhoneNumber('+40 712-345.678', COUNTRIES[0])
        expect(result.isValid).toBe(true)
      })
    })

    describe('Invalid phone numbers', () => {
      test('should reject empty phone number', () => {
        const result = validatePhoneNumber('', COUNTRIES[0])
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('Numărul de telefon și informațiile despre țară sunt obligatorii')
      })

      test('should reject phone number with letters', () => {
        const result = validatePhoneNumber('+40 712abc456', COUNTRIES[0])
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('Numărul de telefon poate conține doar cifre, spații și separatori')
      })

      test('should reject phone number without country info', () => {
        const result = validatePhoneNumber('+40 712 345 678', null as any)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe('Numărul de telefon și informațiile despre țară sunt obligatorii')
      })
    })
  })

  describe('formatPhoneNumber', () => {
    test('should format Romanian phone number', () => {
      const formatted = formatPhoneNumber('+40 712345678', COUNTRIES[0])
      expect(formatted).toBe('+40 712 345 678')
    })

    test('should format US phone number', () => {
      const usCountry = findCountryByCode('US')!
      const formatted = formatPhoneNumber('+1 5551234567', usCountry)
      expect(formatted).toBe('+1 (555) 123-4567')
    })

    test('should handle phone number without country code', () => {
      const formatted = formatPhoneNumber('712345678', COUNTRIES[0])
      expect(formatted).toBe('+40 712 345 678')
    })
  })

  describe('sanitizePhoneNumber', () => {
    test('should remove non-digit characters', () => {
      const sanitized = sanitizePhoneNumber('+40 (712) 345-678')
      expect(sanitized).toBe('40712345678')
    })

    test('should handle string with only digits', () => {
      const sanitized = sanitizePhoneNumber('40712345678')
      expect(sanitized).toBe('40712345678')
    })
  })

  describe('extractCountryCode', () => {
    test('should extract Romanian country code', () => {
      const countryCode = extractCountryCode('+40 712 345 678')
      expect(countryCode).toBe('+40')
    })

    test('should extract US country code', () => {
      const countryCode = extractCountryCode('+1 (555) 123-4567')
      expect(countryCode).toBe('+1')
    })

    test('should return null for phone number without country code', () => {
      const countryCode = extractCountryCode('712 345 678')
      expect(countryCode).toBeNull()
    })
  })
})
