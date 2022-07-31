import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import classNames from "classnames";

import * as styles from "./gooey.module.css";

function getPath(x, y) {
  return `M ${128 + x},${y} C ${128 + x},${
    70.692448 + y
  } 70.692448,128 0,128 -70.692448,128 -128,70.692448 -128,0 c 0,-70.692448 57.307552,-128 128,-128 70.692448,0 ${
    128 + x
  },${57.307552 + y} ${128 + x},${128 + y} z`;
}

function getCssPath(inward, sideways) {
  return `path("${getPath(inward, sideways)}")`;
}

const Gooey = ({ color, addMouseHandler, removeMouseHandler }) => {
  const containerRef = useRef();
  const pathRef = useRef();
  const basePath = useMemo(() => getPath(0, 0), []);

  const onMouseMove = useMemo(() => {
    let requestId = null;
    let currentMouseEvent = null;
    let prevMouseEvent = null;
    let unitX = null;
    let unitY = null;
    let animating = false;
    // TODO: make this into a state machine to be more readable?
    // 'NEUTRAL' -> 'STRETCHING' -> 'ANIMATING' -> 'NEUTRAL'

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

        if (
          unitX === null &&
          unitY === null &&
          animating === false &&
          ((prevRadiusSqr < minRadiusSqr && radiusSqr > minRadiusSqr) ||
            false) /*(prevRadiusSqr > minRadiusSqr && radiusSqr < minRadiusSqr)*/
          // TODO: allow inward wobbles? might need to enqueue the exit wobble onto
          // a promise or something, since currently it's still animating when the
          // mouse leaves.
        ) {
          const radius = Math.sqrt(radiusSqr);
          unitX = x / radius;
          unitY = y / radius;

          pathRef.current.style.transform = `matrix(${unitX}, ${unitY}, ${-unitY}, ${unitX}, 0, 0)`;
          pathRef.current.style.transition = "none";
        }

        if (unitX !== null && unitY !== null && animating === false) {
          const transformedX =
            (x * unitX + y * unitY) / (rect.width / 512) - 128;
          const transformedY = (x * -unitY + y * unitX) / (rect.width / 512);

          if (
            currentMouseEvent.type === "mouseleave" ||
            transformedX < -32 ||
            transformedX > 128 ||
            transformedX ** 2 + transformedY ** 2 > 128 ** 2 ||
            Math.abs(transformedY) > Math.abs(transformedX) + 32
          ) {
            animating = true;

            setTimeout(() => {
              const time = (Math.abs(transformedX) / 128) * 0.5 + 0.2;

              if (pathRef.current) {
                pathRef.current.style.transition = `d ${time}s cubic-bezier(.6,.22,.47,1.57)`;
                //pathRef.current.offsetWidth; // eslint-disable-line no-unused-expressions
                pathRef.current.style.d = getCssPath(0, 0);
              }

              setTimeout(() => {
                unitX = null;
                unitY = null;
                animating = false;
              }, time * 1000);
            }, 100);
          } else {
            pathRef.current.style.transition = "d 0.1s";
            pathRef.current.style.d = getCssPath(transformedX, transformedY);
          }
        }
      }

      prevMouseEvent = currentMouseEvent;
      requestId = null;
    };

    const onMouseMoveClosure = (event) => {
      currentMouseEvent = event;

      if (requestId === null) {
        requestId = requestAnimationFrame(onAnimationFrame);
      }
    };

    return onMouseMoveClosure;
  }, []);

  useEffect(() => {
    addMouseHandler(onMouseMove);
    return () => removeMouseHandler(onMouseMove);
  }, [onMouseMove, addMouseHandler, removeMouseHandler]);

  return (
    <div className={styles.container} ref={containerRef}>
      <svg
        width="512"
        height="512"
        version="1.1"
        viewBox="-256 -256 512 512"
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

/**
 * This is a bit verbose, but it's just a way for the child Gooey
 * components to listen to mousemove and mouseleave events from
 * the parent component container. This is necessary since the Gooeys
 * overlap, so attaching a mousemove handler to themselves would
 * mean only the top z-index gets the pointer events.
 */
function useEventHandlers() {
  const [eventHandlers, setEventHandlers] = useState([]);

  const eventHandler = useCallback(
    (event) => {
      for (const handler of eventHandlers) {
        handler(event);
      }
    },
    [eventHandlers]
  );

  const addEventHandler = useCallback((handler) => {
    setEventHandlers((prevEventHandlers) => [...prevEventHandlers, handler]);
  }, []);

  const removeEventHandler = useCallback((handler) => {
    setEventHandlers((prevEventHandlers) =>
      prevEventHandlers.filter((prevHandler) => prevHandler !== handler)
    );
  }, []);

  return [eventHandler, addEventHandler, removeEventHandler];
}

export function useMouseEventContainer() {
  const [onMouseEvent, addMouseHandler, removeMouseHandler] =
    useEventHandlers();

  return {
    containerProps: {
      onMouseMove: onMouseEvent,
      onMouseLeave: onMouseEvent,
    },
    gooeyProps: {
      addMouseHandler,
      removeMouseHandler,
    },
  };
}
