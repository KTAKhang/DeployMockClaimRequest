import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Mock global TextEncoder & TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
