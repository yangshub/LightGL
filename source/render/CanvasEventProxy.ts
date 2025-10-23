import EventEmitter from "eventemitter3";

/**
 * 修正拼写错误: EvenetType → EventType
 */
export enum EventType {
  /** 点击 */
  click = "click",
  /** 鼠标移动 */
  move = "move",
  /** 缩放 */
  scroll = "scroll",
  /** 旋转 */
  rotate = "rotate",
  /** 拖拽：左键加移动 */
  pan = "pan",
}

type EventPosition = { x: number; y: number };

export function convertPositionToWebGLPosition(
  event: EventPosition,
  canvas: HTMLCanvasElement
): EventPosition {
  const { clientWidth, clientHeight } = canvas;
  return {
    x: (event.x / clientWidth) * 2 - 1,
    y: -(event.y / clientHeight) * 2 + 1,
  };
}

export class CanvasEventProxy extends EventEmitter<EventType> {
  private eventState = {
    isMouseDown: false,
    startX: 0,
    startY: 0,
    isBlocked: false,
  };

  private readonly abortController = new AbortController();

  constructor(private canvas: HTMLCanvasElement) {
    super();
    this.validateCanvas();
    this.initEventListeners();
  }

  private validateCanvas(): void {
    if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid canvas element provided.");
    }
  }

  private initEventListeners(): void {
    const { signal } = this.abortController;
    const options = { signal, passive: false };

    // 绑定原生事件监听器
    this.canvas.addEventListener("click", this.handleClick, options);
    this.canvas.addEventListener("mousemove", this.handleMove, options);
    this.canvas.addEventListener("wheel", this.handleScroll, options);
    this.canvas.addEventListener("mousedown", this.handleMouseDown, options);
    this.canvas.addEventListener("mouseup", this.handleMouseUp, options);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave, options);

    // 添加触摸事件支持
    this.canvas.addEventListener("touchstart", this.handleTouchStart, options);
    this.canvas.addEventListener("touchmove", this.handleTouchMove, options);
    this.canvas.addEventListener("touchend", this.handleTouchEnd, options);
  }

  private getEventPosition(e: MouseEvent | TouchEvent): EventPosition {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) * this.canvas.width) / rect.width,
      y: ((clientY - rect.top) * this.canvas.height) / rect.height,
    };
  }

  private handleClick = (e: MouseEvent): void => {
    if (this.eventState.isBlocked) return;
    const pos = this.getEventPosition(e);
    this.emit(EventType.click, pos);
  };

  private handleMove = (e: MouseEvent): void => {
    if (this.eventState.isBlocked) return;
    const pos = this.getEventPosition(e);
    this.emit(EventType.move, pos);

    if (this.eventState.isMouseDown) {
      this.emit(EventType.pan, {
        x: pos.x - this.eventState.startX,
        y: pos.y - this.eventState.startY,
      });
    }
  };

  private handleScroll = (e: WheelEvent): void => {
    if (this.eventState.isBlocked) return;
    const delta = e.deltaY;
    this.emit(EventType.scroll, { x: delta, y: delta });
    e.preventDefault();
  };

  private handleMouseDown = (e: MouseEvent): void => {
    const pos = this.getEventPosition(e);
    this.eventState = {
      ...this.eventState,
      isMouseDown: true,
      startX: pos.x,
      startY: pos.y,
    };
  };

  private handleMouseUp = (e: MouseEvent): void => {
    const pos = this.getEventPosition(e);
    this.eventState = { ...this.eventState, isMouseDown: false };

    // // 判断是否是点击事件
    // if (pos.x === this.eventState.startX && pos.y === this.eventState.startY) {
    //   if (this.eventState.isBlocked) return;
    //   this.emit(EventType.click, pos);
    // }
  };

  private handleMouseLeave = (): void => {
    this.eventState = { ...this.eventState, isMouseDown: false };
  };

  // 触摸事件处理
  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      const pos = this.getEventPosition(e);
      this.eventState = {
        ...this.eventState,
        isMouseDown: true,
        startX: pos.x,
        startY: pos.y,
      };
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 1 && this.eventState.isMouseDown) {
      const pos = this.getEventPosition(e);
      if (this.eventState.isBlocked) return;
      this.emit(EventType.pan, {
        x: pos.x - this.eventState.startX,
        y: pos.y - this.eventState.startY,
      });
      e.preventDefault(); // 阻止默认滚动行为
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      const pos = this.getEventPosition(e);
      this.eventState = {
        ...this.eventState,
        isMouseDown: false,
        startX: 0,
        startY: 0,
      };
      if (this.eventState.isBlocked) return;
      if (
        pos.x === this.eventState.startX &&
        pos.y === this.eventState.startY
      ) {
        this.emit(EventType.click, pos);
      }
    }
  };

  // 清理方法
  public destroy(): void {
    this.abortController.abort();
    this.removeAllListeners();
  }

  /**
   * 设置是否阻断事件的合成与触发
   * @param block - `true` 表示阻断，`false` 表示恢复
   */
  public blockEvents(block: boolean = true): void {
    this.eventState.isBlocked = block;
  }
}
