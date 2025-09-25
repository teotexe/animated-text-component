import { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';
import styles from './styles.module.css.js';
import { jsx } from 'react/jsx-runtime';

function AnimatedText({
  font,
  text,
  width,
  delay = 0.1,
  duration = 3.1,
  strokeWidth = 2,
  timingFunction = "ease-in",
  strokeColor = "#ffffff",
  fillColor = "#ffffff",
  repeat = true
}) {
  const svgRef = useRef(null);
  const [paths, setPaths] = useState([]);
  const [viewBox, setViewBox] = useState("0 0 0 0");
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const paddingFactor = 5;
  useEffect(() => {
    const loadFont = async () => {
      const userFont = await new Promise((resolve, reject) => {
        opentype.load(font, (err, f) => {
          if (err || !f) reject(err);else resolve(f);
        });
      });
      let x = 0;
      const y = 100;
      const fontSize = 120;
      const spacingFactor = 0.12;
      const generatedPaths = [];
      let prevGlyph = null;
      for (const char of text) {
        const glyph = userFont.charToGlyph(char);
        const path = glyph.getPath(x, y, fontSize);
        generatedPaths.push(path.toPathData(1));
        const kerning = prevGlyph ? userFont.getKerningValue(prevGlyph, glyph) : 0;
        x += (glyph.advanceWidth ?? fontSize) * spacingFactor + kerning;
        prevGlyph = glyph;
      }
      setPaths(generatedPaths);
    };
    loadFont();
  }, [text]);

  // Compute dynamic viewBox and scale factor
  useEffect(() => {
    if (paths.length === 0) return;
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const tempGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    paths.forEach(d => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      tempGroup.appendChild(path);
    });
    tempSvg.appendChild(tempGroup);
    document.body.appendChild(tempSvg);
    const bbox = tempGroup.getBBox();
    document.body.removeChild(tempSvg);
    setViewBox(`${bbox.x} ${bbox.y} ${bbox.width + paddingFactor} ${bbox.height + paddingFactor}`);
    setHeight(bbox.height / bbox.width * width);
    setScale(width / bbox.width); // scale factor for path lengths
  }, [paths, width]);

  // Animate paths with proportional path length
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    // Create animation and prevent duplicates (useEffect runs many times)
    let styleEl = svg.querySelector("style[data-svg-anim]");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.setAttribute("data-svg-anim", "true");
      svg.appendChild(styleEl);
    }
    // Add keyframes to style
    const animationName = `svgTextAnim_${Math.random().toString(36).slice(2, 8)}`;
    styleEl.textContent = `
      @keyframes ${animationName} {
        40% { stroke-dashoffset: 0; fill: transparent; }
        60% { stroke-dashoffset: 0; fill: ${fillColor}; }
        100% { stroke-dashoffset: 0; fill: ${fillColor}; }
      }
    `;
    const pathElements = svg.querySelectorAll("path");
    const iteration = repeat ? "infinite" : "forwards";
    pathElements.forEach(path => {
      const length = path.getTotalLength() * scale;
      path.style.strokeDasharray = `${length}px`;
      path.style.strokeDashoffset = `${length}px`;
      path.style.strokeWidth = `${strokeWidth}px`;
      path.style.stroke = strokeColor;
      path.style.fill = "none";
      path.style.animation = `${animationName} ${duration}s ${timingFunction} ${delay}s ${iteration}`;
      console.log(styles.svgTextAnim);
    });
  }, [paths, strokeWidth, strokeColor, duration, delay, timingFunction, repeat, scale]);
  return /*#__PURE__*/jsx("div", {
    className: styles.container,
    children: /*#__PURE__*/jsx("svg", {
      ref: svgRef,
      width: width,
      height: height,
      viewBox: viewBox,
      preserveAspectRatio: "xMinYMid meet",
      children: /*#__PURE__*/jsx("g", {
        children: paths.map((d, i) => /*#__PURE__*/jsx("path", {
          d: d,
          vectorEffect: "non-scaling-stroke"
        }, i))
      })
    })
  });
}

export { AnimatedText };
//# sourceMappingURL=component.js.map
