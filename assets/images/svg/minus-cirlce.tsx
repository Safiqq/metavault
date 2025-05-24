import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
    <Path
      fill={props.color || "#000000"}
      d="M10 1.667c-4.592 0-8.333 3.741-8.333 8.333 0 4.591 3.741 8.333 8.333 8.333 4.591 0 8.333-3.741 8.333-8.333 0-4.592-3.741-8.333-8.333-8.333Zm3.267 8.958H6.6A.63.63 0 0 1 5.975 10a.63.63 0 0 1 .625-.625h6.667a.624.624 0 1 1 0 1.25Z"
    />
  </Svg>
);
export default SvgComponent;
