import React from 'react';
import { ScrollView, ScrollViewProps, RefreshControl } from 'react-native';
import { useRefresh } from '@/hooks/useRefresh';

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh?: () => Promise<void> | void;
  refreshControlProps?: Omit<React.ComponentProps<typeof RefreshControl>, 'refreshing' | 'onRefresh'>;
}

/**
 * ScrollView component with built-in RefreshControl functionality
 * Automatically handles refreshing state and provides pull-to-refresh capability
 */
export function RefreshableScrollView({ 
  onRefresh, 
  refreshControlProps,
  children,
  ...scrollViewProps 
}: RefreshableScrollViewProps) {
  const { refreshing, onRefresh: handleRefresh } = useRefresh(onRefresh);

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            {...refreshControlProps}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}