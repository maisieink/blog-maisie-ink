import classNames from "classnames";
import React, { useState, useCallback, useEffect, useRef } from "react";
import * as styles from "./led-animation.module.css";

const sideLeds = [0, 1, 2, 3, 4, 5, 6];

const LedAnimation = ({ leftHue, leftFade, rightHue, rightFade }) => {
  const leftRef = useRef();
  const rightRef = useRef();

  // Force reflow when the fading animation class changes
  useEffect(() => {
    if (leftRef.current) {
      // eslint-disable-next-line
      leftRef.current.offsetWidth;
    }
  }, [leftFade]);

  useEffect(() => {
    if (rightRef.current) {
      // eslint-disable-next-line
      rightRef.current.offsetWidth;
    }
  }, [rightFade]);

  return (
    <div className={styles.leds}>
      <div className={styles.left} ref={leftRef}>
        {sideLeds.map((i) => (
          <div key={i} className={styles.led}>
            <div
              className={classNames(styles.ledInner, leftFade)}
              style={{
                boxShadow: `0 0 12px 8px hsl(${leftHue}, 100%, 50%, 1)`,
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.right} ref={rightRef}>
        {sideLeds.map((i) => (
          <div key={i} className={styles.led}>
            <div
              className={classNames(styles.ledInner, rightFade)}
              style={{
                boxShadow: `0 0 12px 8px hsl(${rightHue}, 100%, 50%, 1)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default LedAnimation;

export const ChangeAllAnimation = () => {
  const [hue, setHue] = useState(100);

  const changeColor = useCallback(
    () => setHue(Math.floor(Math.random() * 256)),
    []
  );

  return (
    <div>
      <div className={styles.buttonContainer}>
        <button onClick={changeColor}>Send keypress</button>
      </div>
      <LedAnimation leftHue={hue} rightHue={hue} />
    </div>
  );
};

export const ChangeSideAnimation = () => {
  const [leftHue, setLeftHue] = useState(100);
  const [rightHue, setRightHue] = useState(200);

  const changeLeftColor = useCallback(
    () => setLeftHue(Math.floor(Math.random() * 256)),
    []
  );

  const changeRightColor = useCallback(
    () => setRightHue(Math.floor(Math.random() * 256)),
    []
  );

  return (
    <div>
      <div className={classNames(styles.buttonContainer, styles.multiple)}>
        <button onClick={changeLeftColor}>Send left keypress</button>
        <button onClick={changeRightColor}>Send right keypress</button>
      </div>
      <LedAnimation leftHue={leftHue} rightHue={rightHue} />
    </div>
  );
};

export const FadeOutAnimation = () => {
  const [leftHue, setLeftHue] = useState(100);
  const [rightHue, setRightHue] = useState(200);
  const [leftFade, setLeftFade] = useState(true);
  const [rightFade, setRightFade] = useState(true);

  const changeLeftColor = useCallback(() => {
    setLeftFade(false);
    setLeftHue(Math.floor(Math.random() * 256));
  }, []);

  useEffect(() => {
    // Immediately add the fade className back after we've repainted at full opacity, to re-trigger the animation
    setLeftFade(true);
  }, [leftFade]);

  const changeRightColor = useCallback(() => {
    setRightFade(false);
    setRightHue(Math.floor(Math.random() * 256));
  }, []);

  useEffect(() => {
    setRightFade(true);
  }, [rightFade]);

  return (
    <div>
      <div className={classNames(styles.buttonContainer, styles.multiple)}>
        <button onClick={changeLeftColor}>Send left keypress</button>
        <button onClick={changeRightColor}>Send right keypress</button>
      </div>
      <LedAnimation
        leftHue={leftHue}
        rightHue={rightHue}
        leftFade={leftFade ? styles.linearFade : undefined}
        rightFade={rightFade ? styles.linearFade : undefined}
      />
    </div>
  );
};

export const EaseComparisonAnimation = () => {
  const [hue, setHue] = useState(100);
  const [fade, setFade] = useState(true);

  const changeLeftColor = useCallback(() => {
    setFade(false);
    setHue(Math.floor(Math.random() * 256));
  }, []);

  useEffect(() => {
    setFade(true);
  }, [fade]);

  return (
    <div>
      <div className={classNames(styles.buttonContainer, styles.multiple)}>
        <span>linear</span>
        <button onClick={changeLeftColor}>Send keypress</button>
        <span>cubic easing</span>
      </div>
      <LedAnimation
        leftHue={hue}
        rightHue={hue}
        leftFade={fade ? styles.linearFade : undefined}
        rightFade={fade ? styles.easeFade : undefined}
      />
    </div>
  );
};

export const EaseAnimation = () => {
  const [leftHue, setLeftHue] = useState(100);
  const [rightHue, setRightHue] = useState(200);
  const [leftFade, setLeftFade] = useState(true);
  const [rightFade, setRightFade] = useState(true);

  const changeLeftColor = useCallback(() => {
    setLeftFade(false);
    setLeftHue(Math.floor(Math.random() * 256));
  }, []);

  useEffect(() => {
    setLeftFade(true);
  }, [leftFade]);

  const changeRightColor = useCallback(() => {
    setRightFade(false);
    setRightHue(Math.floor(Math.random() * 256));
  }, []);

  useEffect(() => {
    setRightFade(true);
  }, [rightFade]);

  return (
    <div>
      <div className={classNames(styles.buttonContainer, styles.multiple)}>
        <button onClick={changeLeftColor}>Send left keypress</button>
        <button onClick={changeRightColor}>Send right keypress</button>
      </div>
      <LedAnimation
        leftHue={leftHue}
        rightHue={rightHue}
        leftFade={leftFade ? styles.easeFade : undefined}
        rightFade={rightFade ? styles.easeFade : undefined}
      />
    </div>
  );
};
