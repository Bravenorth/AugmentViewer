// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
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
});

export default theme;
