/**
 * useNotification Hook for MedFlow
 * 
 * Provides easy access to the notification system without global state pollution.
 * This hook must be used within a NotificationProvider.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showSuccess, showError } = useNotification()
 *   
 *   const handleSuccess = () => {
 *     showSuccess('Operation completed', 'Your data has been saved successfully')
 *   }
 *   
 *   const handleError = () => {
 *     showError('Operation failed', 'Please try again later')
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Success</button>
 *       <button onClick={handleError}>Error</button>
 *     </div>
 *   )
 * }
 * ```
 */

export { useNotification } from '../contexts/NotificationContext'
export type { NotificationItem } from '../contexts/NotificationContext'
