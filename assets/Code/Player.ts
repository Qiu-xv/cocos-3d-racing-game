import { _decorator, Component, Input, input, Node, EventKeyboard, KeyCode } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    //脚本中绑定节点/组件：@property(类型) 对象名：类型 = null
    @property(Node)  //导入相机节点，跟随赛车移动
    cameraNode: Node = null

    @property
    moveSpeed: number = 30  //设置速度

    moveInput = {a:false,d:false}  //控制角色移动

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN,this.Key_Down,this)
        input.on(Input.EventType.KEY_UP,this.Key_Up,this)
    }
    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN,this.Key_Down,this)
        input.off(Input.EventType.KEY_UP,this.Key_Up,this)
    }


  //键盘按下方法
    Key_Down(event: EventKeyboard){ //默认参数 是键盘按下相关信息
      if(event.keyCode == KeyCode.KEY_A){
        this.moveInput.a = true
      }else if(event.keyCode == KeyCode.KEY_D){
        this.moveInput.d = true
      }else if(event.keyCode == KeyCode.SHIFT_LEFT){
        this.moveSpeed = 60
      }
    }


    //键盘抬起方法
    Key_Up(event: EventKeyboard){
        if(event.keyCode == KeyCode.KEY_A){
        this.moveInput.a = false
      }else if(event.keyCode == KeyCode.KEY_D){
        this.moveInput.d = false
      }else if(event.keyCode == KeyCode.SHIFT_LEFT){
        this.moveSpeed = 30
      }
    }



    start(){

    }

    //this.node代表节点自身
    //.getPosition()获取节点位置
    //.setPosition(x,y,z)修改节点位置
    update(deltaTime: number){     //20
        if(GameManager.instance && GameManager.instance.isGameOver){return}  //游戏结束后赛车和相机停止移动（结束状态由 GameManager 管理）
        const P_Pos= this.node.getPosition()  //获取赛车节点位置
        const C_Pos = this.cameraNode.getPosition()  //获取相机节点位置
        const s=deltaTime * this.moveSpeed //帧时间补偿
        if( this.moveInput.a && !this.moveInput.d ) {
            P_Pos.x = P_Pos.x - s
        }else if( this.moveInput.d && !this.moveInput.a ) {
            P_Pos.x= P_Pos.x + s
        }
        P_Pos.x = Math.max(Math.min(P_Pos.x,3),-3)  //最小为-3，最大为3
        this.node.setPosition(P_Pos.x, P_Pos.y, P_Pos.z-s)
        this.cameraNode.setPosition(C_Pos.x, C_Pos.y, C_Pos.z-s)
    }
}
