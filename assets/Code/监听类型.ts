import { _decorator, Component, Node, Input, input, EventKeyboard, EventMouse, EventTouch, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventListenerDemo')
export class EventListenerDemo extends Component {

    private globalEventTarget: EventTarget = new EventTarget(); // 自定义全局事件中心

    protected onLoad(): void {
        this.registerGlobalInputEvents();
        this.registerNodeEvents();
        this.registerSelfNodeEvents();
        this.registerCustomEvents();
    }

    // ==========================================
    // 1. 全局输入事件 (键盘、全局鼠标、全局触摸)
    // ==========================================
    private registerGlobalInputEvents() {
        // --- 键盘事件 ---
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);

        // --- 全局鼠标事件 ---
        input.on(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onGlobalMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onGlobalMouseUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onGlobalMouseWheel, this);

        // --- 全局触摸事件 (移动端 + 桌面端) ---
        input.on(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onGlobalTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onGlobalTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onGlobalTouchCancel, this);
    }

    private onKeyDown(event: EventKeyboard) {
        console.log(`[全局键盘] 按下: ${event.keyCode}`);
    }
    private onKeyUp(event: EventKeyboard) {
        console.log(`[全局键盘] 抬起: ${event.keyCode}`);
    }
    private onKeyPressing(event: EventKeyboard) {
        // 注意：这个每帧都会触发，不要在这里写打印，否则控制台会爆炸
        // console.log(`[全局键盘] 持续按住: ${event.keyCode}`);
    }
    private onGlobalMouseDown(event: EventMouse) {
        console.log(`[全局鼠标] 按下，位置: ${event.getLocation()}`);
    }
    private onGlobalMouseMove(event: EventMouse) {
        // console.log(`[全局鼠标] 移动`); 
    }
    private onGlobalMouseUp(event: EventMouse) {
        console.log(`[全局鼠标] 抬起`);
    }
    private onGlobalMouseWheel(event: EventMouse) {
        console.log(`[全局鼠标] 滚轮滚动: ${event.getScrollY()}`);
    }
    private onGlobalTouchStart(event: EventTouch) {
        console.log(`[全局触摸] 开始，位置: ${event.getLocation()}`);
    }
    private onGlobalTouchMove(event: EventTouch) {
        // console.log(`[全局触摸] 移动`);
    }
    private onGlobalTouchEnd(event: EventTouch) {
        console.log(`[全局触摸] 结束`);
    }
    private onGlobalTouchCancel(event: EventTouch) {
        console.log(`[全局触摸] 取消`);
    }

    // ==========================================
    // 2. 节点系统事件 (鼠标、触摸，只能挂载在当前节点上)
    // ==========================================
    private registerNodeEvents() {
        // --- 鼠标事件 (作用域仅在当前节点区域内) ---
        this.node.on(Node.EventType.MOUSE_DOWN, this.onNodeMouseDown, this);
        this.node.on(Node.EventType.MOUSE_ENTER, this.onNodeMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onNodeMouseLeave, this);

        // --- 触摸事件 (作用域仅在当前节点区域内) ---
        this.node.on(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
    }

    private onNodeMouseDown(event: EventMouse) { console.log(`[节点鼠标] 在节点上按下`); }
    private onNodeMouseEnter(event: EventMouse) { console.log(`[节点鼠标] 移入节点`); }
    private onNodeMouseLeave(event: EventMouse) { console.log(`[节点鼠标] 移出节点`); }
    private onNodeTouchStart(event: EventTouch) { console.log(`[节点触摸] 在节点上触摸开始`); }
    private onNodeTouchEnd(event: EventTouch) { console.log(`[节点触摸] 在节点上触摸结束`); }

    // ==========================================
    // 3. 节点自身事件 (位置、尺寸、子节点变化)
    // ==========================================
    private registerSelfNodeEvents() {
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.onTransformChanged, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
    }

    private onTransformChanged() { console.log(`[节点自身] 位置/旋转/缩放改变了`); }
    private onSizeChanged() { console.log(`[节点自身] 尺寸改变了`); }
    private onChildAdded(child: Node) { console.log(`[节点自身] 添加了子节点: ${child.name}`); }

    // ==========================================
    // 4. 自定义事件 (通过 EventTarget)
    // ==========================================
    private registerCustomEvents() {
        // 方式一：使用节点自己的事件系统
        this.node.on('player-die', this.onPlayerDie, this);
        
        // 方式二：使用独立全局事件中心
        this.globalEventTarget.on('game-over', this.onGameOver, this);
    }

    private onPlayerDie(score: number) {
        console.log(`[自定义事件] 玩家死亡，得分: ${score}`);
    }
    private onGameOver() {
        console.log(`[自定义事件] 游戏结束`);
    }

    // 测试用：你可以通过其他脚本调用这个方法来触发自定义事件
    public testEmitEvents() {
        this.node.emit('player-die', 100); // 不冒泡
        this.globalEventTarget.emit('game-over');
    }

    // ==========================================
    // 5. 销毁时务必取消监听 (防止内存泄漏)
    // ==========================================
    protected onDestroy(): void {
        // 取消全局输入监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onGlobalMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onGlobalMouseUp, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onGlobalMouseWheel, this);
        input.off(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onGlobalTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onGlobalTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onGlobalTouchCancel, this);

        // 取消节点监听
        this.node.off(Node.EventType.MOUSE_DOWN, this.onNodeMouseDown, this);
        this.node.off(Node.EventType.MOUSE_ENTER, this.onNodeMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onNodeMouseLeave, this);
        this.node.off(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);

        // 取消节点自身监听
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.onTransformChanged, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        this.node.off(Node.EventType.CHILD_ADDED, this.onChildAdded, this);

        // 取消自定义监听
        this.node.off('player-die', this.onPlayerDie, this);
        this.globalEventTarget.off('game-over', this.onGameOver, this);
    }
}