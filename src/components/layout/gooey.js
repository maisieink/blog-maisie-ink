/**
 *
 * TODO BEFORE MERGING
 *
 * - performance testing
 * - browser testing (fallback for safari?)
 * - prefers-reduced-motion
 * - move out of useMemo into ref
 * - move measurement functions into event handler
 * - fix h1 top margin on blog post pages, it moved down fro main
 * - fix side margins on logo overflow:hidden when browser window is narrow
 * - should I add more padding around the logo to be able to stretch up/down?
 * - make it pick up on faster mouse movements (?) (sub-frame cascaded events?)
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

/**
 * Util function for a timeout that can be used with `await`
 */
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Returns an svg path that draws a circle, with its rightmost node translated
 * by (x, y), which results in drawing a circle stretched to the right.
 *
 * Created by exporting a circle path from Inkscape, then exporting versions
 * with the rightmost node moved right or down, to see which numbers changed.
 * I don't actually understand the path syntax.
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
 * <Gooey /> renders an svg of a circle, with the rightmost node of the svg
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
 * TODO: Is this actually faster than a setState -> re-render with style prop?
 */
const STANDBY = 1,
  STRETCHING = 2,
  ANIMATING_COLLAPSE = 3;
const SVG_CIRCLE_RADIUS = 128;
const STRETCH_ANIMATION_TIME = 100;

function createGooeyMouseEventHandler(containerRef, pathRef) {
  // State variables
  let state = STANDBY;
  let animationFrame = null;
  let circle = {
    clientCenterX: 0,
    clientCenterY: 0,
    clientRadius: 1,
  };
  let mouseEvent = {
    current: { clientX: 0, clientY: 0, type: null },
    prev: { clientX: 0, clientY: 0, type: null },
  };
  let rotation = {
    sin: 0,
    cos: 1,
  };

  // Called when the mouse goes too far away from the circle, to collapse the
  // circle back to its original position.
  const collapse = async (collapseAnimationTime) => {
    state = ANIMATING_COLLAPSE;

    // Ensure that the stretching animation finishes before
    // animating the collapse.
    await timeout(STRETCH_ANIMATION_TIME);

    requestAnimationFrame(() => {
      if (pathRef.current) {
        pathRef.current.style.transition = `d ${collapseAnimationTime}ms cubic-bezier(.6,.22,.47,1.57)`;
        pathRef.current.style.d = getCssPath(0, 0);
      }
    });

    await timeout(collapseAnimationTime);

    state = STANDBY;
  };

  // Main state machine function
  const onAnimationFrame = () => {
    if (pathRef.current && mouseEvent.current.type && mouseEvent.prev.type) {
      const mouseX = mouseEvent.current.clientX - circle.clientCenterX;
      const mouseY = mouseEvent.current.clientY - circle.clientCenterY;

      switch (state) {
        case STANDBY:
          const prevX = mouseEvent.prev.clientX - circle.clientCenterX;
          const prevY = mouseEvent.prev.clientY - circle.clientCenterY;

          const circleRadiusSqr = circle.clientRadius ** 2;
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
          const scaledX = rotatedX / (circle.clientRadius / SVG_CIRCLE_RADIUS);
          const scaledY = rotatedY / (circle.clientRadius / SVG_CIRCLE_RADIUS);

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
            const collapseAnimationTime =
              (Math.abs(transformedX) / SVG_CIRCLE_RADIUS) * 500 + 200;

            collapse(collapseAnimationTime);
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

    mouseEvent.prev.clientX = mouseEvent.current.clientX;
    mouseEvent.prev.clientY = mouseEvent.current.clientY;
    mouseEvent.prev.type = mouseEvent.current.type;
    animationFrame = null;
  };

  const onMouseEvent = (event) => {
    if (containerRef.current) {
      // Because clientX, clientY and getBoundingClientRect can trigger reflow,
      // measure them now, before any layout changes have happened in the
      // animation frame. For example, if we have two Gooeys render on the
      // page, we want this behavior:
      //
      // Gooey #1 mouseEvent: measure
      // Gooey #2 mouseEvent: measure <-- does not trigger reflow since
      //                                  Gooey #1 waited until animation
      //                                  frame to make changes
      // Gooey #1 animationFrame: make changes
      // Gooey #2 animationFrame: make changes
      //
      // Might not matter in this specific case, since we're not modifying any
      // styles that would affect layout, but it could if there are other
      // components in the app performing similar DOM modifications.
      mouseEvent.current.clientX = event.clientX;
      mouseEvent.current.clientY = event.clientY;
      mouseEvent.current.type = event.type;

      const rect = containerRef.current.getBoundingClientRect();
      circle.clientCenterX = (rect.left + rect.right) / 2;
      circle.clientCenterY = (rect.top + rect.bottom) / 2;
      circle.clientRadius = rect.width / 4;

      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(onAnimationFrame);
      }
    }
  };

  return onMouseEvent;
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
  const onMouseEvent = useRef();

  useEffect(() => {
    if (!onMouseEvent.current) {
      onMouseEvent.current = createGooeyMouseEventHandler(
        containerRef,
        pathRef
      );
    }

    addMouseHandler(onMouseEvent.current);
    return () => removeMouseHandler(onMouseEvent.current);
  }, [addMouseHandler, removeMouseHandler]);

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
