/**
 * Patient Flag Indicator Component for MedFlow
 * 
 * Visual indicators for flagged patients with flag counts, risk levels,
 * and quick access to flagging history and details.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flag, 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock, 
  Eye,
  X,
  ExternalLink
} from 'lucide-react'
import { PatientFlagSummary, PatientFlag } from '../types/patientFlagging'
import PatientFlaggingService from '../services/patientFlagging'
import { formatDistanceToNow } from 'date-fns'
import { ro } from 'date-fns/locale'

interface PatientFlagIndicatorProps {
  patientId: string
  patientName: string
  /** Display mode: inline for lists, badge for compact display, full for detailed view */
  mode?: 'inline' | 'badge' | 'full'
  /** Whether to show the flag tooltip on hover */
  showTooltip?: boolean
  /** Custom CSS classes */
  className?: string
  /** Callback when flag details are requested */
  onViewDetails?: (patientId: string) => void
}

interface FlagTooltipProps {
  summary: PatientFlagSummary
  onViewDetails?: () => void
  onClose: () => void
}

/**
 * Flag tooltip component showing detailed information
 */
function FlagTooltip({ summary, onViewDetails, onClose }: FlagTooltipProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'Risc Mare'
      case 'medium': return 'Risc Mediu'
      case 'low': return 'Risc Scăzut'
      default: return 'Fără Risc'
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 top-full left-0 mt-2"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-red-100 rounded-full">
          <Flag className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{summary.patientName}</h4>
          <p className="text-sm text-gray-600">Pacient semnalizat</p>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">{summary.activeFlags}</div>
          <div className="text-xs text-gray-600">Semnalizări active</div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">{summary.totalFlags}</div>
          <div className="text-xs text-gray-600">Total semnalizări</div>
        </div>
      </div>
      
      {/* Risk Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Nivel de risc:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(summary.riskLevel)}`}>
            {getRiskLabel(summary.riskLevel)}
          </span>
        </div>
      </div>
      
      {/* Severity Breakdown */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Distribuție severitate:</h5>
        <div className="space-y-2">
          {summary.flagsBySeverity.high > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">Mare</span>
              <span className="font-medium">{summary.flagsBySeverity.high}</span>
            </div>
          )}
          {summary.flagsBySeverity.medium > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-600">Mediu</span>
              <span className="font-medium">{summary.flagsBySeverity.medium}</span>
            </div>
          )}
          {summary.flagsBySeverity.low > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-600">Scăzut</span>
              <span className="font-medium">{summary.flagsBySeverity.low}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Last Activity */}
      {summary.lastFlagDate && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Ultima semnalizare: {formatDistanceToNow(summary.lastFlagDate.toDate(), { 
                locale: ro, 
                addSuffix: true 
              })}
            </span>
          </div>
        </div>
      )}
      
      {/* Action Button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Vezi detalii complete
        </button>
      )}
    </motion.div>
  )
}

/**
 * Main patient flag indicator component
 */
export default function PatientFlagIndicator({
  patientId,
  patientName,
  mode = 'inline',
  showTooltip = true,
  className = '',
  onViewDetails
}: PatientFlagIndicatorProps) {
  const [flagSummary, setFlagSummary] = useState<PatientFlagSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltipState, setShowTooltipState] = useState(false)
  
  // Load flag summary on mount
  useEffect(() => {
    loadFlagSummary()
  }, [patientId])
  
  /**
   * Load patient flag summary
   */
  const loadFlagSummary = async () => {
    try {
      setLoading(true)
      const summary = await PatientFlaggingService.getPatientFlagSummary(patientId)
      setFlagSummary(summary)
    } catch (error) {
      console.error('Error loading flag summary:', error)
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Handle tooltip visibility
   */
  const handleMouseEnter = () => {
    if (showTooltip && flagSummary) {
      setShowTooltipState(true)
    }
  }
  
  const handleMouseLeave = () => {
    setShowTooltipState(false)
  }
  
  /**
   * Handle view details click
   */
  const handleViewDetails = () => {
    setShowTooltipState(false)
    onViewDetails?.(patientId)
  }
  
  // Don't render if loading or no flags
  if (loading || !flagSummary || flagSummary.activeFlags === 0) {
    return null
  }
  
  /**
   * Get flag color based on risk level
   */
  const getFlagColor = () => {
    switch (flagSummary.riskLevel) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300'
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'low': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }
  
  /**
   * Render badge mode (compact)
   */
  if (mode === 'badge') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${getFlagColor()}`}
          onClick={() => showTooltip && setShowTooltipState(!showTooltipState)}
        >
          <Flag className="w-3 h-3 mr-1" />
          <span>{flagSummary.activeFlags}</span>
        </motion.div>
        
        <AnimatePresence>
          {showTooltipState && (
            <FlagTooltip
              summary={flagSummary}
              onViewDetails={handleViewDetails}
              onClose={() => setShowTooltipState(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  /**
   * Render inline mode (for lists)
   */
  if (mode === 'inline') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium border cursor-pointer ${getFlagColor()}`}
          onClick={() => showTooltip && setShowTooltipState(!showTooltipState)}
        >
          <Flag className="w-4 h-4 mr-2" />
          <span className="mr-2">{flagSummary.activeFlags} semnalizări</span>
          
          {flagSummary.riskLevel === 'high' && (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </motion.div>
        
        <AnimatePresence>
          {showTooltipState && (
            <FlagTooltip
              summary={flagSummary}
              onViewDetails={handleViewDetails}
              onClose={() => setShowTooltipState(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  /**
   * Render full mode (detailed view)
   */
  return (
    <div className={`${className}`}>
      <div className={`p-4 border rounded-lg ${getFlagColor()}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/50 rounded-full">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold">{patientName}</h4>
              <p className="text-sm opacity-75">Pacient semnalizat</p>
            </div>
          </div>
          
          {flagSummary.riskLevel === 'high' && (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold">{flagSummary.activeFlags}</div>
            <div className="text-xs opacity-75">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{flagSummary.totalFlags}</div>
            <div className="text-xs opacity-75">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{flagSummary.resolvedFlags}</div>
            <div className="text-xs opacity-75">Rezolvate</div>
          </div>
        </div>
        
        {flagSummary.lastFlagDate && (
          <div className="flex items-center text-sm opacity-75 mb-3">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Ultima semnalizare: {formatDistanceToNow(flagSummary.lastFlagDate.toDate(), { 
                locale: ro, 
                addSuffix: true 
              })}
            </span>
          </div>
        )}
        
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(patientId)}
            className="w-full flex items-center justify-center px-3 py-2 bg-white/20 hover:bg-white/30 text-sm font-medium rounded transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Vezi istoric complet
          </button>
        )}
      </div>
    </div>
  )
}
