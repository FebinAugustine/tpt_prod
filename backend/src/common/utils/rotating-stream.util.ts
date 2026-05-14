import { Writable } from 'stream';
import {
  appendFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
  renameSync,
} from 'fs';
import { join, parse } from 'path';

export interface RotatingStreamOptions {
  interval: string;
  path: string;
  maxFiles?: number;
}

/**
 * A synchronous Writable stream that rotates its output file on a time interval.
 * Uses appendFileSync for every write — simple and reliable.
 */
export class RotatingStream extends Writable {
  private basePath: string;
  private baseName: string;
  private ext: string;
  private intervalMs: number;
  private maxFiles: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentFilePath: string = '';

  constructor(filename: string, options: RotatingStreamOptions) {
    super();
    this.basePath = options.path.endsWith('/')
      ? options.path
      : options.path + '/';
    const parsed = parse(filename);
    this.baseName = parsed.name;
    this.ext = parsed.ext;
    this.intervalMs = this.parseInterval(options.interval);
    this.maxFiles = options.maxFiles || 7;

    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }

    this.currentFilePath = this.basePath + filename;

    // Ensure the file exists immediately
    if (!existsSync(this.currentFilePath)) {
      appendFileSync(this.currentFilePath, '');
    }

    this.timer = setInterval(() => this.rotate(), this.intervalMs);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const t = this.timer;
    if (t && t.unref) t.unref();
  }

  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) return 86400000;
    const num = parseInt(match[1], 10);
    switch (match[2]) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60000;
      case 'h':
        return num * 3600000;
      case 'd':
        return num * 86400000;
      default:
        return 86400000;
    }
  }

  private makeTimestampedName(): string {
    const now = new Date();
    const ts =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      '-' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    return `${this.basePath}${this.baseName}-${ts}${this.ext}`;
  }

  private rotate(): void {
    const oldPath = this.currentFilePath;
    this.currentFilePath = this.basePath + this.baseName + this.ext;

    try {
      renameSync(oldPath, this.makeTimestampedName());
    } catch {
      // ignore rename errors — file may not exist yet
    }

    // Ensure new file exists
    if (!existsSync(this.currentFilePath)) {
      appendFileSync(this.currentFilePath, '');
    }

    this.cleanup();
  }

  private cleanup(): void {
    try {
      const files = readdirSync(this.basePath).filter((f) =>
        f.endsWith(this.ext),
      );
      if (files.length <= this.maxFiles) return;
      const sorted = files.sort();
      const toRemove = sorted.slice(0, sorted.length - this.maxFiles);
      for (const file of toRemove) {
        try {
          unlinkSync(join(this.basePath, file));
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }

  _write(
    chunk: Buffer | string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    try {
      const str = typeof chunk === 'string' ? chunk : Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      appendFileSync(this.currentFilePath, str);
      callback();
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }

  _destroy(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: Error | null,
    callback: (error?: Error | null) => void,
  ): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    callback(error ?? undefined);
  }

  override end(): this {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return super.end();
  }
}