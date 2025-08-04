import React from 'react';
import { View, ViewProps } from 'react-native';
import { RefreshableScrollView } from './RefreshableScrollView';

interface RefreshableViewProps extends ViewProps {
  onRefresh?: () => Promise<void> | void;
  refreshControlProps?: Omit<React.ComponentProps<typeof import('react-native').RefreshControl>, 'refreshing' | 'onRefresh'>;
  /**
   * Whether to use ScrollView wrapper for refresh functionality.
   * If false, will render a regular View (refresh won't work on iOS).
   * @default true
   */
  scrollable?: boolean;
}

/**
 * Refreshable View component that automatically wraps content in ScrollView for refresh functionality
 * Falls back to regular View if scrollable is false
 */
export function RefreshableView({ 
  onRefresh, 
  refreshControlProps,
  scrollable = true,
  children,
  style,
  ...viewProps 
}: RefreshableViewProps) {
  if (!scrollable || !onRefresh) {
    return (
      <View style={style} {...viewProps}>
        {children}
      </View>
    );
  }

  return (
    <RefreshableScrollView
      style={style}
      contentContainerStyle={{ flexGrow: 1 }}
      onRefresh={onRefresh}
      refreshControlProps={refreshControlProps}
      {...viewProps}
    >
      {children}
    </RefreshableScrollView>
  );
}