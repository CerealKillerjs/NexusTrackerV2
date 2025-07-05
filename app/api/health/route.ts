import { NextResponse } from "next/server"

/**
 * Health Check API Endpoint
 * 
 * This endpoint provides a simple health check for the NexusTracker API.
 * It returns basic information about the service status and configuration.
 * 
 * Features:
 * - Service status verification
 * - Basic configuration information
 * - Simple text response for monitoring tools
 * 
 * @returns NextResponse with service status information
 */
export async function GET() {
  try {
    // Get site name from environment or use default
    const siteName = process.env.SQ_SITE_NAME || "NexusTracker"
    
    // Create response with service status
    const response = `■ NexusTracker running: ${siteName}`
    
    return new NextResponse(response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    // Log error for debugging
    console.error("Health check error:", error)
    
    // Return error response
    return new NextResponse("Service unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
} 