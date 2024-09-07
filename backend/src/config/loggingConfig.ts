import { createLogger, format, transports, Logger } from "winston";

import { env } from "../utils/env";
import { SentryTransport } from "./sentryConnection";

// define the logging configuration logic
export const getLoggerConfig = (): { level: string; format: any; transports: any[] } => {
  let logLevel: string = '';
  let logFormat: any;
  const loggerTransports: any[] = [];

  const consoleLogFormat = format.combine(format.colorize(), format.simple());
  const consoleLogTransport = new transports.Console({ format: consoleLogFormat });
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'sandbox') {
    logLevel = 'info';
    logFormat = consoleLogFormat;
    loggerTransports.push(consoleLogTransport);
  } else if (env.NODE_ENV === 'production') {
    logLevel = 'error';
    logFormat = format.combine(format.timestamp(), format.json());
    loggerTransports.push(new SentryTransport({ stream: process.stdout })); // Log to Sentry
    loggerTransports.push(consoleLogTransport); // Log to pod as well
  } 

  return { level: logLevel, format: logFormat, transports: loggerTransports };
};

// Create the logger using the configuration
const loggerConfig = getLoggerConfig();

// set up Winston logger accordingly
const logger: Logger = createLogger({
  level: loggerConfig.level,
  format: loggerConfig.format,
  transports: loggerConfig.transports
});

export default logger;
