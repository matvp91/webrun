export interface Driver {
  browserName: string;
  port: number;
  start: () => Promise<void>;
  stop: () => void;
}
