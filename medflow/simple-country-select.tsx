import React, { useState } from 'react'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input'

/**
 * Simple Country Selector
 * 
 * Clean, simple dropdown with all requested features:
 * - Romania first, then ascending order
 * - Grouped countries (e.g., +1 for US, CA)
 * - Keyboard search by numbers
 * - Parentheses display when open, prefix only when closed
 */
const SimpleCountrySelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get countries and group by dial code
  const countries = getCountries()
  const countryData = countries.map(country => ({
    code: country,
    dialCode: `+${getCountryCallingCode(country)}`
  }))

  // Group countries by dial code
  const grouped = countryData.reduce((acc, country) => {
    const dialCode = country.dialCode
    if (!acc[dialCode]) acc[dialCode] = []
    acc[dialCode].push(country.code)
    return acc
  }, {} as Record<string, string[]>)

  // Create options with grouping
  const options = Object.entries(grouped).map(([dialCode, countryCodes]) => {
    // Select primary country for each group
    let primaryCountry = countryCodes[0]
    if (dialCode === '+1') primaryCountry = countryCodes.find(c => c === 'US') || countryCodes[0]
    if (dialCode === '+44') primaryCountry = countryCodes.find(c => c === 'GB') || countryCodes[0]
    if (dialCode === '+49') primaryCountry = countryCodes.find(c => c === 'DE') || countryCodes[0]
    if (dialCode === '+33') primaryCountry = countryCodes.find(c => c === 'FR') || countryCodes[0]
    if (dialCode === '+39') primaryCountry = countryCodes.find(c => c === 'IT') || countryCodes[0]
    if (dialCode === '+34') primaryCountry = countryCodes.find(c => c === 'ES') || countryCodes[0]
    if (dialCode === '+7') primaryCountry = countryCodes.find(c => c === 'RU') || countryCodes[0]
    if (dialCode === '+86') primaryCountry = countryCodes.find(c => c === 'CN') || countryCodes[0]
    if (dialCode === '+91') primaryCountry = countryCodes.find(c => c === 'IN') || countryCodes[0]

    // Create display text
    let displayText = dialCode
    if (countryCodes.length === 1) {
      displayText = `${dialCode}(${countryCodes[0]})`
    } else {
      // Show max 2 important countries
      const important = countryCodes.slice(0, 2)
      displayText = `${dialCode}(${important.join(', ')})`
    }

    return {
      dialCode,
      primaryCountry,
      displayText,
      allCountries: countryCodes
    }
  })

  // Sort: Romania first, then ascending
  const sortedOptions = options.sort((a, b) => {
    if (a.primaryCountry === 'RO') return -1
    if (b.primaryCountry === 'RO') return 1
    return parseInt(a.dialCode.slice(1)) - parseInt(b.dialCode.slice(1))
  })

  // Find selected option
  const selectedOption = sortedOptions.find(option => option.primaryCountry === value)
  const selectedDialCode = selectedOption ? selectedOption.dialCode : ''

  // Handle keyboard search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const newSearchTerm = searchTerm + e.key
      setSearchTerm(newSearchTerm)

      // Find exact match first, then prefix match
      let match = sortedOptions.find(option => option.dialCode === `+${newSearchTerm}`)
      if (!match) {
        const prefixMatches = sortedOptions.filter(option => 
          option.dialCode.startsWith(`+${newSearchTerm}`)
        )
        if (prefixMatches.length > 0) {
          match = prefixMatches.sort((a, b) => a.dialCode.length - b.dialCode.length)[0]
        }
      }

      if (match) {
        onChange(match.primaryCountry)
        setSearchTerm('')
      }

      setTimeout(() => setSearchTerm(''), 1000)
    }
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || 'RO')}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="w-16 px-3 py-2 bg-[#100B1A] border border-[#7A48BF]/30 rounded-md text-transparent focus:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7A48BF] appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '12px',
          paddingRight: '24px'
        }}
      >
        {sortedOptions.map((option) => (
          <option key={option.dialCode} value={option.primaryCountry}>
            {option.displayText}
          </option>
        ))}
      </select>
      
      {/* Overlay for closed state - shows only prefix */}
      {!isOpen && selectedDialCode && (
        <div className="absolute inset-0 flex items-center px-3 py-2 pointer-events-none text-white">
          {selectedDialCode}
        </div>
      )}
    </div>
  )
}

export default SimpleCountrySelect
