import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeWidth={1.5}
      d="M10 19c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2ZM10 5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2ZM10 12c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2Z"
    />
  </Svg>
);
export default SvgComponent;
