import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // ==================== Cocos Creator 生命周期函数 ====================

/**
 * onLoad
 * 触发时机：组件脚本初始化阶段，节点首次激活时（如场景载入或节点被激活）。
 * 说明：此时可安全获取场景中的其他节点和关联资源。总是在任何 start 之前执行，
 *      适合安排脚本的初始化顺序，通常用于执行初始化相关操作。
 * 注意：即使组件 enabled 为 false，onLoad 也会执行。
 */
onLoad() {
    console.log('出发0')
}

/**
 * onEnable
 * 触发时机：组件的 enabled 属性从 false 变为 true，或节点的 active 属性从 false 变为 true 时。
 * 说明：若节点首次创建且 enabled 为 true，则在 onLoad 之后、start 之前调用。
 * 注意：与 onLoad 不同，onEnable 可被多次触发（每次重新启用时都会调用）。
 */
onEnable() {}

/**
 * start
 * 触发时机：组件第一次激活前，即第一次执行 update 之前。
 * 说明：通常用于初始化一些中间状态数据，这些数据可能在 update 时发生改变，
 *      并且被频繁地 enable 和 disable。
 * 注意：start 只会在第一次激活时调用一次。
 */
start() {
    console.log('出发')
}

/**
 * update
 * 触发时机：每一帧渲染前。
 * 说明：游戏开发中更新物体行为、状态和方位的主要场所。
 * 参数：dt (deltaTime) - 距离上一帧的时间间隔，单位为秒。
 * 注意：性能敏感，避免在 update 中执行耗时操作。
 */
update(dt: number) {
    console.log('出发2')
}

/**
 * lateUpdate
 * 触发时机：所有动画、粒子、物理等动效更新之后，在所有组件的 update 都执行完之后。
 * 说明：若需要在动效更新后进行额外操作，或希望在所有组件 update 之后才执行逻辑，使用此回调。
 * 参数：dt (deltaTime) - 距离上一帧的时间间隔，单位为秒。
 * 注意：与 update 一样每帧调用，但执行顺序更晚。
 */
lateUpdate(dt: number) {
    console.log('出发00')
}

/**
 * onDisable
 * 触发时机：组件的 enabled 属性从 true 变为 false，或节点的 active 属性从 true 变为 false 时。
 * 说明：适合在此处清理在 onEnable 中注册的事件监听、计时器等资源。
 * 注意：与 onEnable 配对使用，用于资源的释放和状态的保存。
 */
onDisable() {}

/**
 * onDestroy
 * 触发时机：组件或所在节点调用了 destroy() 时。
 * 说明：组件销毁前最后调用的回调，当帧结束时统一回收组件。
 * 注意：在此处释放所有持有的资源引用，避免内存泄漏。onDestroy 只调用一次。
 */
onDestroy() {}

// ===================================================================
    
}


