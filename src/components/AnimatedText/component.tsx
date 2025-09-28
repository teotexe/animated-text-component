import { useEffect, useRef, useState } from "react";
import opentype from "opentype.js";
import styles from "./styles.module.css";

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

export function AnimatedText({
  font,
  text,
  width,
  delay = 0.1,
  duration = 3.1,
  strokeWidth = 2,
  timingFunction = "ease-in",
  strokeColor = "#ffffff",
  fillColor = "#ffffff",
  repeat = true,
}: AnimatedTextProps) {
  const svgRef = useRef<SVGSVGElement>(null); // Reference to the svg element
  const [paths, setPaths] = useState<string[]>([]); // svg paths
  const [viewBox, setViewBox] = useState("0 0 0 0");  // The size of the svg container
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const paddingFactor = 5;

  useEffect(() => {
    const loadFont = async () => {
      const userFont: opentype.Font = await new Promise((resolve, reject) => {
        opentype.load(font, (err, f) => {
          if (err || !f) reject(err);
          else resolve(f);
        });
      });

      let x = 0;
      const y = 100;
      const fontSize = 120;
      const spacingFactor = 0.12;
      const generatedPaths: string[] = [];

      let prevGlyph: opentype.Glyph | null = null;

      // Convert text to paths
      for (const char of text) 
      {
        // Convert char to path
        const glyph = userFont.charToGlyph(char);
        const path = glyph.getPath(x, y, fontSize);
        generatedPaths.push(path.toPathData(1));

        // Add kerning (spacing from the previous one)
        const kerning = prevGlyph
          ? userFont.getKerningValue(prevGlyph, glyph)
          : 0;
        // Add spacing and kerning 
        x += (glyph.advanceWidth ?? fontSize) * spacingFactor + kerning;

        prevGlyph = glyph;
      }

      setPaths(generatedPaths);
    };

    loadFont();
  }, [text]);

  // Compute dynamic viewBox to make text as big as the container
  useEffect(() => {
    if (paths.length === 0) return;

    // Render temp elements to measure size
    const tempSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    const tempGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    paths.forEach((d) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", d);
      tempGroup.appendChild(path);
    });

    tempSvg.appendChild(tempGroup);

    // Add svg to DOM to render measures and save them
    document.body.appendChild(tempSvg);
    const bbox = tempGroup.getBBox();
    document.body.removeChild(tempSvg);

    setViewBox(
      `${bbox.x} ${bbox.y} ${bbox.width + paddingFactor} ${
        bbox.height + paddingFactor
      }`
    );
    // Preserve aspect ratio
    setHeight((bbox.height / bbox.width) * width);

    // Scale to match given width
    setScale(width / bbox.width);
  }, [paths, width]);

  // Animate paths with proportional path length
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    // Create animation and prevent duplicates (useEffect runs many times)
    let styleEl = svg.querySelector(
      "style[data-svg-anim]"
    ) as HTMLStyleElement | null;

    // If first iteration create style element
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.setAttribute("data-svg-anim", "true");
      svg.appendChild(styleEl);
    }
    // Add keyframes to style (hash to avoid collisions)
    const animationName = `svgTextAnim_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    styleEl.textContent = `
      @keyframes ${animationName} {
        40% { stroke-dashoffset: 0; fill: transparent; }
        60% { stroke-dashoffset: 0; fill: ${fillColor}; }
        100% { stroke-dashoffset: 0; fill: ${fillColor}; }
      }
    `;
    
    // Add animation to each path
    const pathElements = svg.querySelectorAll("path");
    const iteration = repeat ? "infinite" : "forwards";

    pathElements.forEach((path) => {
      const length = path.getTotalLength() * scale;
      path.style.strokeDasharray = `${length}px`;   // Make it a single dash (that covers entire lenght)
      path.style.strokeDashoffset = `${length}px`;  // Offset and then animate to make it visible (Like it's drawn)
      path.style.strokeWidth = `${strokeWidth}px`;
      path.style.stroke = strokeColor;
      path.style.fill = "none";
      path.style.animation = `${animationName} ${duration}s ${timingFunction} ${delay}s ${iteration}`;
    });
  }, [
    paths,
    strokeWidth,
    strokeColor,
    duration,
    delay,
    timingFunction,
    repeat,
    scale,
  ]);

  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={viewBox}
        preserveAspectRatio="xMinYMid meet"
      >
        <g>
          {paths.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </div>
  );
}
