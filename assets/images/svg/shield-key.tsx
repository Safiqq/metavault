import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={60} height={60} fill="none" viewBox="0 0 60 60" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M51.475 26.375V17.8c0-3.075-2.35-6.475-5.225-7.55L33.775 5.575c-2.075-.775-5.475-.775-7.55 0l-12.475 4.7C10.875 11.35 8.525 14.75 8.525 17.8v18.575c0 2.95 1.95 6.825 4.325 8.6L23.6 53c1.75 1.35 4.075 2 6.4 2"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.2}
      d="M32.764 46.153a9.468 9.468 0 0 0 9.5 2.338l5.887 5.875c.425.437 1.263.7 1.863.612l2.725-.375c.9-.125 1.738-.975 1.875-1.875l.375-2.725c.088-.6-.2-1.437-.612-1.862L48.5 42.266c1-3.25.226-6.938-2.35-9.5-3.687-3.688-9.675-3.688-13.375 0-3.7 3.687-3.7 9.7-.012 13.387ZM48.889 49.353l-2.875 2.875"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M39.377 41.24a1.875 1.875 0 1 1 0-3.75 1.875 1.875 0 0 1 0 3.75Z"
    />
  </Svg>
);
export default SvgComponent;
