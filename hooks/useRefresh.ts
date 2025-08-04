import { useCallback, useState } from 'react';

/**
 * Custom hook for handling pull-to-refresh functionality
 * @param onRefresh - Function to call when refresh is triggered
 * @returns Object containing refreshing state and refresh handler
 */
export function useRefresh(onRefresh?: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
}