/**
 * Custom hook for loading user avatars with SWR caching
 * 
 * This hook fetches avatar images from the API and caches them
 * to avoid repeated API calls for the same user
 */

import useSWR from "swr"
import { useSession } from "next-auth/react"

interface AvatarResponse {
  image: string
  userId: string
}

interface UseAvatarReturn {
  avatarUrl: string | null
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<AvatarResponse> => {
  const response = await fetch(url)
  
  if (!response.ok) {
    if (response.status === 404) {
      // Return null for no avatar instead of throwing error
      return { image: "", userId: "" }
    }
    throw new Error(`Failed to fetch avatar: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Hook to load user avatar with caching
 * 
 * @param userId - The user ID to load avatar for
 * @returns Object with avatar data, loading state, and error
 */
export function useAvatar(userId?: string): UseAvatarReturn {
  const { data: session } = useSession()
  
  // Don't fetch if no session or no userId
  const shouldFetch = session?.user && userId
  
  const { data, error, isLoading, mutate } = useSWR<AvatarResponse>(
    shouldFetch ? `/api/user/avatar/${userId}` : null,
    fetcher,
    {
      // Cache for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
      // Revalidate on focus
      revalidateOnFocus: false,
      // Don't revalidate on reconnect
      revalidateOnReconnect: false,
      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // Construct avatar URL from base64 data
  const avatarUrl = data?.image ? `data:image/jpeg;base64,${data.image}` : null

  return {
    avatarUrl,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook to load current user's avatar
 * 
 * @returns Object with current user's avatar data
 */
export function useCurrentUserAvatar(): UseAvatarReturn {
  const { data: session } = useSession()
  const userId = session?.user?.id
  
  return useAvatar(userId)
} 