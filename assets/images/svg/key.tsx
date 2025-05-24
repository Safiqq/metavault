import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M13.193 9.953A5.05 5.05 0 0 1 8.127 11.2l-3.14 3.133c-.227.234-.674.374-.994.327l-1.453-.2c-.48-.067-.927-.52-1-1l-.2-1.453c-.047-.32.107-.767.327-.994L4.8 7.88a5.046 5.046 0 0 1 8.387-5.067 5.052 5.052 0 0 1 .006 7.14ZM4.593 11.66l1.534 1.533"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.666 7.333a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  </Svg>
);
export default SvgComponent;
