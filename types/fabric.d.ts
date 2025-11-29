declare module 'fabric' {
  export namespace fabric {
    class Canvas {
      constructor(element: HTMLCanvasElement | string, options?: any);
      width?: number;
      height?: number;
      add(...objects: Object[]): Canvas;
      remove(...objects: Object[]): Canvas;
      clear(): Canvas;
      renderAll(): Canvas;
      setBackgroundColor(color: string | any, callback?: Function): Canvas;
      getObjects(): Object[];
      getActiveObject(): Object | null;
      getActiveObjects(): Object[];
      setActiveObject(object: Object): Canvas;
      discardActiveObject(): Canvas;
      bringToFront(object: Object): Canvas;
      sendToBack(object: Object): Canvas;
      bringForward(object: Object, intersecting?: boolean): Canvas;
      sendBackward(object: Object, intersecting?: boolean): Canvas;
      sendBackwards(object: Object, intersecting?: boolean): Canvas;
      requestRenderAll(): void;
      dispose(): void;
      loadFromJSON(json: any, callback?: Function, reviver?: Function): void;
      toJSON(propertiesToInclude?: string[]): any;
      toDataURL(options?: any): string;
      setWidth(value: number): Canvas;
      setHeight(value: number): Canvas;
      on(eventName: string, handler: Function): void;
      off(eventName: string, handler?: Function): void;
    }

    class Object {
      set(key: string | any, value?: any): Object;
      get(key: string): any;
      setCoords(): void;
      bringToFront(): Object;
      sendToBack(): Object;
      bringForward(intersecting?: boolean): Object;
      sendBackwards(intersecting?: boolean): Object;
      scaleToWidth(value: number): Object;
      scaleToHeight(value: number): Object;
      clone(callback?: Function, propertiesToInclude?: string[]): void;
      toJSON(propertiesToInclude?: string[]): any;
      [key: string]: any;
    }

    class Image extends Object {
      constructor(element: HTMLImageElement | string, options?: any);
      static fromURL(url: string, callback: Function, options?: any): void;
      setSrc(src: string, callback?: Function, options?: any): Object;
    }

    class IText extends Object {
      constructor(text: string, options?: ITextOptions);
      text: string;
    }

    class Text extends Object {
      constructor(text: string, options?: ITextOptions);
      text: string;
    }

    class Rect extends Object {
      constructor(options?: any);
    }

    class Circle extends Object {
      constructor(options?: any);
    }

    class Group extends Object {
      constructor(objects?: Object[], options?: any);
    }

    class Gradient {
      constructor(options?: any);
    }

    interface ITextOptions {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      fontStyle?: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      textAlign?: string;
      left?: number;
      top?: number;
      angle?: number;
      opacity?: number;
      shadow?: any;
      [key: string]: any;
    }

    interface IObjectOptions {
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      angle?: number;
      opacity?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      scaleX?: number;
      scaleY?: number;
      [key: string]: any;
    }

    const util: any;
  }

  export const fabric: typeof fabric;
}
