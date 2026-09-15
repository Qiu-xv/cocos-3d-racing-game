import { _decorator, Component, Input,input,Node ,Collider, Label, director} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    // 先获取目标节点的碰撞组件
    // *若要多个组件则通过绑自身节点来获取节点下的组件：节点.getComponent(组件类型)
    // 监听碰撞触发：组件.on('触发类型', 执行函数, this)
    // 监听碰撞触发类型：onTriggerEnter 开始触发
    // 监听碰撞触发类型：onTriggerStay 持续触发
    // 监听碰撞触发类型：onTriggerExit 结束触发

    //销毁节点 节点.destory()
    //显示或隐藏节点  节点.active = true(显示)

    //控制文本组件，修改文本内容，提示框内容改变

    @property(Label)  //导入提示框文本组件
    Tips_Label: Label = null

    @property(Node)        //导入提示框父节点
    Tips_Node: Node = null

    @property(Collider)  // 导入赛车自身节点
    Player_Node: Collider = null

    //脚本中绑定节点/组件：@property(类型) 对象名：类型 = null
    @property(Node)  //导入
    C_Node: Node = null

    @property
    Player_Speed: number = 30  //设置速

    Player_Move = {a:false,d:false}  //控制角色移动
 
    More = true

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN,this.Key_Down,this)
        input.on(Input.EventType.KEY_UP,this.Key_Up,this)
        this.Player_Node.on('onTriggerEnter',this.Start_Collider,this)
    }
    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN,this.Key_Down,this)
        input.off(Input.EventType.KEY_UP,this.Key_Up,this)
        this.Player_Node.off('onTriggerEnter',this.Start_Collider,this)
    }


    //重新开始方式1
    //1.隐藏提示框节点
    //2.初始化赛车和相机位置、
    //3.开启移动开关
    //方式2  director.loadScene('场景名')
    // 优点：简单直接适合小游戏
    // 缺点：场景复杂可能加载时间长，占用性能
    New_Game(){  //参数是按钮相关信息 第二个参数是按钮传的参数
        director.loadScene('C2')  // 导演 加载场景or切换场景
         //this.Tips_Node.active = false
         //this.node.setPosition(0,0,0)
         //this.C_Node.setPosition(0,9,13)
         //this.More = true
    }


    //碰撞方法
    Start_Collider(C){
      this.More = false  //关闭移动
      this.Tips_Node.active = true //false隐藏
      if (C.otherCollider.node.name == 'Win') {
          this.Tips_Label.string = '成功了'
          console.log('成功')
      } else {
        this.Tips_Label.string = '失败了'
        console.log('失败')
      }
    }


  //键盘按下方法
    Key_Down(key){ //默认参数 是键盘按下相关信息
      if(key.keyCode == 65){
        this.Player_Move.a = true
      }else if(key.keyCode == 68){
        this.Player_Move.d = true
      }
    }


    //键盘抬起方法
    Key_Up(key){
        if(key.keyCode == 65){
        this.Player_Move.a = false
      }else if(key.keyCode == 68){
        this.Player_Move.d = false
      }
    }



    start(){

    }

    //this.node代表节点自身
    //.getPosition()获取节点位置
    //.setPosition(x,y,z)修改节点位置
    update(deltaTime: number){     //20
        if(!this.More){return}
        const P_Pos= this.node.getPosition()  //获取赛车节点位置
        const C_Pos = this.C_Node.getPosition()  //获取相机节点位置
        const s=deltaTime * this.Player_Speed //帧时间补偿
        if( this.Player_Move.a && !this.Player_Move.d ) {
            P_Pos.x = P_Pos.x - s
        }else if( this.Player_Move.d && !this.Player_Move.a ) {
            P_Pos.x= P_Pos.x + s
        }
        P_Pos.x = Math.max(Math.min(P_Pos.x,3),-3)  //最小为-3，最大为3
        this.node.setPosition(P_Pos.x, P_Pos.y, P_Pos.z-s)
        this.C_Node.setPosition(C_Pos.x, C_Pos.y, C_Pos.z-s)
    }
}
