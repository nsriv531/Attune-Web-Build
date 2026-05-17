import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useAction, useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useUserStore } from '@/backend/stores/userStore';
import { useResourceService } from '@/backend/services/useResourceService';

export default function ResourcesScreen() {
  const C = useThemeColors();
  const { isSignedIn } = useAuth();

  const resources = useQuery(api.resources.listAll, { limit: 50 });
  const cloudBookmarks = useQuery(api.resources.getBookmarks, isSignedIn ? {} : 'skip');
  const syncResourcesAction = useAction(api.resources.syncExternalResources);
  const { toggleBookmark } = useResourceService();

  const localBookmarks = useUserStore((state) => state.bookmarkedResourceIds);
  const [isSyncing, setIsSyncing] = useState(false);

  const bookmarkedIds = (isSignedIn ? cloudBookmarks ?? [] : localBookmarks ?? []) as readonly string[];

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      await syncResourcesAction({});
    } catch (e) {
      console.error('Failed to sync resources:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleBookmark = async (resourceId: string) => {
    try {
      await toggleBookmark(resourceId);
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  const handleOpenLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Resources</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>Learn how to deepen your focus practice.</Text>
        </View>

        <Pressable
          style={[styles.syncButton, { backgroundColor: C.amberDim, borderColor: C.amber }]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={C.amber} size="small" />
          ) : (
            <Text style={[styles.syncButtonText, { color: C.amber }]}>[DEV] Sync External Articles</Text>
          )}
        </Pressable>

        {resources === undefined ? (
          <ActivityIndicator color={C.purple} style={{ marginTop: 40 }} />
        ) : resources.length === 0 ? (
          <View style={[styles.card, { backgroundColor: C.bgCard, borderColor: C.border }]}> 
            <Text style={[styles.cardTitle, { color: C.textPrimary }]}>Library Empty</Text>
            <Text style={[styles.cardText, { color: C.textSecondary }]}>Tap the Sync button above to fetch articles from the backend.</Text>
          </View>
        ) : (
          resources.map((resource) => {
            const resourceId = String(resource._id);
            const isBookmarked = bookmarkedIds.includes(resourceId);

            return (
              <Pressable
                key={resourceId}
                style={[styles.resourceCard, { backgroundColor: C.bgCard, borderColor: C.border }]}
                onPress={() => handleOpenLink(resource.url)}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.categoryBadge, { backgroundColor: C.purpleDim }]}> 
                    <Text style={[styles.categoryText, { color: C.purple }]}>{resource.category}</Text>
                  </View>
                  <Pressable
                    style={styles.bookmarkBtn}
                    onPress={() => handleToggleBookmark(resourceId)}
                    hitSlop={10}
                  >
                    <Text style={{ fontSize: 20, color: isBookmarked ? C.amber : C.textTertiary }}>
                      {isBookmarked ? '★' : '☆'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.resourceTitle, { color: C.textPrimary }]}>{resource.title}</Text>
                <Text style={[styles.resourceDesc, { color: C.textSecondary }]} numberOfLines={2}>
                  {resource.description || 'No description available.'}
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
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  header: {
    marginBottom: Spacing.lg,
  },
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
