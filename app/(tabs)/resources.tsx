import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, Pressable, ActivityIndicator, Linking } from 'react-native';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useUserStore } from '@/backend/stores/userStore';
import { ResourceService } from '@/backend/services/ResourceService';

export default function ResourcesScreen() {
  const C = useThemeColors();
  const { isSignedIn } = useAuth();
  
  // Backend Hooks
  const resources = useQuery(api.resources.listAll, { limit: 50 });
  const cloudBookmarks = useQuery(api.resources.getBookmarks, isSignedIn ? {} : "skip");
  const toggleBookmarkMutation = useMutation(api.resources.toggleBookmark);
  const syncResourcesAction = useAction(api.resources.syncExternalResources);

  // Local Hooks
  const localBookmarks = useUserStore((state) => state.bookmarkedResourceIds);

  const [isSyncing, setIsSyncing] = useState(false);

  // Determine current bookmarks based on auth state
  const bookmarkedIds = isSignedIn ? (cloudBookmarks ?? []) : localBookmarks;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncResourcesAction();
    } catch (e) {
      console.error('Failed to sync resources:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleBookmark = async (resourceId: string) => {
    await ResourceService.toggleBookmark({
      resourceId,
      isSignedIn: !!isSignedIn,
      toggleBookmarkMutation,
    });
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Resources</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Learn how to deepen your focus practice.
          </Text>
        </View>

        {/* DEV Tool: Sync Button */}
        <Pressable 
          style={[styles.syncButton, { backgroundColor: C.amberDim, borderColor: C.amber }]} 
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={C.amber} size="small" />
          ) : (
            <Text style={[styles.syncButtonText, { color: C.amber }]}>
              [DEV] Sync External Articles
            </Text>
          )}
        </Pressable>

        {/* Resources List */}
        {resources === undefined ? (
          <ActivityIndicator color={C.purple} style={{ marginTop: 40 }} />
        ) : resources.length === 0 ? (
          <View style={[styles.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.textPrimary }]}>Library Empty</Text>
            <Text style={[styles.cardText, { color: C.textSecondary }]}>
              Tap the Sync button above to fetch articles from the backend!
            </Text>
          </View>
        ) : (
          resources.map((resource) => {
            const isBookmarked = bookmarkedIds.includes(resource._id);
            
            return (
              <Pressable
                key={resource._id}
                style={[styles.resourceCard, { backgroundColor: C.bgCard, borderColor: C.border }]}
                onPress={() => handleOpenLink(resource.url)}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.categoryBadge, { backgroundColor: C.purpleDim }]}>
                    <Text style={[styles.categoryText, { color: C.purple }]}>{resource.category}</Text>
                  </View>
                  <Pressable 
                    style={styles.bookmarkBtn} 
                    onPress={() => handleToggleBookmark(resource._id)}
                    hitSlop={10}
                  >
                    <Text style={{ fontSize: 20, color: isBookmarked ? C.amber : C.textTertiary }}>
                      {isBookmarked ? '★' : '☆'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.resourceTitle, { color: C.textPrimary }]}>{resource.title}</Text>
                <Text style={[styles.resourceDesc, { color: C.textSecondary }]} numberOfLines={2}>
                  {resource.description}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg },
  title: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
  },

  syncButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  syncButtonText: {
    fontFamily: Typography.fontSans,
    fontWeight: Typography.weight.semibold,
  },

  card: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  cardText: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.base,
    lineHeight: 22,
  },

  resourceCard: {
    borderWidth: 0.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontFamily: Typography.fontMono,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  bookmarkBtn: {
    padding: 4,
  },
  resourceTitle: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  resourceDesc: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
});
