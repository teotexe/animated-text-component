# What does it do?

This component renders animated SVG text by loading a custom font via [opentype.js](https://opentype.js.org/).  
It progressively draws each character’s outline and then fills it, creating a handwriting-like animation.

---

## ✨ Features
- Load any custom font (local or remote) using `opentype.js`.
- Animate SVG path strokes to simulate handwriting.
- Configurable animation speed, delay, easing, stroke, and fill colors.
- Automatically scales to the desired width and preserves aspect ratio.
- Optional infinite repetition of the animation.

---

## 🚀 Usage

```tsx
import { AnimatedText } from "./AnimatedText";

export default function Example() {
  return (
    <AnimatedText
      font="/fonts/MyFont.ttf"
      text="Hello World"
      width={400}
      delay={0.2}
      duration={4}
      strokeWidth={3}
      strokeColor="#ff0000"
      fillColor="#ffff00"
      timingFunction="ease-out"
      repeat={true}
    />
  );
}
