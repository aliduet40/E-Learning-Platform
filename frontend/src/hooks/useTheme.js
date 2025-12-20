import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Note: This is redundant if exported from Context file, but structure demands it.
// We can re-export or re-implement. For structure strictness:
export const useTheme = () => useContext(ThemeContext);
