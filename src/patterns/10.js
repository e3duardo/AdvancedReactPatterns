import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
  useEffect,
  useReducer
} from "react";
import styles from "./index.css";
import userBlueStyles from "./usage3.css";
import mojs from "mo-js";

const INITIAL_STATE = {
  count: 0,
  countTotal: 267,
  isClicked: false
};

/*
 * Custom Hook for animation
 */
const useClapAnimation = ({ clapEl, clapCountEl, clatpTotalEl }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline() // we have to use function here, is lighter
  );

  useLayoutEffect(() => {
    if (!clapEl || !clapCountEl || !clatpTotalEl) {
      return;
    }

    const tlDuration = 300;

    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: tlDuration,
      scale: {
        1.3: 1
      },
      easing: mojs.easing.ease.out
    });

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: "polygon",
        radius: { 6: 0 },
        stroke: "rgb(211, 54,0,0.5)",
        strokeWith: 2,
        angle: 210,
        speed: 0.2,
        delay: 30,
        duration: tlDuration,
        ease: mojs.easing.bezier(0.1, 1, 0.3, 1)
      }
    });

    const circleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 75 },
      angle: 25,
      duration: tlDuration,
      children: {
        shape: "circle",
        fill: "rgb(149, 165, 166,0.5)",
        speed: 0.2,
        delay: 30,
        radius: { 3: 0 },
        ease: mojs.easing.bezier(0.1, 1, 0.3, 1)
        // angle: 210,
      }
    });

    const countAnimation = new mojs.Html({
      el: clapCountEl,
      opacity: { 0: 1 },
      y: { 0: -30 },
      duration: tlDuration
    }).then({
      opacity: { 1: 0 },
      delay: tlDuration / 2,
      y: -80
    });

    const countTotalAnimation = new mojs.Html({
      el: clatpTotalEl,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 }
    });

    if (typeof clapEl === "string") {
      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1, 1)";
    } else {
      clapEl.style.transform = "scale(1, 1)";
    }

    const newAnimationTimeline = animationTimeline.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      circleBurst
    ]);
    setAnimationTimeline(newAnimationTimeline);
  }, [clapEl, clapCountEl, clatpTotalEl]);
  return animationTimeline;
};

/*
 * useDOMRef Hook
 */

const useDOMRef = () => {
  const [DOMRef, setRefState] = useState({});

  const setRef = useCallback(node => {
    setRefState(prevRefState => ({
      ...prevRefState,
      [node.dataset.refkey]: node
    }));
  }, []);

  return [DOMRef, setRef];
};

/*
 * custom hook for getting previews prop/state
 */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const callFnsInSequence = (...fns) => (...args) => {
  fns.forEach(fn => fn && fn(...args));
};

/*
 * custom hook for useClapState
 */
const MAXIMUM_USER_CLAP = 50;
const reducer = ({ count, countTotal }, { type, payload }) => {
  switch (type) {
    case "clap":
      return {
        isClicked: true,
        count: Math.min(count + 1, MAXIMUM_USER_CLAP),
        countTotal: count < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal
      };
    case "reset":
      return payload;
    default:
      break;
  }
};
const useClapState = (initialState = INITIAL_STATE) => {
  const userInitialState = useRef(initialState);
  const [clapState, dispatch] = useReducer(reducer, initialState);
  const { count, countTotal } = clapState;
  const updateClapState = () => dispatch({ type: "clap" });
  const resetRef = useRef(0);
  const prevCount = usePrevious(count);
  const reset = useCallback(() => {
    if (prevCount !== count) {
      dispatch({ reset: "reset", payload: userInitialState.current });
      resetRef.current++;
    }
  }, [prevCount, count]);

  const getTogglerProps = ({ onClick, ...otherProps }) => ({
    onClick: callFnsInSequence(updateClapState, onClick),
    "aria-pressed": clapState.isClicked,
    ...otherProps
  });

  const getCounterProps = ({ ...otherProps }) => ({
    count,
    "aria-valuemax": MAXIMUM_USER_CLAP,
    "aria-valuemin": 0,
    "aria-valuenow": count,
    ...otherProps
  });

  return {
    clapState,
    updateClapState,
    getTogglerProps,
    getCounterProps,
    reset,
    resetDep: resetRef.current
  };
};

