import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device type detection
export const isTablet = width >= 768;
export const isSmallScreen = width < 375;
export const isVerySmallScreen = width < 320;
export const isLandscape = width > height;
export const isLargeScreen = width >= 414;

// Responsive sizing functions
export const getResponsivePadding = (base: number = 20) => {
  if (isVerySmallScreen) return Math.max(base * 0.6, 12);
  if (isSmallScreen) return Math.max(base * 0.8, 16);
  if (isTablet) return base * 1.6;
  return base;
};

export const getResponsiveMargin = (base: number = 20) => {
  if (isVerySmallScreen) return Math.max(base * 0.6, 12);
  if (isSmallScreen) return Math.max(base * 0.8, 16);
  if (isTablet) return base * 1.2;
  return base;
};

export const getResponsiveFontSize = (base: number) => {
  if (isVerySmallScreen) return Math.max(base - 2, 12);
  if (isTablet) return base + 2;
  return base;
};

export const getResponsiveBorderRadius = (base: number = 12) => {
  if (isVerySmallScreen) return Math.max(base * 0.8, 8);
  if (isTablet) return base * 1.3;
  return base;
};

export const getResponsiveIconSize = (base: number = 24) => {
  if (isVerySmallScreen) return Math.max(base - 4, 16);
  if (isTablet) return base + 4;
  return base;
};

// Grid and layout helpers
export const getGridColumns = () => {
  if (isTablet) return isLandscape ? 3 : 2;
  return 2;
};

export const getCardWidth = (columns: number = 2, margin: number = 20) => {
  const totalMargin = margin * (columns + 1);
  return (width - totalMargin) / columns;
};

// Header and navigation
export const getHeaderHeight = () => {
  if (isTablet) return 80;
  return 60;
};

export const getHeaderPaddingTop = () => {
  if (isTablet) return 80;
  return 50;
};

// Button sizing
export const getButtonHeight = (base: number = 48) => {
  if (isVerySmallScreen) return Math.max(base - 4, 40);
  if (isTablet) return base + 8;
  return base;
};

export const getButtonPadding = (base: number = 16) => {
  if (isVerySmallScreen) return Math.max(base - 4, 12);
  if (isTablet) return base + 8;
  return base;
};

// Container and content sizing
export const getMaxContentWidth = () => {
  if (isTablet) return 600;
  return width;
};

export const getContentPadding = () => {
  return getResponsivePadding(20);
};

// Stats card sizing
export const getStatCardWidth = () => {
  const padding = getResponsivePadding(16);
  const gap = 12;
  return (width - (padding * 2) - gap) / 2;
};

// Action card sizing for grids
export const getActionCardWidth = (itemsPerRow: number = 2) => {
  const padding = getResponsivePadding(20);
  const gap = 12;
  const totalGap = gap * (itemsPerRow - 1);
  return (width - (padding * 2) - totalGap) / itemsPerRow;
};

// Responsive styles object
export const responsiveStyles = {
  container: {
    paddingHorizontal: getResponsivePadding(),
  },
  header: {
    paddingTop: getHeaderPaddingTop(),
    paddingHorizontal: getResponsivePadding(),
    paddingBottom: getResponsivePadding(),
  },
  content: {
    padding: getContentPadding(),
    maxWidth: getMaxContentWidth(),
    alignSelf: isTablet ? 'center' as const : 'stretch' as const,
  },
  card: {
    borderRadius: getResponsiveBorderRadius(),
    padding: getResponsivePadding(16),
  },
  button: {
    height: getButtonHeight(),
    paddingHorizontal: getButtonPadding(),
    borderRadius: getResponsiveBorderRadius(),
  },
  text: {
    title: {
      fontSize: getResponsiveFontSize(28),
    },
    subtitle: {
      fontSize: getResponsiveFontSize(16),
    },
    body: {
      fontSize: getResponsiveFontSize(14),
    },
    caption: {
      fontSize: getResponsiveFontSize(12),
    },
  },
};

// Utility function to get responsive value based on screen size
export const getResponsiveValue = (values: {
  verySmall?: any;
  small?: any;
  normal?: any;
  tablet?: any;
  landscape?: any;
}) => {
  if (isLandscape && values.landscape !== undefined) return values.landscape;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isVerySmallScreen && values.verySmall !== undefined) return values.verySmall;
  if (isSmallScreen && values.small !== undefined) return values.small;
  return values.normal;
};
