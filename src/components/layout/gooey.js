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
  const basePath = useMemo(() => getPath(0, 0), []);

  const onMouseMove = useMemo(() => {
    let requestId = null;
    let currentMouseEvent = null;
    let prevMouseEvent = null;
    let unitX = null;
    let unitY = null;

    const onAnimationFrame = () => {
      if (
        containerRef.current &&
        pathRef.current &&
        currentMouseEvent &&
        prevMouseEvent
      ) {
        // TODO: Evaluate / improve perf? Does this reflow? Save once and recalc on window resize?
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = (rect.left + rect.right) / 2 + window.scrollX;
        const centerY = (rect.top + rect.bottom) / 2 + window.scrollY;

        const x = currentMouseEvent.pageX - centerX;
        const y = currentMouseEvent.pageY - centerY;
        const prevX = prevMouseEvent.pageX - centerX;
        const prevY = prevMouseEvent.pageY - centerY;

        const maxRadiusSqr = (rect.width / 2) ** 2;
        const minRadiusSqr = maxRadiusSqr / 4;
        const prevRadiusSqr = prevX ** 2 + prevY ** 2;
        const radiusSqr = x ** 2 + y ** 2;

        if (prevRadiusSqr < minRadiusSqr && radiusSqr > minRadiusSqr) {
          const radius = Math.sqrt(radiusSqr);
          unitX = x / radius;
          unitY = y / radius;

          // The matrix doesn't quite match the standard rotation matrix
          // since I'm subtracting 90deg, since the svg extends upward
          pathRef.current.style.transform = `matrix(${-unitY}, ${unitX}, ${-unitX}, ${-unitY}, 0, 0)`;
        }

        const transformedX = x * -unitY - y * -unitX;
        const transformedY = x * -unitX + y * -unitY;

        if (
          -transformedY < rect.width / 4 ||
          -transformedY > rect.width / 2.1 || // should be 2, but a little buffer so it doesnt get cut off
          Math.abs(transformedX) > -transformedY - rect.width / 8
        ) {
          pathRef.current.style.transition =
            "d 0.7s cubic-bezier(.6,.22,.47,1.57)";
          //pathRef.current.offsetWidth; // eslint-disable-line no-unused-expressions
          pathRef.current.style.d = getCssPath(0, 0);
          unitX = null;
          unitY = null;
        } else if (unitX !== null && unitY !== null) {
          const upward = transformedY + rect.width / 4;
          const sideways = transformedX;

          pathRef.current.style.transition = "d 0.05s";
          pathRef.current.style.d = getCssPath(upward, sideways);
        }
      }

      prevMouseEvent = currentMouseEvent;
      requestId = null;
    };

    const onMouseMoveClosure = (event) => {
      if (event.pageY > 300) {
        return;
      }

      currentMouseEvent = event;

      if (requestId === null) {
        requestId = requestAnimationFrame(onAnimationFrame);
      }
    };

    return onMouseMoveClosure;
  }, []);

  useEffect(() => {
    // TODO: Make a smaller div to attach here
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
