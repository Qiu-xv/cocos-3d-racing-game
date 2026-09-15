import { _decorator, Component, Input, input, Node, EventTouch } from 'cc';
// import { EventKeyboard, KeyCode } from 'cc';  //键盘输入（适配微信小游戏触摸控制后停用，保留备查）
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    //脚本中绑定节点/组件：@property(类型) 对象名：类型 = null
    @property(Node)  //导入相机节点，跟随赛车移动
    cameraNode: Node = null

    @property
    moveSpeed: number = 30  //设置速度

    @property
    touchSensitivity: number = 0.01  //触摸滑动灵敏度：滑动像素 × 该系数 = 赛车横向位移（世界单位），可在编辑器调整手感

    @property
    boostSpeed: number = 60  //按住屏幕加速时的速度（对应原键盘 Shift 加速）

    // moveInput = {a:false,d:false}  //键盘控制左右移动（已停用）
    touchDeltaX: number = 0  //本帧触摸水平偏移量累加（getDelta().x，右滑为正、左滑为负），在 update 中消费后清零
    touchCount: number = 0  //当前按住屏幕的手指数：>0 表示按住状态，处于加速
    normalSpeed: number = 0  //普通速度：start 时记录 moveSpeed 的场景配置值，抬起手指后恢复到它

    protected onLoad(): void {
        //键盘监听（适配微信小游戏，已注释停用）
        //input.on(Input.EventType.KEY_DOWN,this.Key_Down,this)
        //input.on(Input.EventType.KEY_UP,this.Key_Up,this)

        //触摸监听：滑动控制左右（TOUCH_MOVE），按住/抬起控制加速（TOUCH_START/END/CANCEL）
        input.on(Input.EventType.TOUCH_START,this.onTouchStart,this)
        input.on(Input.EventType.TOUCH_MOVE,this.onTouchMove,this)
        input.on(Input.EventType.TOUCH_END,this.onTouchEnd,this)
        input.on(Input.EventType.TOUCH_CANCEL,this.onTouchEnd,this)  //手指移出屏幕/系统打断时按抬起处理，避免一直加速
    }
    protected onDestroy(): void {
        //键盘解绑（已注释停用）
        //input.off(Input.EventType.KEY_DOWN,this.Key_Down,this)
        //input.off(Input.EventType.KEY_UP,this.Key_Up,this)

        input.off(Input.EventType.TOUCH_START,this.onTouchStart,this)
        input.off(Input.EventType.TOUCH_MOVE,this.onTouchMove,this)
        input.off(Input.EventType.TOUCH_END,this.onTouchEnd,this)
        input.off(Input.EventType.TOUCH_CANCEL,this.onTouchEnd,this)
    }


    //手指按下：计数 +1，进入加速（替代原键盘 Shift）
    onTouchStart(){
        this.touchCount++
        this.moveSpeed = this.boostSpeed
    }

    //触摸滑动方法：累加水平偏移量，真正的位移在 update 中统一执行（保证帧时间补偿和边界限制一致）
    onTouchMove(event: EventTouch){
        this.touchDeltaX += event.getDelta().x
    }

    //手指抬起：计数 -1，所有手指都离开后恢复普通速度
    onTouchEnd(){
        this.touchCount = Math.max(0,this.touchCount - 1)
        if(this.touchCount == 0){
            this.moveSpeed = this.normalSpeed
        }
    }


  //键盘按下方法（适配微信小游戏，已注释停用）
    /*Key_Down(event: EventKeyboard){ //默认参数 是键盘按下相关信息
      if(event.keyCode == KeyCode.KEY_A){
        this.moveInput.a = true
      }else if(event.keyCode == KeyCode.KEY_D){
        this.moveInput.d = true
      }else if(event.keyCode == KeyCode.SHIFT_LEFT){
        this.moveSpeed = 60
      }
    }


    //键盘抬起方法（适配微信小游戏，已注释停用）
    Key_Up(event: EventKeyboard){
        if(event.keyCode == KeyCode.KEY_A){
        this.moveInput.a = false
      }else if(event.keyCode == KeyCode.KEY_D){
        this.moveInput.d = false
      }else if(event.keyCode == KeyCode.SHIFT_LEFT){
        this.moveSpeed = 30
      }
    }*/



    start(){
        this.normalSpeed = this.moveSpeed  //记录普通速度（即编辑器里配置的 moveSpeed，当前场景为 20），抬起手指后恢复
    }

    //this.node代表节点自身
    //.getPosition()获取节点位置
    //.setPosition(x,y,z)修改节点位置
    update(deltaTime: number){     //20
        if(GameManager.instance && GameManager.instance.isGameOver){return}  //游戏结束后赛车和相机停止移动（结束状态由 GameManager 管理）
        const P_Pos= this.node.getPosition()  //获取赛车节点位置
        const C_Pos = this.cameraNode.getPosition()  //获取相机节点位置
        const s=deltaTime * this.moveSpeed //帧时间补偿（纵向前进速度）

        //触摸滑动控制左右：右滑 touchDeltaX 为正→赛车向 +x，左滑为负→向 -x
        P_Pos.x = P_Pos.x + this.touchDeltaX * this.touchSensitivity
        this.touchDeltaX = 0  //本帧偏移已消费，清零等待下一帧滑动事件累加

        P_Pos.x = Math.max(Math.min(P_Pos.x,3),-3)  //最小为-3，最大为3
        this.node.setPosition(P_Pos.x, P_Pos.y, P_Pos.z-s)
        this.cameraNode.setPosition(C_Pos.x, C_Pos.y, C_Pos.z-s)
    }
}
