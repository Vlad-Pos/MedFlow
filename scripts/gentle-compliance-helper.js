/**
 * 🤖 Gentle Compliance Helper for MedFlow
 * 
 * This script provides gentle reminders and suggestions for AI agents
 * working on MedFlow without any blocking or enforcement.
 * 
 * Purpose: Guide agents toward best practices, not restrict access
 */

// Gentle reminder system
const gentleReminders = {
  /**
   * Suggest reading documentation before starting work
   * @param {string} workType - Type of work being done
   */
  suggestReading: function(workType) {
    const suggestions = {
      'design': [
        '💡 Before starting design work, consider reading:',
        '   📚 MedFlow/BRAND_IDENTITY.md (brand guidelines)',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (design system)',
        '   This helps ensure your work aligns with MedFlow standards.'
      ],
      'development': [
        '💡 Before starting development work, consider reading:',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (technical standards)',
        '   📚 MedFlow/FEATURES_DOCUMENTATION.md (feature guides)',
        '   This helps ensure your code meets MedFlow quality requirements.'
      ],
      'content': [
        '💡 Before starting content work, consider reading:',
        '   📚 MedFlow/BRAND_IDENTITY.md (voice and tone)',
        '   📚 MedFlow/FEATURES_DOCUMENTATION.md (feature details)',
        '   This helps ensure your content matches MedFlow\'s professional medical positioning.'
      ],
      'general': [
        '💡 Welcome to MedFlow development!',
        '   📚 Consider reading the main documentation files:',
        '   📚 MedFlow/README.md (project overview)',
        '   📚 MedFlow/BRAND_IDENTITY.md (brand guidelines)',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (technical standards)',
        '   This helps ensure your contributions align with project standards.'
      ]
    };

    const suggestion = suggestions[workType] || suggestions.general;
    console.log('\n' + suggestion.join('\n') + '\n');
    
    // Also log to help with debugging
    console.log('🔍 MedFlow Compliance Helper: Suggested reading for', workType, 'work');
  },

  /**
   * Provide gentle guidance for common tasks
   * @param {string} task - Task being performed
   */
  provideGuidance: function(task) {
    const guidance = {
      'color-changes': [
        '🎨 Color Change Guidance:',
        '   MedFlow has 12 new brand colors that should not be changed:',
        '   #8A7A9F, #000000, #100B1A, #7A48BF, #804AC8, #25153A, #FFFFFF, #CCCCCC, #231A2F, #BFBFBF, #A6A6A6, #737373',
        '   If you need to extend the palette, use closely related shades.',
        '   📚 See BRAND_IDENTITY.md for complete color guidelines.'
      ],
      'component-creation': [
        '🔧 Component Creation Guidance:',
        '   Follow the established patterns in MedFlow:',
        '   - Use TypeScript interfaces for props',
        '   - Implement proper accessibility features',
        '   - Follow the component architecture structure',
        '   📚 See DEVELOPMENT_GUIDE.md for technical standards.'
      ],
      'feature-implementation': [
        '🚀 Feature Implementation Guidance:',
        '   Before implementing new features:',
        '   - Review existing feature patterns',
        '   - Follow the established architecture',
        '   - Update documentation as needed',
        '   📚 See FEATURES_DOCUMENTATION.md for implementation guides.'
      ]
    };

    const help = guidance[task];
    if (help) {
      console.log('\n' + help.join('\n') + '\n');
    }
  },

  /**
   * Check if agent has acknowledged reading documentation
   * @returns {boolean} - True if agent has shown awareness
   */
  checkAwareness: function() {
    // This is a gentle check - no blocking, just awareness
    const hasShownAwareness = window.medflowAgentAwareness || false;
    
    if (!hasShownAwareness) {
      console.log('💡 MedFlow Compliance Helper: Agent awareness not yet confirmed');
      console.log('   This is just a gentle reminder - no restrictions apply');
      return false;
    }
    
    return true;
  },

  /**
   * Mark agent as aware of MedFlow requirements
   */
  markAware: function() {
    window.medflowAgentAwareness = true;
    console.log('✅ MedFlow Compliance Helper: Agent awareness confirmed');
    console.log('   You\'re ready to work with MedFlow standards in mind!');
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = gentleReminders;
} else if (typeof window !== 'undefined') {
  window.medflowComplianceHelper = gentleReminders;
}

// Auto-suggest for common scenarios
if (typeof window !== 'undefined') {
  // Gentle reminder when script loads
  setTimeout(() => {
    console.log('🤖 MedFlow Compliance Helper loaded');
    console.log('💡 Use gentleReminders.suggestReading() for guidance');
  }, 1000);
}

/**
 * Usage Examples:
 * 
 * // Suggest reading for design work
 * gentleReminders.suggestReading('design');
 * 
 * // Provide guidance for color changes
 * gentleReminders.provideGuidance('color-changes');
 * 
 * // Mark agent as aware
 * gentleReminders.markAware();
 * 
 * // Check awareness (non-blocking)
 * const isAware = gentleReminders.checkAwareness();
 */
