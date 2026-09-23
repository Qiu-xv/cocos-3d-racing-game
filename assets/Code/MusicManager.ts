import { _decorator, AudioClip,  AudioSource,  Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MusicManager')
export class MusicManager extends Component {
   @property(AudioClip)
   hitMusic: AudioClip = null
   @property(AudioClip)
   goalMusic: AudioClip = null

   private audioSource: AudioSource = null

   static instance: MusicManager = null
   protected onLoad(): void {
       if(MusicManager.instance&&MusicManager.instance !== this){
        this.node.destroy()
        return
       }
        MusicManager.instance = this
   }

   protected onDestroy(): void {
       if(MusicManager.instance === this){
        MusicManager.instance = null
       }
   }

   //播放碰撞音效
   hitMusicplay(){
    if (this.hitMusic) { 
        this.audioSource = this.node.getComponent(AudioSource)
        this.audioSource.clip = this.hitMusic
        this.audioSource.play()
        this.audioSource.volume = 0.5
    }
   }

   //播放金币音效
   goalMusicplay(){
    if (this.goalMusic) { 
        this.audioSource = this.node.getComponent(AudioSource)
        this.audioSource.clip = this.goalMusic
        this.audioSource.play()
        this.audioSource.volume = 0.5
    }
   }

   
}


