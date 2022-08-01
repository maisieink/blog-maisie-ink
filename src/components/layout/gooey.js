/**
 *
 * TODO BEFORE MERGING
 *
 * - performance testing
 * - browser testing (fallback for safari?)
 * - prefers-reduced-motion
 * - fix h1 top margin on blog post pages, it moved down fro main
 * - fix side margins on logo overflow:hidden when browser window is narrow
 * - should I add more padding around the logo to be able to stretch up/down?
 *
 */

import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import classNames from "classnames";

import * as styles from "./gooey.module.css";

const STANDBY = 1;
const STRETCHING = 2;
const ANIMATING_COLLAPSE = 3;

const SVG_CIRCLE_RADIUS = 128;
const STRETCH_ANIMATION_TIME = "100";

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Returns an svg path that draws a circle, with its rightmost node translated
 * by (x, y), which results in drawing a circle stretched to the right.
 */
function getPath(x, y) {
  return `M ${128 + x},${y} C ${128 + x},${
    70.692448 + y
  } 70.692448,128 0,128 -70.692448,128 -128,70.692448 -128,0 c 0,-70.692448 57.307552,-128 128,-128 70.692448,0 ${
    128 + x
  },${57.307552 + y} ${128 + x},${128 + y} z`;
}

/**
 * `getPath` in the format required for the css `d` attribute.
 */
function getCssPath(inward, sideways) {
  return `path("${getPath(inward, sideways)}")`;
}

/**
 * Renders a circle that will move like goo when you move the mouse in and out
 * of it.
 *
 * color: 'blue' | 'pink'
 *
 * addMouseHandler and removeMouseHandler can be created from
 * useMouseEventContainer in the parent component.
 */
