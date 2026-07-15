import {
    Text as TamaguiText,
    type TextProps as TamaguiTextProps,
} from "tamagui";

export type TextProps = TamaguiTextProps;

export function Text(props: TextProps) {
    return <TamaguiText {...props} />;
}