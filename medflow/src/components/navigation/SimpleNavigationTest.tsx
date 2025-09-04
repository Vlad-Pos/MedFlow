import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  User,
  BarChart3
} from 'lucide-react'

/**
 * Simple Navigation Test Component
 * 
 * This component provides a basic navigation test without complex hooks
 * to isolate navigation issues
 */
export function SimpleNavigationTest() {
  const testNavItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Test Dashboard'
    },
    { 
      to: '/appointments', 
      label: 'Appointments', 
      icon: Calendar, 
      description: 'Test Appointments'
    },
    { 
      to: '/patients', 
      label: 'Patients', 
      icon: Users, 
      description: 'Test Patients'
    },
    { 
      to: '/reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Test Reports'
    },
    { 
      to: '/profile', 
      label: 'Profile', 
      icon: User, 
      description: 'Test Profile'
    },
    { 
      to: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      description: 'Test Analytics'
    }
  ]

  return (
    <div className="fixed top-4 right-4 bg-green-800 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Simple Navigation Test</div>
      <div className="space-y-2">
        {testNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block px-2 py-1 bg-green-700 rounded hover:bg-green-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SimpleNavigationTest
