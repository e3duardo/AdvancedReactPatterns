import React, {
  useState,
  Component,
  useLayoutEffect,
  useCallback,
  createContext,
  useMemo,
  useContext,
  useEffect,
  useRef
} from "react";
import styles from "./index.css";
import userCustomStyles from "./usage.css";
import userOrangeStyles from "./usage2.css";
import mojs from "mo-js";

const initialState = {
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

const MediumClapContext = createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({
  children,
  values = null,
  onClap,
  style: userStyles = {},
  className
}) => {
  const MAXIMUM_USER_CLAP = 50;
  const [clapState, setClapState] = useState(initialState);
  const { count } = clapState;

  const [{ clapRef, clapCountRef, clapTotalRef }, setRefState] = useState({
    initialState
  });
  const setRef = useCallback(node => {
    setRefState(prevRefState => ({
      ...prevRefState,
      [node.dataset.refkey]: node
    }));
  }, []);

  const animationTimeline = useClapAnimation({
    clapEl: clapRef,
    clapCountEl: clapCountRef,
    clatpTotalEl: clapTotalRef
  });

  const componentJustMounted = useRef(true);

  useEffect(() => {
    if (!componentJustMounted.current && !isControlled) {
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [count, onClap, isControlled]);

  const isControlled = !!values && onClap;

  const handleClapClick = () => {
    animationTimeline.replay();
    isControlled
      ? onClap()
      : setClapState(prevState => ({
          isClicked: true,
          count: Math.min(prevState.count + 1, MAXIMUM_USER_CLAP),
          countTotal:
            count < MAXIMUM_USER_CLAP
              ? prevState.countTotal + 1
              : prevState.countTotal
        }));
  };

  const getState = useCallback(() => (isControlled ? values : clapState), [
    isControlled,
    values,
    clapState
  ]);

  const memoizedValue = useMemo(() => ({ ...getState(), setRef }), [
    getState,
    setRef
  ]);

  const classNames = [styles.clap, className].join(" ").trim();
  return (
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={classNames}
        onClick={handleClapClick}
        style={userStyles}
      >
        {children}
      </button>
    </Provider>
  );
};

/**
 * subcomponents
 */
const ClapIcon = ({ style: userStyles = {}, className }) => {
  const { isClicked } = useContext(MediumClapContext);

  const classNames = [styles.icon, isClicked ? styles.checked : "", className]
    .join(" ")
    .trim();
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={classNames}
        style={userStyles}
      >
        <path d="M77.704 12.876c1.175 1.144 1.931 2.559 2.264 4.053.367-.27.756-.503 1.158-.706.971-1.92.654-4.314-.964-5.891-1.998-1.944-5.198-1.915-7.151.091l-.216.222c1.844.174 3.568.927 4.909 2.231zM48.893 26.914c.407.885.687 1.93.791 3.057l16.478-16.928c.63-.648 1.364-1.144 2.145-1.545 1.006-1.93.712-4.367-.925-5.96-2.002-1.948-5.213-1.891-7.155.108L44.722 21.575c2.321 2.261 3.098 3.024 4.171 5.339zM10.041 66.626c-.118-8.864 3.219-17.24 9.396-23.584l18.559-19.064c.727-2.031.497-4.076-.076-5.319-.843-1.817-1.314-2.271-3.55-4.451L13.501 35.645C2.944 46.489 2.253 63.277 11.239 74.94c-.729-2.681-1.161-5.462-1.198-8.314z" />
        <path d="M21.678 45.206l20.869-21.437c2.237 2.18 2.708 2.634 3.55 4.451.837 1.819.994 5.356-1.607 8.05L32.642 48.514c-.459.471-.446 1.228.028 1.689.472.457 1.228.452 1.686-.019l34.047-34.976c1.941-1.999 5.153-2.056 7.155-.108 1.998 1.944 2.03 5.159.089 7.155L50.979 47.584c-.452.464-.437 1.224.038 1.688.482.466 1.234.457 1.689-.009l28.483-29.28c1.952-2.005 5.153-2.035 7.15-.09 1.995 1.943 2.048 5.142.097 7.144L59.944 56.308c-.453.466-.441 1.223.038 1.688.469.456 1.227.449 1.678-.015l24.66-25.336c1.942-1.995 5.15-2.061 7.15-.113 2.003 1.949 2.043 5.175.101 7.17l-24.675 25.32c-.453.467-.442 1.219.038 1.688.47.457 1.231.453 1.682-.014l14.56-14.973c1.958-2.013 5.167-2.043 7.159-.107 2.011 1.96 2.051 5.152.09 7.164L64.792 87.17c-11.576 11.892-30.638 12.153-42.54.569-11.903-11.588-12.149-30.644-.574-42.533" />
      </svg>
    </span>
  );
};
const ClapCount = ({ style: userStyles = {}, className }) => {
  const { count, setRef } = useContext(MediumClapContext);

  const classNames = [styles.count, className].join(" ").trim();
  return (
    <span
      ref={setRef}
      data-refkey="clapCountRef"
      className={classNames}
      style={userStyles}
    >
      + {count}
    </span>
  );
};
const CountTotal = ({ style: userStyles = {} }) => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  return (
    <span
      ref={setRef}
      data-refkey="clapTotalRef"
      className={styles.total}
      style={userStyles}
    >
      {countTotal}
    </span>
  );
};

MediumClap.Icon = ClapIcon;
MediumClap.Count = ClapCount;
MediumClap.Total = CountTotal;

/*
 * Usage
 */
const INITIAL_STATE = {
  count: 0,
  countTotal: 2100,
  isClicked: false
};
const MAXIMUM_CLAP_VAL = 10;
const Usage = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const handleClap = () => {
    setState(({ count, countTotal }) => ({
      count: Math.min(count + 1, MAXIMUM_CLAP_VAL),
      countTotal: count < MAXIMUM_CLAP_VAL ? countTotal + 1 : countTotal,
      isClicked: true
    }));
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <MediumClap
        values={state}
        onClap={handleClap}
        className={userCustomStyles.clap}
      >
        <MediumClap.Icon
          className={`${userCustomStyles.icon} ${
            state.isClicked ? userCustomStyles.checked : ""
          }`}
        />
        <MediumClap.Count className={userCustomStyles.count} />
        <MediumClap.Total className={userCustomStyles.total} />
      </MediumClap>

      <MediumClap
        values={state}
        onClap={handleClap}
        className={userOrangeStyles.clap}
      >
        <MediumClap.Icon
          className={`${userOrangeStyles.icon} ${
            state.isClicked ? userOrangeStyles.checked : ""
          }`}
        />
        <MediumClap.Count className={userOrangeStyles.count} />
        <MediumClap.Total className={userOrangeStyles.total} />
      </MediumClap>

      {!!state.count && (
        <div
          className={styles.info}
        >{`You have clapped ${state.count} times`}</div>
      )}
    </div>
  );
};

export default Usage;
