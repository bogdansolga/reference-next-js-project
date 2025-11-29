const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "INFO";

const shouldLog = (level: LogLevel) => LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
const prefix = (level: string) => `[${new Date().toISOString()}] [${level}]`;

const log = (level: LogLevel, method: typeof console.log) => {
  return (message: string, ...args: unknown[]) => {
    if (shouldLog(level)) {
      method(prefix(level), message, ...args);
    }
  };
};

export const logger = {
  debug: log("DEBUG", console.debug),
  info: log("INFO", console.info),
  warn: log("WARN", console.warn),
  error: log("ERROR", console.error),
};
