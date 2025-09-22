// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const sharedFieldStyles = {
  bg: 'gray.800',
  borderColor: 'gray.700',
  color: 'gray.100',
  _hover: { borderColor: 'gray.500' },
  _focusVisible: {
    borderColor: 'brand.400',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
  },
  _invalid: {
    borderColor: 'red.400',
    boxShadow: '0 0 0 1px var(--chakra-colors-red-400)',
  },
  _disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
      },
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      '*:focus-visible': {
        outline: 'none',
        boxShadow: '0 0 0 2px var(--chakra-colors-brand-400)',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: '#2d3748',
        borderRadius: 'full',
      },
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  radii: {
    md: '8px',
  },
  colors: {
    brand: {
      50: '#e4f0f7',
      100: '#b6d9ec',
      200: '#88c2e1',
      300: '#5aabd6',
      400: '#2c94cb',
      500: '#137ab2',
      600: '#0e5f8b',
      700: '#094564',
      800: '#042a3d',
      900: '#001017',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
        _focusVisible: {
          boxShadow: '0 0 0 2px var(--chakra-colors-brand-400)',
        },
      },
      variants: {
        solid: {
          bg: 'brand.400',
          color: 'gray.900',
          _hover: { bg: 'brand.300' },
          _active: { bg: 'brand.500' },
        },
        ghost: {
          _hover: { bg: 'gray.700' },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        field: sharedFieldStyles,
      },
      variants: {
        filled: {
          field: sharedFieldStyles,
        },
        outline: {
          field: sharedFieldStyles,
        },
      },
    },
    NumberInput: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        field: sharedFieldStyles,
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        field: {
          ...sharedFieldStyles,
          appearance: 'none',
        },
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          _focusVisible: {
            boxShadow: '0 0 0 2px var(--chakra-colors-brand-400)',
          },
          _selected: {
            color: 'brand.300',
            borderColor: 'brand.400',
          },
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'gray.700',
        color: 'gray.100',
        borderRadius: 'md',
        px: 3,
        py: 2,
      },
    },
  },
});

export default theme;
