import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={60} height={60} fill="none" viewBox="0 0 60 60" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M42.525 31.825a2.675 2.675 0 1 0 0-5.35 2.675 2.675 0 0 0 0 5.35Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M50 15v4.475a18.02 18.02 0 0 0-2.125-.125h-10.7c-5.35 0-7.125 1.775-7.125 7.125V39.25H15c-8 0-10-2-10-10V15C5 7 7 5 15 5h25c8 0 10 2 10 10Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 29.75h25"
      opacity={0.4}
    />
    <G
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      opacity={0.4}
    >
      <Path d="M22.5 39.25V50M14.876 50H30" />
    </G>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M42.525 31.825a2.675 2.675 0 1 0 0-5.35 2.675 2.675 0 0 0 0 5.35Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M55 26.475v21.4C55 53.225 53.225 55 47.875 55h-10.7c-5.35 0-7.125-1.775-7.125-7.125v-21.4c0-5.35 1.775-7.125 7.125-7.125h10.7c.775 0 1.5.05 2.125.125 3.7.475 5 2.425 5 7Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M47.875 42.525c0 2.95-2.4 5.35-5.35 5.35-2.95 0-5.35-2.4-5.35-5.35A5.35 5.35 0 0 1 38.3 39.25a5.355 5.355 0 0 1 4.225-2.075c1.35 0 2.575.5 3.5 1.3 1.125 1 1.85 2.45 1.85 4.05ZM42.525 31.825a2.675 2.675 0 1 0 0-5.35 2.675 2.675 0 0 0 0 5.35Z"
    />
  </Svg>
);
export default SvgComponent;
