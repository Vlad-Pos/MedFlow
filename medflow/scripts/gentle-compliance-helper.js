/**
 * 🤖 Gentle Compliance Helper for MedFlow
 * 
 * This script provides gentle reminders and suggestions for AI agents
 * working on MedFlow without any blocking or enforcement.
 * 
 * Purpose: Guide agents toward best practices, not restrict access
 */

// Enhanced gentle reminder system with engagement features
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
        '   This helps ensure your work aligns with MedFlow standards.',
        '   ⏱️  Reading time: ~12-17 minutes total'
      ],
      'development': [
        '💡 Before starting development work, consider reading:',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (technical standards)',
        '   📚 MedFlow/FEATURES_DOCUMENTATION.md (feature guides)',
        '   This helps ensure your code meets MedFlow quality requirements.',
        '   ⏱️  Reading time: ~14-18 minutes total'
      ],
      'content': [
        '💡 Before starting content work, consider reading:',
        '   📚 MedFlow/BRAND_IDENTITY.md (voice and tone)',
        '   📚 MedFlow/FEATURES_DOCUMENTATION.md (feature details)',
        '   This helps ensure your content matches MedFlow\'s professional medical positioning.',
        '   ⏱️  Reading time: ~11-15 minutes total'
      ],
      'general': [
        '💡 Welcome to MedFlow development!',
        '   📚 Consider reading the main documentation files:',
        '   📚 MedFlow/README.md (project overview)',
        '   📚 MedFlow/BRAND_IDENTITY.md (brand guidelines)',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (technical standards)',
        '   This helps ensure your contributions align with project standards.',
        '   ⏱️  Reading time: ~20-25 minutes total'
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
        '   MedFlow has 7 sacred brand colors that should not be changed:',
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
      console.log('   📚 Consider reading: MedFlow/BRAND_IDENTITY.md, DEVELOPMENT_GUIDE.md');
      return false;
    }
    
    return true;
  },

  /**
   * NEW: Gentle engagement system that encourages reading
   * @param {string} action - Action being performed
   */
  gentleEngagement: function(action) {
    const engagementMessages = {
      'file-opened': [
        '📖 Gentle Reminder:',
        '   Have you read the MedFlow documentation?',
        '   📚 Quick access: MedFlow/QUICK_REFERENCE.md',
        '   ⏱️  Takes just 5 minutes to get essential info!'
      ],
      'component-edit': [
        '🔧 Development Reminder:',
        '   Before editing components, consider:',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (8-10 minutes)',
        '   📚 MedFlow/BRAND_IDENTITY.md (5-7 minutes)',
        '   This helps ensure quality and consistency!'
      ],
      'styling-changes': [
        '🎨 Styling Reminder:',
        '   Before making style changes, please review:',
        '   📚 MedFlow/BRAND_IDENTITY.md (sacred colors)',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (design system)',
        '   ⚠️  Brand colors cannot be changed!'
      ],
      'new-feature': [
        '🚀 Feature Development Reminder:',
        '   Before adding new features, consider:',
        '   📚 MedFlow/FEATURES_DOCUMENTATION.md (6-8 minutes)',
        '   📚 MedFlow/DEVELOPMENT_GUIDE.md (8-10 minutes)',
        '   This ensures your feature fits the architecture!'
      ]
    };

    const message = engagementMessages[action];
    if (message) {
      console.log('\n' + message.join('\n') + '\n');
      console.log('💡 This is just helpful guidance - no restrictions apply!');
    }
  },

  /**
   * NEW: Progress tracking for gentle encouragement
   * @param {string} milestone - Milestone achieved
   */
  trackProgress: function(milestone) {
    const milestones = {
      'docs-read': '📚 Documentation Read',
      'brand-understood': '🎨 Brand Guidelines Understood',
      'architecture-followed': '🏗️ Architecture Followed',
      'feature-implemented': '🚀 Feature Implemented'
    };

    if (milestones[milestone]) {
      console.log(`🎉 Great progress! ${milestones[milestone]} milestone achieved!`);
      console.log('   You\'re following MedFlow best practices perfectly!');
      
      // Store progress (non-blocking, just for encouragement)
      if (!window.medflowProgress) {
        window.medflowProgress = [];
      }
      window.medflowProgress.push(milestone);
    }
  },

  /**
   * NEW: Gentle success celebration
   */
  celebrateSuccess: function() {
    const progress = window.medflowProgress || [];
    
    if (progress.length > 0) {
      console.log('\n🏆 MedFlow Success Summary:');
      console.log(`   Milestones achieved: ${progress.length}`);
      console.log('   You\'re doing excellent work following MedFlow standards!');
      console.log('   🎉 Keep up the great work!');
    }
  }
};

// Enhanced initialization with gentle engagement
function initializeGentleCompliance() {
  console.log('🤖 MedFlow Gentle Compliance Helper Initialized');
  console.log('   Purpose: Helpful guidance, not restrictions');
  console.log('   📚 Start here: MedFlow/QUICK_REFERENCE.md');
  
  // Gentle engagement for common actions
  gentleReminders.gentleEngagement('file-opened');
  
  // Make functions available globally for gentle use
  window.medflowGentleHelper = {
    suggestReading: gentleReminders.suggestReading,
    provideGuidance: gentleReminders.provideGuidance,
    gentleEngagement: gentleReminders.gentleEngagement,
    trackProgress: gentleReminders.trackProgress,
    celebrateSuccess: gentleReminders.celebrateSuccess
  };
  
  console.log('💡 Use: window.medflowGentleHelper.suggestReading("development")');
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initializeGentleCompliance();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gentleReminders,
    initializeGentleCompliance
  };
}
