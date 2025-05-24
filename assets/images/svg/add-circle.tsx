import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
    <Path
      fill={props.color || "#000000"}
      d="M10 1.667c-4.592 0-8.333 3.741-8.333 8.333 0 4.591 3.741 8.333 8.333 8.333 4.591 0 8.333-3.741 8.333-8.333 0-4.592-3.741-8.333-8.333-8.333Zm3.333 8.958h-2.708v2.708a.63.63 0 0 1-.625.625.63.63 0 0 1-.625-.625v-2.708H6.667A.63.63 0 0 1 6.042 10a.63.63 0 0 1 .625-.625h2.708V6.667A.63.63 0 0 1 10 6.042a.63.63 0 0 1 .625.625v2.708h2.708a.63.63 0 0 1 .625.625.63.63 0 0 1-.625.625Z"
    />
  </Svg>
);
export default SvgComponent;
