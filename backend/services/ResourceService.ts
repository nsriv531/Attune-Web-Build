import { api } from '@/convex/_generated/api';
import { useUserStore } from '@/backend/stores/userStore';

export class ResourceService {
  /**
   * Toggles a bookmark for a given resource.
   * If authenticated, it updates the backend via Convex.
   * If guest, it updates the local Zustand store.
   */
  static async toggleBookmark(params: {
    resourceId: string;
    isSignedIn: boolean;
    toggleBookmarkMutation: any;
  }) {
    const { resourceId, isSignedIn, toggleBookmarkMutation } = params;

    if (isSignedIn) {
      try {
        const response = await toggleBookmarkMutation({ resourceId });
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
  }
}
