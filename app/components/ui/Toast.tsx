"use client"

import { useState, useEffect } from "react"
import { cn } from "@/app/lib/utils"

/**
 * Toast notification component interface
 * Defines the structure for toast notifications with message, type, and visibility
 */
interface ToastProps {
  message: string // The message to display in the toast
  type: "success" | "error" | "info" // The type of toast (affects styling and icon)
  isVisible: boolean // Whether the toast should be displayed
  onClose: () => void // Callback function to close the toast
  duration?: number // How long the toast should be visible (in milliseconds)
}

/**
 * Toast Component
 * 
 * A notification component that displays temporary messages to users.
 * Features:
 * - Three types: success (green), error (red), info (blue)
 * - Automatic dismissal after specified duration
 * - Smooth slide-in/out animations
 * - Manual close button
 * - Responsive design with appropriate icons
 * 
 * @param props - ToastProps object containing toast configuration
 */
export function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  // State to control animation (slide in/out effect)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Start animation when toast becomes visible
      setIsAnimating(true)
      
      // Set timer to automatically close toast after duration
      const timer = setTimeout(() => {
        setIsAnimating(false)
        // Wait for animation to complete before calling onClose
        setTimeout(onClose, 300)
      }, duration)

      // Cleanup timer if component unmounts or toast becomes invisible
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  // Don't render anything if toast is not visible
  if (!isVisible) return null

  /**
   * Returns the appropriate CSS classes based on toast type
   * Each type has different background, border, and text colors
   */
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  /**
   * Returns the appropriate icon SVG based on toast type
   * Each type has a different icon that matches the message context
   */
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case "info":
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center p-4 border rounded-lg shadow-lg transition-all duration-300",
          getToastStyles(),
          // Animation classes: slide in from right when animating, slide out when not
          isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        {/* Icon container */}
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        {/* Message container */}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        {/* Manual close button */}
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 300) // Wait for animation to complete
          }}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
} 