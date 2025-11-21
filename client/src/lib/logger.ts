type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    };

    this.logs.push(entry);

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // In development, log to console with colors
    if (import.meta.env.DEV) {
      const style = this.getConsoleStyle(level);
      console.log(`%c${level.toUpperCase()}`, style, message, data || "");
      if (error) console.error(error);
    } else {
      // In production, we might want to send this to a service
      // For now, we'll still log to console but in a structured way
      if (level === "error") {
        console.error(JSON.stringify(entry));
      } else {
        console.log(JSON.stringify(entry));
      }
    }
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, error?: Error | any, data?: any) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log("error", message, data, err);
  }

  debug(message: string, data?: any) {
    if (import.meta.env.DEV) {
      this.log("debug", message, data);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      info: "color: #3b82f6; font-weight: bold;",
      warn: "color: #f59e0b; font-weight: bold;",
      error: "color: #ef4444; font-weight: bold;",
      debug: "color: #8b5cf6; font-weight: bold;",
    };
    return styles[level];
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = new Logger();
