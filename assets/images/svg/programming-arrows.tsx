import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.5 16V6.5c0-1.1-.9-2-2-2H12"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14.5 2-3 2.5 3 2.5M19.5 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5.5 8v9.5c0 1.1.9 2 2 2H13"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m10.5 22 3-2.5-3-2.5M5.5 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
    />
  </Svg>
);
export default SvgComponent;
