/**
 * Global chrome namespace fallback declarations
 */
declare namespace chrome {
  export namespace storage {
    export interface StorageChange {
      oldValue?: any;
      newValue?: any;
    }
    export interface StorageArea {
      get(keys?: string | string[] | Record<string, any> | null): Promise<Record<string, any>>;
      get(keys: string | string[] | Record<string, any> | null, callback: (items: Record<string, any>) => void): void;
      set(items: Record<string, any>): Promise<void>;
      set(items: Record<string, any>, callback?: () => void): void;
      remove(keys: string | string[]): Promise<void>;
      remove(keys: string | string[], callback?: () => void): void;
      clear(): Promise<void>;
      clear(callback?: () => void): void;
    }
    export const local: StorageArea;
    export const sync: StorageArea;
    export const onChanged: {
      addListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      removeListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      hasListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): boolean;
    };
  }

  export namespace runtime {
    export const id: string;
    export function sendMessage(message: any): Promise<any>;
    export function sendMessage(message: any, responseCallback: (response: any) => void): void;
    export const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void;
      removeListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    };
    export const onInstalled: {
      addListener(callback: (details: { reason: string; previousVersion?: string }) => void): void;
    };
  }

  export namespace contextMenus {
    export interface CreateProperties {
      id?: string;
      title?: string;
      contexts?: string[];
      parentId?: string | number;
      type?: string;
    }
    export function create(createProperties: CreateProperties, callback?: () => void): string | number;
    export const onClicked: {
      addListener(callback: (info: any, tab?: any) => void): void;
    };
  }

  export namespace commands {
    export const onCommand: {
      addListener(callback: (command: string, tab?: any) => void): void;
    };
  }

  export namespace tabs {
    export function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<any[]>;
    export function sendMessage(tabId: number, message: any): Promise<any>;
    export function sendMessage(tabId: number, message: any, responseCallback: (response: any) => void): void;
  }
}