/*
 * custom useEffectAfterMount hook
 */
const useEffectAfterMount = (cb, deps) => {
  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      return cb();
    }
    componentJustMounted.current = false;
  }, deps);
};

/**
 * subcomponents
 */

const ClapContainer = ({ children, setRef, handleClick, ...restProps }) => {
  return (
    <button
      ref={setRef}
      className={styles.clap}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

const ClapIcon = ({ isClicked }) => {
  return (
    <span>
      {isClicked ? (
        <svg width="33" height="33" className={`${styles.mediumIcon}`}>
          <g>
            <path d="M29.58 17.1l-3.85-6.78c-.37-.54-.88-.9-1.44-.99a1.5 1.5 0 0 0-1.16.28c-.42.33-.65.74-.7 1.2v.01l3.63 6.37c2.46 4.5 1.67 8.8-2.33 12.8-.27.27-.54.5-.81.73a7.55 7.55 0 0 0 4.45-2.26c4.16-4.17 3.87-8.6 2.21-11.36zm-4.83.82l-3.58-6.3c-.3-.44-.73-.74-1.19-.81a1.1 1.1 0 0 0-.89.2c-.64.51-.75 1.2-.33 2.1l1.83 3.86a.6.6 0 0 1-.2.75.6.6 0 0 1-.77-.07l-9.44-9.44c-.51-.5-1.4-.5-1.9 0a1.33 1.33 0 0 0-.4.95c0 .36.14.7.4.95l5.6 5.61a.6.6 0 1 1-.84.85l-5.6-5.6-.01-.01-1.58-1.59a1.35 1.35 0 0 0-1.9 0 1.35 1.35 0 0 0 0 1.9l1.58 1.59 5.6 5.6a.6.6 0 0 1-.84.86L4.68 13.7c-.51-.51-1.4-.51-1.9 0a1.33 1.33 0 0 0-.4.95c0 .36.14.7.4.95l2.36 2.36 3.52 3.52a.6.6 0 0 1-.84.85l-3.53-3.52a1.34 1.34 0 0 0-.95-.4 1.34 1.34 0 0 0-.95 2.3l6.78 6.78c3.72 3.71 9.33 5.6 13.5 1.43 3.52-3.52 4.2-7.13 2.08-11.01zM11.82 7.72c.06-.32.21-.63.46-.89a1.74 1.74 0 0 1 2.4 0l3.23 3.24a2.87 2.87 0 0 0-.76 2.99l-5.33-5.33zM13.29.48l-1.92.88 2.37 2.84zM21.72 1.36L19.79.5l-.44 3.7zM16.5 3.3L15.48 0h2.04z"></path>
          </g>
        </svg>
      ) : (
        <svg
          width="33"
          height="33"
          viewBox="0 0 33 33"
          className={`${styles.mediumIcon}`}
        >
          <path d="M28.86 17.34l-3.64-6.4c-.3-.43-.71-.73-1.16-.8a1.12 1.12 0 0 0-.9.21c-.62.5-.73 1.18-.32 2.06l1.22 2.6 1.4 2.45c2.23 4.09 1.51 8-2.15 11.66a9.6 9.6 0 0 1-.8.71 6.53 6.53 0 0 0 4.3-2.1c3.82-3.82 3.57-7.87 2.05-10.39zm-6.25 11.08c3.35-3.35 4-6.78 1.98-10.47L21.2 12c-.3-.43-.71-.72-1.16-.8a1.12 1.12 0 0 0-.9.22c-.62.49-.74 1.18-.32 2.06l1.72 3.63a.5.5 0 0 1-.81.57l-8.91-8.9a1.33 1.33 0 0 0-1.89 1.88l5.3 5.3a.5.5 0 0 1-.71.7l-5.3-5.3-1.49-1.49c-.5-.5-1.38-.5-1.88 0a1.34 1.34 0 0 0 0 1.89l1.49 1.5 5.3 5.28a.5.5 0 0 1-.36.86.5.5 0 0 1-.36-.15l-5.29-5.29a1.34 1.34 0 0 0-1.88 0 1.34 1.34 0 0 0 0 1.89l2.23 2.23L9.3 21.4a.5.5 0 0 1-.36.85.5.5 0 0 1-.35-.14l-3.32-3.33a1.33 1.33 0 0 0-1.89 0 1.32 1.32 0 0 0-.39.95c0 .35.14.69.4.94l6.39 6.4c3.53 3.53 8.86 5.3 12.82 1.35zM12.73 9.26l5.68 5.68-.49-1.04c-.52-1.1-.43-2.13.22-2.89l-3.3-3.3a1.34 1.34 0 0 0-1.88 0 1.33 1.33 0 0 0-.4.94c0 .22.07.42.17.61zm14.79 19.18a7.46 7.46 0 0 1-6.41 2.31 7.92 7.92 0 0 1-3.67.9c-3.05 0-6.12-1.63-8.36-3.88l-6.4-6.4A2.31 2.31 0 0 1 2 19.72a2.33 2.33 0 0 1 1.92-2.3l-.87-.87a2.34 2.34 0 0 1 0-3.3 2.33 2.33 0 0 1 1.24-.64l-.14-.14a2.34 2.34 0 0 1 0-3.3 2.39 2.39 0 0 1 3.3 0l.14.14a2.33 2.33 0 0 1 3.95-1.24l.09.09c.09-.42.29-.83.62-1.16a2.34 2.34 0 0 1 3.3 0l3.38 3.39a2.17 2.17 0 0 1 1.27-.17c.54.08 1.03.35 1.45.76.1-.55.41-1.03.9-1.42a2.12 2.12 0 0 1 1.67-.4 2.8 2.8 0 0 1 1.85 1.25l3.65 6.43c1.7 2.83 2.03 7.37-2.2 11.6zM13.22.48l-1.92.89 2.37 2.83-.45-3.72zm8.48.88L19.78.5l-.44 3.7 2.36-2.84zM16.5 3.3L15.48 0h2.04L16.5 3.3z"></path>
        </svg>
      )}
    </span>
  );
};
const ClapCount = ({ count, setRef, ...restProps }) => {
  return (
    <span ref={setRef} className={styles.count} {...restProps}>
      + {count}
    </span>
  );
};
const CountTotal = ({ countTotal, setRef, ...restProps }) => {
  return (
    <span ref={setRef} className={styles.total} {...restProps}>
      {countTotal}
    </span>
  );
};

/*
 * Usage
 */
const userInitialState = {
  count: 0,
  countTotal: 2673,
  isClicked: false
};

const Usage = () => {
  const {
    clapState,
    updateClapState,
    getTogglerProps,
    getCounterProps,
    reset,
    resetDep
  } = useClapState(userInitialState);
  const { count, countTotal, isClicked } = clapState;
  const [{ clapRef, clapCountRef, clapTotalRef }, setRef] = useDOMRef();

  const animationTimeline = useClapAnimation({
    clapEl: clapRef,
    clapCountEl: clapCountRef,
    clatpTotalEl: clapTotalRef
  });

  useEffectAfterMount(() => {
    animationTimeline.replay();
  }, [count]);

  const [uploadingReset, setUpload] = useState(false);
  useEffectAfterMount(() => {
    setUpload(true);

    const id = setTimeout(() => {
      setUpload(false);
    }, 3000);

    return () => clearTimeout(id);
  }, [resetDep]);

  return (
    <div>
      <ClapContainer
        setRef={setRef}
        data-refkey="clapRef"
        handleClick={updateClapState}
        // className={userBlueStyles.clap}
        {...getTogglerProps({
          onClick: () => console.log("clicked!!!")
        })}
      >
        <ClapIcon
          // className={userBlueStyles.icon}
          isClicked={isClicked}
        />
        <ClapCount
          // className={userBlueStyles.count}
          setRef={setRef}
          data-refkey="clapCountRef"
          {...getCounterProps()}
        />
        <CountTotal
          // className={userBlueStyles.total}
          setRef={setRef}
          data-refkey="clapTotalRef"
          countTotal={countTotal}
        />
      </ClapContainer>
      <section>
        <button onClick={reset} className={userBlueStyles.resetBtn}>
          Reset
        </button>
        <pre className={userBlueStyles.resetMsg}>
          {JSON.stringify({ count, countTotal, isClicked })}
        </pre>
        <pre className={userBlueStyles.resetMsg}>
          {uploadingReset ? `uploading reset ${resetDep} ...` : ""}
        </pre>
      </section>
    </div>
  );
};
export default Usage;
