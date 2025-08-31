/**
 * International Phone Number Validation Utility
 * 
 * Provides comprehensive validation and formatting for international phone numbers,
 * including country code selection and format validation.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

/**
 * Country information for phone number validation
 */
export interface CountryInfo {
  code: string
  name: string
  dialCode: string
  flag: string
  format: string
  placeholder: string
}

/**
 * Phone number validation result
 */
export interface PhoneValidationResult {
  isValid: boolean
  errorMessage?: string
  formattedNumber?: string
  countryInfo?: CountryInfo
}

/**
 * Comprehensive list of countries with phone number information
 */
export const COUNTRIES: CountryInfo[] = [
  { code: 'RO', name: 'România', dialCode: '+40', flag: '🇷🇴', format: '+40 7XX XXX XXX', placeholder: '7XX XXX XXX' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '+1 (XXX) XXX-XXXX', placeholder: '(XXX) XXX-XXXX' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: '+44 7XXX XXXXXX', placeholder: '7XXX XXXXXX' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: '+49 15X XXX XXX', placeholder: '15X XXX XXX' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: '+33 6 XX XX XX XX', placeholder: '6 XX XX XX XX' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: '+39 3XX XXX XXXX', placeholder: '3XX XXX XXXX' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: '+34 6XX XXX XXX', placeholder: '6XX XXX XXX' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '+1 (XXX) XXX-XXXX', placeholder: '(XXX) XXX-XXXX' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: '+61 4XX XXX XXX', placeholder: '4XX XXX XXX' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', format: '+31 6 XX XXX XXX', placeholder: '6 XX XXX XXX' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', format: '+32 4XX XX XX XX', placeholder: '4XX XX XX XX' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', format: '+41 7X XXX XX XX', placeholder: '7X XXX XX XX' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', format: '+43 6XX XXX XXX', placeholder: '6XX XXX XXX' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', format: '+46 7X XXX XXXX', placeholder: '7X XXX XXXX' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', format: '+47 4XX XX XXX', placeholder: '4XX XX XXX' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', format: '+45 XX XX XX XX', placeholder: 'XX XX XX XX' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', format: '+358 4X XXX XXXX', placeholder: '4X XXX XXXX' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', format: '+48 5XX XXX XXX', placeholder: '5XX XXX XXX' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', format: '+420 7XX XXX XXX', placeholder: '7XX XXX XXX' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', format: '+36 20 XXX XXXX', placeholder: '20 XXX XXXX' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', format: '+421 9XX XXX XXX', placeholder: '9XX XXX XXX' },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', format: '+385 9X XXX XXX', placeholder: '9X XXX XXX' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', format: '+386 3X XXX XXX', placeholder: '3X XXX XXX' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', format: '+359 8XX XXX XXX', placeholder: '8XX XXX XXX' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', format: '+30 6XX XXX XXXX', placeholder: '6XX XXX XXXX' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', format: '+351 9XX XXX XXX', placeholder: '9XX XXX XXX' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', format: '+353 8X XXX XXXX', placeholder: '8X XXX XXXX' },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹', format: '+356 7XXX XXXX', placeholder: '7XXX XXXX' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', format: '+357 9X XXX XXX', placeholder: '9X XXX XXX' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', format: '+372 5XXX XXXX', placeholder: '5XXX XXXX' },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻', format: '+371 2XXX XXXX', placeholder: '2XXX XXXX' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹', format: '+370 6XX XXX XXX', placeholder: '6XX XXX XXX' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', format: '+7 9XX XXX XX XX', placeholder: '9XX XXX XX XX' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', format: '+380 9X XXX XXXX', placeholder: '9X XXX XXXX' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', format: '+90 5XX XXX XXXX', placeholder: '5XX XXX XXXX' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', format: '+972 5X XXX XXXX', placeholder: '5X XXX XXXX' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: '+966 5X XXX XXXX', placeholder: '5X XXX XXXX' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: '+971 5X XXX XXXX', placeholder: '5X XXX XXXX' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: '+91 9XXXX XXXXX', placeholder: '9XXXX XXXXX' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: '+86 1XX XXXX XXXX', placeholder: '1XX XXXX XXXX' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: '+81 90 XXXX XXXX', placeholder: '90 XXXX XXXX' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', format: '+82 10 XXXX XXXX', placeholder: '10 XXXX XXXX' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '+55 11 9XXXX XXXX', placeholder: '11 9XXXX XXXX' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: '+54 9 11 XXXX XXXX', placeholder: '9 11 XXXX XXXX' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: '+52 1 55 XXXX XXXX', placeholder: '1 55 XXXX XXXX' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: '+27 7X XXX XXXX', placeholder: '7X XXX XXXX' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', format: '+20 10 XXXX XXXX', placeholder: '10 XXXX XXXX' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: '+234 8XX XXX XXXX', placeholder: '8XX XXX XXXX' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: '+254 7XX XXX XXX', placeholder: '7XX XXX XXX' }
]

/**
 * Default country (Romania)
 */
export const DEFAULT_COUNTRY: CountryInfo = COUNTRIES[0]

/**
 * Finds country information by country code
 * @param countryCode - The country code (e.g., 'RO', 'US')
 * @returns CountryInfo or undefined if not found
 */
export function findCountryByCode(countryCode: string): CountryInfo | undefined {
  return COUNTRIES.find(country => country.code === countryCode.toUpperCase())
}

/**
 * Finds country information by dial code
 * @param dialCode - The dial code (e.g., '+40', '+1')
 * @returns CountryInfo or undefined if not found
 */
export function findCountryByDialCode(dialCode: string): CountryInfo | undefined {
  return COUNTRIES.find(country => country.dialCode === dialCode)
}

