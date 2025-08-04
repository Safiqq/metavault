import React, { useCallback } from 'react';
import { View, PanResponder, Pressable, useWindowDimensions, ViewStyle } from 'react-native';
import { AddCircleIcon, MinusCircleIcon } from '@/assets/images/icons';

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  step?: number;
  style?: ViewStyle;
}

export function Slider({
  value,
  minimumValue,
  maximumValue,
  onValueChange,
  step = 1,
  style,
}: SliderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const sliderWidth = Math.min(screenWidth - 140, 280); // Responsive width with more margin for mobile
  const trackHeight = 4;
  const thumbSize = 20;
  
  const normalizedValue = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = normalizedValue * (sliderWidth - thumbSize);
  
  const updateValue = useCallback((newPosition: number) => {
    const normalizedPosition = Math.max(0, Math.min(1, newPosition / (sliderWidth - thumbSize)));
    const newValue = minimumValue + normalizedPosition * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    onValueChange(clampedValue);
  }, [minimumValue, maximumValue, step, onValueChange, sliderWidth]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      updateValue(touchX - thumbSize / 2);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = thumbPosition + gestureState.dx;
      updateValue(newPosition);
    },
  });

  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, value - step);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, value + step);
    onValueChange(newValue);
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }, style]}>
      {/* Decrease button */}
      <Pressable
        onPress={handleDecrease}
        className="mr-3"
        disabled={value <= minimumValue}
      >
        <MinusCircleIcon
          width={24}
          height={24}
          color={value <= minimumValue ? "#BBBBBB" : "#000000"}
        />
      </Pressable>

      {/* Slider track and thumb */}
      <View
        style={{ width: sliderWidth, height: thumbSize, justifyContent: 'center' }}
        {...panResponder.panHandlers}
      >
        {/* Track */}
        <View
          style={{
            width: sliderWidth,
            height: trackHeight,
            backgroundColor: '#E5E5E5',
            borderRadius: trackHeight / 2,
          }}
        />
        
        {/* Active track */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: thumbPosition + thumbSize / 2,
            height: trackHeight,
            backgroundColor: '#000000',
            borderRadius: trackHeight / 2,
          }}
        />
        
        {/* Thumb */}
        <View
          style={{
            position: 'absolute',
            left: thumbPosition,
            width: thumbSize,
            height: thumbSize,
            backgroundColor: '#000000',
            borderRadius: thumbSize / 2,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      </View>

      {/* Increase button */}
      <Pressable
        onPress={handleIncrease}
        className="ml-3"
        disabled={value >= maximumValue}
      >
        <AddCircleIcon
          width={24}
          height={24}
          color={value >= maximumValue ? "#BBBBBB" : "#000000"}
        />
      </Pressable>
    </View>
  );
}