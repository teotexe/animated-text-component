interface AnimatedTextProps {
    font: string;
    text: string;
    width: number;
    delay?: number;
    duration?: number;
    strokeWidth?: number;
    timingFunction?: string;
    strokeColor?: string;
    fillColor?: string;
    repeat?: boolean;
}
export declare function AnimatedText({ font, text, width, delay, duration, strokeWidth, timingFunction, strokeColor, fillColor, repeat, }: AnimatedTextProps): import("react/jsx-runtime").JSX.Element;
export {};
