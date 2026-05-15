import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useUserStore } from '@/backend/stores/userStore';

export function useResourceService() {
  const { isSignedIn } = useAuth();
  const toggleBookmarkMutation = useMutation(api.resources.toggleBookmark);

  const toggleBookmark = async (resourceId: string) => {
    if (isSignedIn) {
      try {
        const response = await toggleBookmarkMutation({ resourceId: resourceId as any });
        return { success: true, status: response.status };
      } catch (error) {
        console.error('Failed to toggle bookmark in Convex', error);
        return { success: false, error };
      }
    } else {
      const userStore = useUserStore.getState();
      userStore.toggleBookmark(resourceId);
      
      const isNowBookmarked = useUserStore.getState().bookmarkedResourceIds.includes(resourceId);
      return { success: true, status: isNowBookmarked ? 'added' : 'removed' };
    }
  };

  return { toggleBookmark };
}
