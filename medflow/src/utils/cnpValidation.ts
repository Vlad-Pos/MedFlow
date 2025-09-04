/**
 * Romanian CNP (Cod Numeric Personal) Validation Utility
 * 
 * Provides basic validation for Romanian CNP numbers as per requirements:
 * - Simple 13-digit format validation only
 * - No complex birth date, gender, or county validation needed
 * 
 * @author MedFlow Team
 * @version 1.0
 */

/**
 * Romanian CNP validation result
 */
export interface CNPValidationResult {
  isValid: boolean
  errorMessage?: string
  birthDate?: Date
  gender?: 'male' | 'female'
  county?: string
  century?: number
  description?: string
}

/**
 * Romanian counties mapping for CNP validation
 */
const ROMANIAN_COUNTIES: Record<string, string> = {
  '01': 'Alba',
  '02': 'Arad',
  '03': 'Argeș',
  '04': 'Bacău',
  '05': 'Bihor',
  '06': 'Bistrița-Năsăud',
  '07': 'Botoșani',
  '08': 'Brăila',
  '09': 'Brașov',
  '10': 'București',
  '11': 'Buzău',
  '12': 'Călărași',
  '13': 'Caraș-Severin',
  '14': 'Cluj',
  '15': 'Constanța',
  '16': 'Covasna',
  '17': 'Dâmbovița',
  '18': 'Dolj',
  '19': 'Galați',
  '20': 'Gorj',
  '21': 'Harghita',
  '22': 'Hunedoara',
  '23': 'Ialomița',
  '24': 'Iași',
  '25': 'Ilfov',
  '26': 'Maramureș',
  '27': 'Mehedinți',
  '28': 'Mureș',
  '29': 'Neamț',
  '30': 'Olt',
  '31': 'Prahova',
  '32': 'Sălaj',
  '33': 'Satu Mare',
  '34': 'Sibiu',
  '35': 'Suceava',
  '36': 'Teleorman',
  '37': 'Timiș',
  '38': 'Tulcea',
  '39': 'Vâlcea',
  '40': 'Vaslui',
  '41': 'Vrancea',
  '42': 'București (Sector 1)',
  '43': 'București (Sector 2)',
  '44': 'București (Sector 3)',
  '45': 'București (Sector 4)',
  '46': 'București (Sector 5)',
  '47': 'București (Sector 6)',
  '51': 'Călărași',
  '52': 'Giurgiu'
}

/**
 * Validates Romanian CNP format - SIMPLE 13-digit validation only
 * @param cnp - The CNP string to validate
 * @returns CNPValidationResult with validation status
 */
export function validateCNP(cnp: string): CNPValidationResult {
  // Basic format validation
  if (!cnp || typeof cnp !== 'string') {
    return {
      isValid: false,
      errorMessage: 'CNP-ul trebuie să fie o valoare validă'
    }
  }

  // Remove any spaces or special characters
  const cleanCNP = cnp.replace(/\s/g, '')

  // Check length - SIMPLE 13-digit requirement only
  if (cleanCNP.length !== 13) {
    return {
      isValid: false,
      errorMessage: 'CNP-ul trebuie să aibă exact 13 cifre'
    }
  }

  // Check if all characters are digits - SIMPLE digit requirement only
  if (!/^\d{13}$/.test(cleanCNP)) {
    return {
      isValid: false,
      errorMessage: 'CNP-ul trebuie să conțină doar cifre'
    }
  }

  // If we get here, the CNP is valid (13 digits, all numeric)
  // No complex validation needed as per requirements
  return {
    isValid: true
  }
}

/**
 * CNP Century mapping with realistic age considerations
 */
const CNP_CENTURY_MAPPING = {
  // 20th Century (1900s) - for older patients
  1: { century: 1900, gender: 'male', description: 'Male born in 20th century' },
  2: { century: 1900, gender: 'female', description: 'Female born in 20th century' },
  3: { century: 1900, gender: 'male', description: 'Male born in 20th century' },
  4: { century: 1900, gender: 'female', description: 'Female born in 20th century' },
  5: { century: 1900, gender: 'male', description: 'Male born in 20th century' },
  6: { century: 1900, gender: 'female', description: 'Female born in 20th century' },
  7: { century: 1900, gender: 'male', description: 'Male born in 20th century' },
  8: { century: 1900, gender: 'female', description: 'Female born in 20th century' },
  
  // 21st Century (2000s) - for younger patients
  9: { century: 2000, gender: 'foreign', description: 'Foreign citizen' }
}

