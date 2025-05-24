import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#ffffff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 14.666c3.667 0 6.667-3 6.667-6.666 0-3.667-3-6.667-6.667-6.667S1.333 4.333 1.333 8c0 3.666 3 6.666 6.667 6.666Z"
    />
    <Path
      stroke={props.color || "#ffffff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m5.167 8 1.886 1.887 3.78-3.774"
    />
  </Svg>
);
export default SvgComponent;
