# luckPrefab

##【功能介绍】

    luckPrefab是一个仿照了ios的复用机制使用js来实现的一个可邀请好友的滚动列表。
    动态加载数据，使用有限个item来实现n个数据的滚动展示item的数量是屏幕高度比上item的高度加一。并且两个计时器实现n组数据邀请之后可再次邀请时间间隔的倒计时。
    
##【开发环境】

    cocos creator 1.8.2
    
##【demo结构简介】

    prefab.js文件
    这三个需要分别挂载在相应的节点上。

    (```)
        properties: {
    
            //需要挂载上的scorllview
            itemScrollView:{
                type:cc.Node,
                default:null,
            },
            
            //需要挂载的预制体
            prefabItem:{
                type:cc.Prefab,
                default:null,
            },
            
            //需要挂载装预制体content
            itemContent:{
                type:cc.Node,
                default:null,
            },
        },
    (```)
    

这里注意替换一下label和inviteLab对应的节点。

    'reLoadData(start_index)'

注意替换item获取Label的节点

    'upDateLableString(item)'
    
itemScrollView对应的节点的scrollview组件下的scorll event绑定方法

    'scrollEnded'

使列表显示时调用

    'showClick'
    
使列表隐藏时调用

    'hiddeClick'
    
注意要替换initPrefabItemCachePool方法中相应的节点prefabItem.getChildByName("invitebtn")

    'initPrefabItemCachePool'
    
***getData()这个方法是装载数据的，你的数据要在这里替换***

    '''
    getData(){
        //模拟获取到的数据的长度，这里随机 这个可以删除
        this.randomLength = Math.floor(Math.random()*20);
        
        //请求下来的最新的数据数组 你获取到的要形成列表的数据，要最终放到这个this.prefabData里面
        //每次请求下来直接赋值就好，这个数组非常重要
        this.prefabData = [];
        
        //先装载数据 这个可以删除，做模拟用
        for(var i = 0; i < this.randomLength; i ++) {
        this.prefabData.push(i);
        }
        
        //获取新数据，更新数据
        this._updatePrefabData();
    },
    '''
##【联系方式】

欢迎一起交流
QQ:2622030812
邮箱:2622030812@qq.com

    

    
    
    
    
    
    