/**
 * Extracts birth date from CNP with enhanced century detection
 * @param cnp - The CNP string
 * @returns Date object or null if extraction fails
 */
export function extractBirthDateFromCNP(cnp: string): Date | null {
  try {
    const result = validateCNP(cnp)
    if (!result.isValid) return null
    
    const cleanCNP = cnp.replace(/\s/g, '')
    if (cleanCNP.length !== 13) return null
    
    const firstDigit = parseInt(cleanCNP.substring(0, 1))
    const yearCode = parseInt(cleanCNP.substring(1, 3))
    const monthCode = parseInt(cleanCNP.substring(3, 5))
    const dayCode = parseInt(cleanCNP.substring(5, 7))
    
    // Determine century based on first digit and realistic age
    let century = 1900 // Default to 20th century
    
    if (firstDigit === 9) {
      century = 2000 // 21st century for foreign citizens
    } else {
      // For digits 1-8, determine century based on realistic age
      const currentYear = new Date().getFullYear()
      const ageIn20th = currentYear - (1900 + yearCode)
      const ageIn21st = currentYear - (2000 + yearCode)
      
      // Choose century that results in more realistic age (0-100 years)
      // If 20th century would result in age > 100, use 21st century
      if (ageIn20th > 100) {
        century = 2000 // Use 21st century for very old dates
      } else if (ageIn21st >= 0 && ageIn21st <= 100 && ageIn21st < ageIn20th) {
        century = 2000 // Use 21st century for recent dates
      }
    }
    
    const year = century + yearCode
    const month = monthCode - 1 // JavaScript months are 0-indexed
    const day = dayCode
    
    // Validate the date
    const birthDate = new Date(year, month, day)
    if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
      return null // Invalid date
    }
    
    return birthDate
  } catch {
    return null
  }
}

/**
 * Extracts gender from CNP first digit
 * @param cnp - The CNP string
 * @returns Gender or null if extraction fails
 */
export function extractGenderFromCNP(cnp: string): 'male' | 'female' | 'foreign' | null {
  try {
    const result = validateCNP(cnp)
    if (!result.isValid) return null
    
    const cleanCNP = cnp.replace(/\s/g, '')
    if (cleanCNP.length !== 13) return null
    
    const firstDigit = parseInt(cleanCNP.substring(0, 1))
    
    if (firstDigit === 9) {
      return 'foreign'
    } else if (firstDigit % 2 === 0) {
      return 'female'
    } else {
      return 'male'
    }
  } catch {
    return null
  }
}

/**
 * Comprehensive CNP analysis with all extracted information
 * @param cnp - The CNP string
 * @returns Complete CNP analysis or null if analysis fails
 */
export function analyzeCNP(cnp: string): CNPValidationResult | null {
  try {
    const result = validateCNP(cnp)
    if (!result.isValid) return result
    
    const cleanCNP = cnp.replace(/\s/g, '')
    const firstDigit = parseInt(cleanCNP.substring(0, 1))
    
    // Extract birth date and gender
    const birthDate = extractBirthDateFromCNP(cnp)
    const gender = extractGenderFromCNP(cnp)
    
    if (!birthDate || !gender) return result
    
    // Get century mapping
    const mapping = CNP_CENTURY_MAPPING[firstDigit as keyof typeof CNP_CENTURY_MAPPING]
    
    return {
      ...result,
      birthDate,
      gender: gender === 'foreign' ? 'male' : gender, // Default foreign to male for compatibility
      century: mapping?.century || 1900,
      description: mapping?.description || 'Unknown'
    }
  } catch {
    return null
  }
}

/**
 * Formats CNP for display (adds spaces for readability)
 * @param cnp - The CNP string
 * @returns Formatted CNP string
 */
export function formatCNPForDisplay(cnp: string): string {
  if (!cnp || cnp.length !== 13) return cnp
  
  return `${cnp.substring(0, 1)} ${cnp.substring(1, 3)} ${cnp.substring(3, 5)} ${cnp.substring(5, 7)} ${cnp.substring(7, 9)} ${cnp.substring(9, 12)} ${cnp.substring(12)}`
}

/**
 * Sanitizes CNP input by removing non-digit characters
 * @param cnp - The CNP input string
 * @returns Cleaned CNP string
 */
export function sanitizeCNP(cnp: string): string {
  return cnp.replace(/\D/g, '')
}
