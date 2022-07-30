import React, { useRef, useMemo, useCallback, useEffect } from "react";
import classNames from "classnames";

import * as styles from "./gooey.module.css";

function getPath(inward, sideways) {
  return `
    m -64,
    -128 c 0,
    35.346              -28.654,
    64                  -64,
    64                  -35.346,
    0                   -64,
    -28.654             -64,
    -64                 0,
    -35.346             ${28.654 + sideways},
    ${-64 + inward}     ${64 + sideways},
    ${-64 + inward}     35.346,
    0                   ${64 - sideways},
    ${28.654 - inward}  ${64 - sideways},
    ${64 - inward} z
  `.replace(/\n/g, "");
}

function getCssPath(inward, sideways) {
  return `path("${getPath(inward, sideways)}")`;
}

const Gooey = ({ color }) => {
  const containerRef = useRef();
  const pathRef = useRef();
  const requestId = useRef(null);
  const mouseEvent = useRef(null);
  const basePath = useMemo(() => getPath(0, 0), []);

  const onAnimationFrame = useCallback(() => {
    if (containerRef.current && pathRef.current) {
      // TODO: Evaluate / improve perf? Does this reflow? Save once and recalc on window resize?
      const rect = containerRef.current.getBoundingClientRect();

      const x = mouseEvent.current.pageX - (rect.left + rect.right) / 2;
      const y = mouseEvent.current.pageY - (rect.top + rect.bottom) / 2;

      if (x * x + y * y > (rect.width * rect.width) / 4) {
        pathRef.current.style.d = getCssPath(0, 0);
      } else {
        pathRef.current.style.d = getCssPath(y, x);
      }
    }

    requestId.current = null;
  }, []);

  const onMouseMove = useCallback(
    (event) => {
      if (event.pageY > 300) {
        return;
      }

      mouseEvent.current = event;

      if (requestId.current === null) {
        requestId.current = requestAnimationFrame(onAnimationFrame);
      }
    },
    [onAnimationFrame]
  );

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);

    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  return (
    <div
      className={styles.container}
      onMouseMove={onMouseMove}
      ref={containerRef}
    >
      <svg
        width="512"
        height="512"
        version="1.1"
        viewBox="-256 -256 256 256"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.circleSvg}
      >
        <path
          ref={pathRef}
          className={classNames(styles.path, {
            [styles.pink]: color === "pink",
            [styles.blue]: color === "blue",
          })}
          id="path"
          d={basePath}
        />
      </svg>
    </div>
  );
};

export default Gooey;
