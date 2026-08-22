export type Theme = {
  colors: {
    bg: string;
    surface: string;
    surfaceStrong: string;
    elevated: string;
    text: string;
    textMuted: string;
    textSoft: string;
    primary: string;
    primaryHover: string;
    primarySoft: string;
    danger: string;
    dangerHover: string;
    dangerSoft: string;
    success: string;
    successSoft: string;
    successHover: string;
    border: string;
    borderStrong: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  radii: {
    btn: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
};
