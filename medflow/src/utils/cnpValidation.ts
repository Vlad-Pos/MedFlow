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
 * Extracts birth date from CNP without full validation
 * @param cnp - The CNP string
 * @returns Date object or null if extraction fails
 */
export function extractBirthDateFromCNP(cnp: string): Date | null {
  try {
    const result = validateCNP(cnp)
    if (!result.isValid) return null
    
    // Simple extraction: take digits 2-7 (YYMMDD) and assume 1900s
    const cleanCNP = cnp.replace(/\s/g, '')
    if (cleanCNP.length !== 13) return null
    
    const yearCode = parseInt(cleanCNP.substring(1, 3))
    const monthCode = parseInt(cleanCNP.substring(3, 5))
    const dayCode = parseInt(cleanCNP.substring(5, 7))
    
    // Simple assumption: 1900s century
    const year = 1900 + yearCode
    const month = monthCode - 1 // JavaScript months are 0-indexed
    const day = dayCode
    
    return new Date(year, month, day)
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
