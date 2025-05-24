import * as React from "react";
import Svg, { Path, Circle, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={32} height={16} fill="none" viewBox="0 0 32 16" {...props}>
    <Path
      fill="#000"
      d="M0 8a8 8 0 0 1 8-8h16a8 8 0 1 1 0 16H8a8 8 0 0 1-8-8Z"
    />
    <Circle cx={24} cy={8} r={6} fill="#fff" />
  </Svg>
);
export default SvgComponent;
