import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.5 14.167v-5l-1.667 1.667M7.5 9.167l1.667 1.667"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.333 8.334V12.5c0 4.167-1.666 5.834-5.833 5.834h-5c-4.167 0-5.833-1.667-5.833-5.834v-5c0-4.166 1.666-5.833 5.833-5.833h4.166"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.333 8.334H15c-2.5 0-3.334-.834-3.334-3.334V1.667l6.667 6.667Z"
    />
  </Svg>
);
export default SvgComponent;
