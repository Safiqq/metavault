import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.958 5.347v3.316M2.653 4.021a6.634 6.634 0 0 0 5.305 10.61c3.66 0 6.631-2.97 6.631-6.631a6.634 6.634 0 0 0-9.304-6.068"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7.954 10.653h.006"
    />
  </Svg>
);
export default SvgComponent;
