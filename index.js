import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Platform,
  Animated,
  View,
  Dimensions,
  StatusBar,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 44 : 20) : 0;
const NAV_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 88 : 64) : 64;

const SCROLL_EVENT_THROTTLE = 16;
const DEFAULT_HEADER_MAX_HEIGHT = 170;
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = 30;
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = "#3498db";
const DEFAULT_BACKGROUND_COLOR = "#303F9F";
const DEFAULT_TITLE_COLOR = "white";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

const RNParallax = forwardRef((props, ref) => {
  const [scrollY, setScrollY] = useState(new Animated.Value(0));
  const [stickyContentHeight, setStickyContentHeight] = useState(0);
  const scroll = useRef();

  const { navbarColor, statusBarColor, containerStyle } = props;

  useImperativeHandle(ref, () => ({
    refreshScroll: () => {
      scroll.current?.scrollTo({ x: 0, y: getHeaderScrollDistance() / 2 });
    },
  }));

  const getHeaderMaxHeight = () => {
    const { headerMaxHeight } = props;
    return headerMaxHeight;
  };

  const getHeaderMinHeight = () => {
    const { headerMinHeight } = props;
    return headerMinHeight;
  };

  const getHeaderScrollDistance = () => {
    return getHeaderMaxHeight() - getHeaderMinHeight();
  };

  const getExtraScrollHeight = () => {
    const { extraScrollHeight } = props;
    return extraScrollHeight;
  };

  const getInputRange = () => {
    return [-getExtraScrollHeight(), 0, getHeaderScrollDistance()];
  };

  const getHeaderHeight = () => {
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [
        getHeaderMaxHeight() + getExtraScrollHeight(),
        getHeaderMaxHeight(),
        getHeaderMinHeight(),
      ],
      extrapolate: "clamp",
    });
  };

  const getImageOpacity = () => {
    const { minImageOpacity } = props;
    return scrollY.interpolate({
      inputRange: getInputRange(),
      outputRange: [1, 1, minImageOpacity],
      extrapolate: "clamp",
    });
  };

  const renderScrollView = () => {
    const {
      renderScrollContent,
      scrollEventThrottle,
      scrollViewStyle,
      contentContainerStyle,
      innerContainerStyle,
      scrollViewProps,
    } = props;
    const { onScroll } = scrollViewProps;

    // remove scrollViewProps.onScroll in renderScrollViewProps so we can still get default scroll behavior
    // if a caller passes in `onScroll` prop
    const renderableScrollViewProps = Object.assign({}, scrollViewProps);
    delete renderableScrollViewProps.onScroll;

    return (
      <Animated.ScrollView
        ref={scroll}
        style={[styles.scrollView, scrollViewStyle]}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: onScroll,
          }
        )}
        {...renderableScrollViewProps}
      >
        <View
          style={[
            {
              marginTop: getHeaderMaxHeight() + stickyContentHeight,
            },
            innerContainerStyle,
          ]}
        >
          {renderScrollContent()}
        </View>
      </Animated.ScrollView>
    );
  };

  const renderHeaderView = () => {
    const {
      renderHeaderContent,
      renderStickyContent,
      navbarColor,
      backgroundImage,
    } = props;
    return (
      <>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: navbarColor,
            overflow: "hidden",
            height: getHeaderHeight(),
          }}
        >
          <Animated.Image
            source={backgroundImage}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              opacity: getImageOpacity(),
            }}
          />
          {renderHeaderContent()}
        </Animated.View>
        <Animated.View
          onLayout={({ nativeEvent }) =>
            setStickyContentHeight(nativeEvent.layout.height)
          }
          style={{
            position: "absolute",
            width: "100%",
            top: getHeaderHeight(),
          }}
        >
          {renderStickyContent()}
        </Animated.View>
      </>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar backgroundColor={statusBarColor || navbarColor} />
      {renderScrollView()}
      {renderHeaderView()}
    </View>
  );
});

RNParallax.defaultProps = {
  renderScrollContent: () => <View />,
  renderHeaderContent: () => <View />,
  renderStickyContent: () => <View />,
  navbarColor: DEFAULT_NAVBAR_COLOR,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  backgroundImage: null,
  headerTitleStyle: null,
  headerMaxHeight: DEFAULT_HEADER_MAX_HEIGHT,
  headerMinHeight: DEFAULT_HEADER_MIN_HEIGHT,
  scrollEventThrottle: SCROLL_EVENT_THROTTLE,
  extraScrollHeight: DEFAULT_EXTRA_SCROLL_HEIGHT,
  backgroundImageScale: DEFAULT_BACKGROUND_IMAGE_SCALE,
  contentContainerStyle: null,
  innerContainerStyle: null,
  scrollViewStyle: null,
  containerStyle: null,
  alwaysShowTitle: true,
  alwaysShowNavBar: true,
  statusBarColor: null,
  scrollViewProps: {},
  minImageOpacity: 0,
};

// Test Comment
export default RNParallax;
