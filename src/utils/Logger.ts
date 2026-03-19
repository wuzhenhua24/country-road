export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

let currentLevel: LogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function formatTag(tag: string): string {
  return `[${tag}]`;
}

export const Logger = {
  debug(tag: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatTag(tag), ...args);
    }
  },
  info(tag: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
      console.log(formatTag(tag), ...args);
    }
  },
  warn(tag: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatTag(tag), ...args);
    }
  },
  error(tag: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(formatTag(tag), ...args);
    }
  },
};
