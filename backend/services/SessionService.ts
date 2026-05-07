import { api } from '@/convex/_generated/api';
import { useSessionStore } from '@/backend/stores/sessionStore';
import { useUserStore } from '@/backend/stores/userStore';
import { useAvatarCustomizationStore } from '@/backend/stores/avatarCustomizationStore';

/**
 * Service to handle routing session data to either Convex (cloud) or local storage (guest).
 * The UI components should call this service instead of handling the logic themselves.
 */
export class SessionService {
  /**
   * Saves a completed session.
   * If the user is signed in, sends to Convex. If guest, saves locally.
   */
  static async saveCompletedSession(params: {
    isSignedIn: boolean;
    saveSessionMutation: any; // The Convex mutation passed from the component
    updateInsightsMutation: any; // The Convex mutation passed from the component
  }) {
    const { isSignedIn, saveSessionMutation, updateInsightsMutation } = params;
    
    // 1. Gather all the data from the active session state
    const state = useSessionStore.getState();
    const userState = useUserStore.getState();
    const shopState = useAvatarCustomizationStore.getState();
    
    const distractionDuration = state.distractionEvents.reduce((a, b) => a + b.durationSeconds, 0);

    if (isSignedIn) {
      // ─── CLOUD (CONVEX) ROUTE ───
      try {
        const response = await saveSessionMutation({
          subject: state.subject,
          subjectId: state.subjectId,
          timeOverall: state.secondsElapsed,
          compiledDistractionTime: distractionDuration,
          categoryMusic: state.ritualSound,
          breakTime: 0,
          resumeTime: 0,
          distractionLogs: state.distractionEvents.map((d) => ({
            timeLeft: d.timestamp / 1000,
            timeCameBack: (d.timestamp + d.durationSeconds * 1000) / 1000,
            distractionTime: d.durationSeconds,
          })),
          startedAt: Date.now() - state.secondsElapsed * 1000,
        });

        if (response && response.sessionId) {
          // Fire off the background AI insights job
          await updateInsightsMutation();
          
          // Update local coins to keep UI snappier, even though Convex is source of truth
          if (response.coinsEarned) {
             shopState.addCoins(response.coinsEarned);
          }

          return {
            success: true,
            savedSessionId: response.sessionId as string,
            results: {
              focusScore: response.focusScore,
              xpEarned: response.xpEarned,
              newStreak: response.newStreak,
              coinsEarned: response.coinsEarned,
            }
          };
        }
      } catch (error) {
        console.error('Failed to save session to Convex', error);
        return { success: false, error };
      }
    } else {
      // ─── LOCAL (GUEST) ROUTE ───
      
      const coinsEarned = Math.floor(state.xpEarned / 2);

      const newSession: any = {
        _id: `session-${Date.now()}`,
        subject: state.subject,
        subjectId: state.subjectId,
        timeOverall: state.durationMinutes * 60,
        compiledDistractionTime: distractionDuration,
        focusScore: state.focusScore,
        startedAt: Date.now() - state.durationMinutes * 60 * 1000,
        distractionLogs: state.distractionEvents.map((d) => ({
          timeLeft: d.timestamp / 1000,
          timeCameBack: (d.timestamp + d.durationSeconds * 1000) / 1000,
          distractionTime: d.durationSeconds,
        })),
      };

      userState.addSession(newSession);
      userState.addXP(state.xpEarned);
      userState.incrementStreak();
      shopState.addCoins(coinsEarned);
      
      return {
        success: true,
        savedSessionId: newSession._id,
        results: {
          focusScore: state.focusScore,
          xpEarned: state.xpEarned,
          newStreak: userState.streakDays + 1,
          coinsEarned,
        }
      };
    }
    
    return { success: false, error: new Error('Unknown routing failure') };
  }

  /**
   * Generates a smart suggestion based on the last session.
   * If authenticated, Convex handles insights automatically. 
   * If guest, we generate a basic local suggestion.
   */
  static generateLocalSuggestion(params: {
    isSignedIn: boolean;
    durationMinutes: number;
    focusScore: number;
  }) {
    const { isSignedIn, durationMinutes, focusScore } = params;
    
    if (isSignedIn) return; // Convex handles this via getSweetSpot
    
    const userState = useUserStore.getState();
    
    let message = "Keep up the great work!";
    let pills: { label: string }[] = [];

    if (focusScore < 70) {
      message = "Tough session. Try defining a very small first step next time to build momentum.";
      pills = [{ label: "Try · Smaller steps" }];
    } else if (focusScore > 90) {
      message = "Peak flow! This subject and duration are a great match for you.";
      pills = [{ label: `Peak · ${durationMinutes}min` }];
    }

    userState.setSuggestion({ message, pills });
  }

  /**
   * Deletes the most recent session.
   */
  static async deleteLastSession(params: {
    isSignedIn: boolean;
    deleteLastSessionMutation: any;
    updateInsightsMutation: any;
  }) {
    const { isSignedIn, deleteLastSessionMutation, updateInsightsMutation } = params;
    
    if (isSignedIn) {
      try {
        const response = await deleteLastSessionMutation();
        if (response && response.success) {
          // Refresh background AI insights
          await updateInsightsMutation();
          
          // Re-fetch current user coins to sync UI (handled by useQuery in components)
          return { success: true };
        }
        return { success: false, error: new Error('Failed to delete in cloud') };
      } catch (error) {
        console.error('Failed to delete session in Convex', error);
        return { success: false, error };
      }
    } else {
      const userState = useUserStore.getState();
      const shopState = useAvatarCustomizationStore.getState();
      
      if (userState.sessions.length === 0) {
        return { success: false, error: new Error('No sessions to delete') };
      }

      // Calculate approximate coins to deduct
      const sessionToDelete = userState.sessions[0];
      const xpToDeduct = Math.floor(sessionToDelete.timeOverall / 60) + 
            (sessionToDelete.focusScore >= 90 ? 20 : sessionToDelete.focusScore >= 75 ? 10 : sessionToDelete.focusScore >= 60 ? 5 : 0);
      const coinsToDeduct = Math.floor(xpToDeduct / 2);

      // We must deduct coins manually for guests, but ensure we don't drop below 0
      const currentCoins = shopState.coins;
      const amountToSpend = Math.min(coinsToDeduct, currentCoins);
      
      if (amountToSpend > 0) {
         shopState.spendCoins(amountToSpend);
      }

      userState.deleteLastSession();
      
      return { success: true };
    }
  }
}