const Gooey = ({ color, addMouseHandler, removeMouseHandler }) => {
  const containerRef = useRef();
  const pathRef = useRef();

  /**
   * Gooey renders an svg of a circle, with the rightmost node of the svg
   * movable to "stretch" the circle. Gooey follows a state machine from
   * STANDBY -> STRETCHING -> ANIMATING_COLLAPSE
   *
   * In STANDBY, it's just waiting for the mouse cursor to enter and exit the
   * circle. When leaving the circle, state transitions to STRETCHING. The svg
   * rotates so that the moveable node is at the position where the cursor
   * exited the circle.
   *
   * In STRETCHING, the moveable node follows the mouse cursor. If the mouse
   * cursor gets too far from the circle, then the state transitions to
   * ANIMATING_COLLAPSE.
   *
   * In ANIMATING_COLLAPSE, the circle animates back to its original circle
   * shape. Once the animation is done, state transitions back to STANDBY.
   *
   * For performance, we're modifying the DOM nodes directly, and keeping
   * mutable state inside the useMemo closure. This component does not follow
   * React conventions.
   *
   * I could probably split this up some more into multiple functions to make
   * it more readable (with function names instead of comments), but this is
   * good enough for now.
   */
  const onMouseEvent = useMemo(() => {
    let state = STANDBY;
    let animationFrame = null;
    let mouseEvent = {
      current: null,
      prev: null,
    };
    let rotation = {
      sin: 0,
      cos: 1,
    };

    const onAnimationFrame = () => {
      if (
        containerRef.current &&
        pathRef.current &&
        mouseEvent.current &&
        mouseEvent.prev
      ) {
        // TODO: Do perf testing to make sure that this doesn't reflow if nothing
        // has changed since the last call? Do I need to do this measurement in
        // the animation frame vs the event handler?
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = (rect.left + rect.right) / 2 + window.scrollX;
        const centerY = (rect.top + rect.bottom) / 2 + window.scrollY;
        const circleRadius = rect.width / 4;

        const mouseX = mouseEvent.current.pageX - centerX;
        const mouseY = mouseEvent.current.pageY - centerY;

        switch (state) {
          case STANDBY:
            const prevX = mouseEvent.prev.pageX - centerX;
            const prevY = mouseEvent.prev.pageY - centerY;

            const circleRadiusSqr = circleRadius ** 2;
            const mouseRadiusSqr = mouseX ** 2 + mouseY ** 2;
            const prevMouseRadiusSqr = prevX ** 2 + prevY ** 2;

            // If the mouse moved from within the circle to outside of the
            // circle, then:
            // 1) rotate the svg so that the moveable node is where the mouse
            //    left the circle
            // 2) transition state machine to STRETCHING
            if (
              mouseRadiusSqr >= circleRadiusSqr &&
              prevMouseRadiusSqr < circleRadiusSqr
            ) {
              const mouseRadius = Math.sqrt(mouseRadiusSqr);

              rotation.cos = mouseX / mouseRadius;
              rotation.sin = mouseY / mouseRadius;

              const { cos, sin } = rotation;
              const rotationMatrix = `${cos}, ${sin}, ${-sin}, ${cos}, 0, 0`;

              pathRef.current.style.transform = `matrix(${rotationMatrix})`;

              state = STRETCHING;
            }
            break;

          case STRETCHING:
            // Transform the mouse position into the coordinate system of
            // the rotated, scaled svg. That way, when we move a node within
            // the svg, it will display where the mouse is.

            // Multiply (x, y) by the inversion of the svg's rotation matrix
            const rotatedX = mouseX * rotation.cos + mouseY * rotation.sin;
            const rotatedY = mouseX * -rotation.sin + mouseY * rotation.cos;

            // Scale (x, y) by the radio of display size to svg viewBox
            const scaledX = rotatedX / (circleRadius / SVG_CIRCLE_RADIUS);
            const scaledY = rotatedY / (circleRadius / SVG_CIRCLE_RADIUS);

            // Translate the origin from the center of the circle to the
            // the position of the moveable node on the right side of the
            // svg.
            const transformedX = scaledX - SVG_CIRCLE_RADIUS;
            const transformedY = scaledY;

            /**
             * Transition to ANIMATING_COLLAPSE if
             * - The mouse is moved 1/4 radius inward into the circle
             * - The mouse is moved one radius outside of the circle
             * - The "sideways" movement is more than the "outward" movement
             *
             * Visually, this means the mouse will "drop" the circle when
             * it's been stretched "too far."
             */
            if (
              mouseEvent.current.type === "mouseleave" ||
              transformedX < -SVG_CIRCLE_RADIUS / 4 ||
              transformedX ** 2 + transformedY ** 2 > SVG_CIRCLE_RADIUS ** 2 ||
              Math.abs(transformedY) >
                Math.abs(transformedX) + SVG_CIRCLE_RADIUS / 4
            ) {
              state = ANIMATING_COLLAPSE;

              const collapse = async () => {
                const collapseAnimationTime =
                  (Math.abs(transformedX) / SVG_CIRCLE_RADIUS) * 500 + 200;

                // Ensure that the stretching animation finishes before
                // animating the collapse.
                await timeout(STRETCH_ANIMATION_TIME);

                if (pathRef.current) {
                  pathRef.current.style.transition = `d ${collapseAnimationTime}ms cubic-bezier(.6,.22,.47,1.57)`;
                  pathRef.current.style.d = getCssPath(0, 0);
                }

                await timeout(collapseAnimationTime);

                state = STANDBY;
              };
              collapse();
            } else {
              // Otherwise, just update the path so that the moveable node
              // follows the mouse position.
              pathRef.current.style.transition = `d ${STRETCH_ANIMATION_TIME}ms`;
              pathRef.current.style.d = getCssPath(transformedX, transformedY);
            }
            break;

          case ANIMATING_COLLAPSE:
            // Nothing to do in this case, since `state` will transition to
            // STANDBY after the animation time has passed.
            break;

          default:
            break;
        }
      }

      mouseEvent.prev = mouseEvent.current;
      animationFrame = null;
    };

    const onMouseEventClosure = (event) => {
      mouseEvent.current = event;

      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(onAnimationFrame);
      }
    };

    return onMouseEventClosure;
  }, []);

  useEffect(() => {
    addMouseHandler(onMouseEvent);
    return () => removeMouseHandler(onMouseEvent);
  }, [onMouseEvent, addMouseHandler, removeMouseHandler]);

  const basePath = useMemo(() => getPath(0, 0), []);

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
 *
 * The parent component will spread {...containerProps} on the container
 * that listens for mousemove events, and will spread {...gooeyProps} on
 * any Gooey components.
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