/**
 * Validates phone number format for a specific country
 * @param phoneNumber - The phone number to validate
 * @param countryInfo - The country information
 * @returns PhoneValidationResult with validation status
 */
export function validatePhoneNumber(phoneNumber: string, countryInfo: CountryInfo): PhoneValidationResult {
  if (!phoneNumber || !countryInfo) {
    return {
      isValid: false,
      errorMessage: 'Numărul de telefon și informațiile despre țară sunt obligatorii'
    }
  }

  // Remove country code from phone number for validation
  const numberWithoutCountry = phoneNumber.replace(countryInfo.dialCode, '').trim()
  
  if (!numberWithoutCountry) {
    return {
      isValid: false,
      errorMessage: 'Numărul de telefon nu poate fi gol'
    }
  }

  // Basic validation - check if it contains only digits, spaces, and common separators
  const cleanNumber = numberWithoutCountry.replace(/[\s\-\(\)\.]/g, '')
  
  if (!/^\d+$/.test(cleanNumber)) {
    return {
      isValid: false,
      errorMessage: 'Numărul de telefon poate conține doar cifre, spații și separatori'
    }
  }

     // Length validation based on country
   const minLength = getMinPhoneLength(countryInfo.code)
   const maxLength = getMaxPhoneLength(countryInfo.code)
  
  if (cleanNumber.length < minLength || cleanNumber.length > maxLength) {
    return {
      isValid: false,
      errorMessage: `Numărul de telefon trebuie să aibă între ${minLength} și ${maxLength} cifre`
    }
  }

  // Format the phone number
  const formattedNumber = formatPhoneNumber(phoneNumber, countryInfo)

  return {
    isValid: true,
    formattedNumber,
    countryInfo
  }
}

/**
 * Formats phone number according to country format
 * @param phoneNumber - The phone number to format
 * @param countryInfo - The country information
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phoneNumber: string, countryInfo: CountryInfo): string {
  if (!phoneNumber || !countryInfo) return phoneNumber

  // Remove country code for formatting
  const numberWithoutCountry = phoneNumber.replace(countryInfo.dialCode, '').trim()
  const cleanNumber = numberWithoutCountry.replace(/\D/g, '')

  // Apply country-specific formatting
  switch (countryInfo.code) {
    case 'RO': // Romania
      if (cleanNumber.length === 9) {
        return `${countryInfo.dialCode} ${cleanNumber.substring(0, 3)} ${cleanNumber.substring(3, 6)} ${cleanNumber.substring(6)}`
      }
      break
    case 'US': // United States
    case 'CA': // Canada
      if (cleanNumber.length === 10) {
        return `${countryInfo.dialCode} (${cleanNumber.substring(0, 3)}) ${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`
      }
      break
    case 'GB': // United Kingdom
      if (cleanNumber.length === 10) {
        return `${countryInfo.dialCode} ${cleanNumber.substring(0, 4)} ${cleanNumber.substring(4, 7)} ${cleanNumber.substring(7)}`
      }
      break
    case 'DE': // Germany
      if (cleanNumber.length === 10) {
        return `${countryInfo.dialCode} ${cleanNumber.substring(0, 3)} ${cleanNumber.substring(3, 6)} ${cleanNumber.substring(6)}`
      }
      break
    default:
      // Generic formatting for other countries
      if (cleanNumber.length >= 6) {
        const chunks = []
        let remaining = cleanNumber
        while (remaining.length > 0) {
          const chunkSize = Math.min(4, remaining.length)
          chunks.push(remaining.substring(0, chunkSize))
          remaining = remaining.substring(chunkSize)
        }
        return `${countryInfo.dialCode} ${chunks.join(' ')}`
      }
  }

  // Fallback to simple formatting
  return `${countryInfo.dialCode} ${cleanNumber}`
}

/**
 * Gets minimum phone number length for a country
 * @param countryCode - The country code
 * @returns Minimum length
 */
function getMinPhoneLength(countryCode: string): number {
  const lengths: Record<string, number> = {
    'RO': 9, 'US': 10, 'CA': 10, 'GB': 10, 'DE': 10, 'FR': 9, 'IT': 9, 'ES': 9,
    'AU': 9, 'NL': 9, 'BE': 9, 'CH': 9, 'AT': 9, 'SE': 9, 'NO': 8, 'DK': 8
  }
  return lengths[countryCode] || 7
}

/**
 * Gets maximum phone number length for a country
 * @param countryCode - The country code
 * @returns Maximum length
 */
function getMaxPhoneLength(countryCode: string): number {
  const lengths: Record<string, number> = {
    'RO': 9, 'US': 10, 'CA': 10, 'GB': 10, 'DE': 10, 'FR': 9, 'IT': 9, 'ES': 9,
    'AU': 9, 'NL': 9, 'BE': 9, 'CH': 9, 'AT': 9, 'SE': 9, 'NO': 8, 'DK': 8
  }
  return lengths[countryCode] || 15
}

/**
 * Sanitizes phone number input by removing non-digit characters
 * @param phoneNumber - The phone number input string
 * @returns Cleaned phone number string
 */
export function sanitizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '')
}

/**
 * Extracts country code from phone number
 * @param phoneNumber - The phone number
 * @returns Country code or null if not found
 */
export function extractCountryCode(phoneNumber: string): string | null {
  if (!phoneNumber || !phoneNumber.startsWith('+')) return null
  
  // Find the longest matching country code
  let longestMatch: string | null = null
  for (const country of COUNTRIES) {
    if (phoneNumber.startsWith(country.dialCode) && 
        (!longestMatch || country.dialCode.length > longestMatch.length)) {
      longestMatch = country.dialCode
    }
  }
  
  return longestMatch
}
