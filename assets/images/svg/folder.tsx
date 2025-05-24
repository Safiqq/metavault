import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={14} fill="none" viewBox="0 0 16 14" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M14.667 6.417v3.5c0 2.333-.667 2.916-3.333 2.916H4.667c-2.667 0-3.333-.583-3.333-2.916V4.083c0-2.333.666-2.916 3.333-2.916h1c1 0 1.22.256 1.6.7l1 1.166c.253.292.4.467 1.067.467h2c2.666 0 3.333.583 3.333 2.917Z"
    />
  </Svg>
);
export default SvgComponent;
