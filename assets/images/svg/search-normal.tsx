import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.667 14a6.333 6.333 0 1 0 0-12.667 6.333 6.333 0 0 0 0 12.667ZM14.667 14.667l-1.333-1.334"
    />
  </Svg>
);
export default SvgComponent;
