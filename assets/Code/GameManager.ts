import { _decorator, Component, Node, Collider, Label, director, ITriggerEvent, Prefab, instantiate, NodePool, AudioSource, AudioClip } from 'cc';
import { MusicManager } from './MusicManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    //全局单例：其他脚本（如 Player）通过 GameManager.instance 访问
    static instance: GameManager = null

    @property(Node)     //提示框父节点
    tipsNode: Node = null
    @property(Label)  //提示框文本组件
    tipsLabel: Label = null

    @property(Collider)  //赛车的碰撞组件（Player/Car/Saiche 上的 BoxCollider）
    playerCollider: Collider = null

    @property(Prefab)  //金币预制体组件
    coinPrefab: Prefab = null

    @property(Node)  //分数文本组件
    Coin: Node = null


    isGameOver: boolean = false  //游戏结束开关：防止碰撞回调重复执行，Player 据此停止移动

    coinScore: number = 0      //分数：收集的金币数量
    runScore: number = 0      //分数：赛车前进的距离
    startZ: number = 0    //起始位置，用于计算分数
    
    private coinPool: NodePool = new NodePool()

    protected onLoad(): void {
        const inst = GameManager.instance;
        if (inst && inst !== this) {
            this.destroy();
            return;
        }
        GameManager.instance = this ;                 //注册单例
        this.coinCreate()
        this.schedule(this.spawnCoin, 0.5)  // 每 0.5 秒生成一个金币
        this.startZ = this.playerCollider.node.worldPosition.z  //记录赛车起点
        this.playerCollider.isTrigger = true                //builtin 内置物理必须勾选触发器才有 onTriggerEnter
        this.playerCollider.on('onTriggerEnter', this.onPlayerTriggerEnter, this)
    }

    protected onDestroy(): void {
        if (GameManager.instance == this) { GameManager.instance = null }
        this.playerCollider.off('onTriggerEnter', this.onPlayerTriggerEnter, this)
        this.unschedule(this.spawnCoin)  // 游戏结束时取消生成金币的定时器
    }


    //碰撞方法：碰到终点 Win 或障碍物 Zhangai（碰撞体挂在子节点 A1~A11 上）时游戏结束
    onPlayerTriggerEnter(C: ITriggerEvent) {
        if (this.isGameOver) { return }  //已经结束则直接返回，防止多次触发重复执行

        const other: Node = C.otherCollider.node  //被碰到的对方节点
        console.log("【碰撞诊断】碰到了：", C.otherCollider.node.name)
        if (other.name == 'Win') {
            this.GameOver('恭喜通关')  //到达终点
        } else if (this.isObstacle(other)) {
            MusicManager.instance.hitMusicplay()
            this.GameOver('挑战失败')  //撞到障碍物
        } else if (other.name == 'scene') {
            this.destroyCoin(other)
        }
    }

    //判断节点是否属于障碍物 Zhangai：碰撞体挂在 A1~A11 子节点上，需要逐级向上查找父节点
    isObstacle(node: Node): boolean {
        let current: Node | null = node
        while (current) {
            if (current.name == 'Zhangai') { return true }
            current = current.parent
        }
        return false
    }

    //创建金币池：初始化 5 个金币，用于重复利用
    // 每个金币节点都有一个碰撞体（BoxCollider），用于检测 Player 碰撞
    // 每个金币节点都有一个标签（Tag），用于判断是否是金币
    coinCreate() {
        for(let i = 0; i < 5; i++) {
            const coin: Node = instantiate(this.coinPrefab)
            this.coinPool.put(coin)
        }
    }

    //生成金币：每 0.5 秒生成一个金币，生成位置随机在 -3 到 3 之间
    spawnCoin() {
        if (this.isGameOver) { return null }
        let coin: Node = null
        if (this.coinPool.size() > 0) {
           coin = this.coinPool.get()          // 池子里有，直接从池子里拿
         } 
         else { coin = instantiate(this.coinPrefab)} // 🚨 池子空了，主动造一个新的
        coin.parent = this.Coin
        if(this.playerCollider.node.worldPosition.z <= -200){
            return null
        }
        coin.setWorldPosition(Math.random() * 6 - 3,0.7,this.playerCollider.node.worldPosition.z-30)
    }

    //销毁金币：将金币放回池子，增加分数
    destroyCoin(coin: Node){
        this.node.getComponent(MusicManager).goalMusicplay()
        this.coinPool.put(coin)
        this.coinScore+=100
    }

    //游戏结束：1.锁定开关 2.激活提示框 3.显示结果和得分
    GameOver(tips: string) {
        this.isGameOver = true
        this.tipsNode.active = true
        this.tipsLabel.string = tips + String.fromCharCode(10) + '得分：' + (this.coinScore + this.runScore)
        console.log(tips + '，得分：' + (this.coinScore + this.runScore))
    }


    //重新开始：重新加载场景，所有状态随场景重置
    newGame() {  //参数是按钮相关信息 第二个参数是按钮传的参数
        director.loadScene('C2')  // 导演 加载场景or切换场景
    }


    //分数逻辑：每帧用赛车前进的距离更新分数（赛车向 -Z 方向前进）
    update(deltaTime: number) {
        if (this.isGameOver) { return }
        this.runScore = Math.floor(this.startZ - this.playerCollider.node.worldPosition.z)
    }
        
}
