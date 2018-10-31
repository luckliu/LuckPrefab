
cc.Class({
    extends: cc.Component,

    properties: {

        //需要挂载上的scorllview
        itemScrollView:{
            type:cc.Node,
            default:null,
        },

        //预制体
        prefabItem:{
            type:cc.Prefab,
            default:null,
        },

        //装预制体content
        itemContent:{
            type:cc.Node,
            default:null,
        },
    },

    start () {

        cc.jsInstance = {

        }

        //只初始化一次的数据
        this.initDataOnlyOnce();
        
		//初始化数据
        this.initData();
        
        //预制体缓存池，只初始化一次
        this.initPrefabItemCachePool();

        //装载数据 从0开始
        this.reLoadData(this.start_index);
        
        //监听滑动结束事件
        this.itemScrollView.on("scroll-ended", this.scrollEnded.bind(this), this);
        
        //启动定时器
		this.beginCountDown();
    },

    initDataOnlyOnce(){
        if(cc.jsInstance.countDownLeftTime){
            this.countDownLeftTime = cc.jsInstance.countDownLeftTime.slice(0);
        }else{
            this.countDownLeftTime = [];                                    //记录每个item剩余时间的大数组 
        }
        this.initStart_Y = this.itemContent.y;                          //列表content的初始y的位置 
        this.prefabItemCachePool = [];                                  //所有预制体的存放池
        this.itemContentHeight = this.itemContent._contentSize.height   //content高度
		this.itemHeight = this.prefabItem.data._contentSize.height		//预制体的高度
    },

    //tableview 刷新数据
    reLoadData(start_index){
        this.start_index = start_index;
        for(var i = 0; i < this.prefabItemCachePool.length; i ++) {
            var friendItemPrefab = this.prefabItemCachePool[i];
            //注意替换节点
			var label = friendItemPrefab.getChildByName("name").getComponent(cc.Label);
            var inviteLab = friendItemPrefab.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label);
            
            friendItemPrefab.physicalLocation = start_index+i;
            
			if(start_index + i < this.countDownLeftTime.length-1){
				friendItemPrefab.active = true;
                var itemTemp = this.countDownLeftTime[start_index+i];
                
                //赋值
                if(itemTemp.isClicked){
                    inviteLab.string = itemTemp.time;
                }else{
                    inviteLab.string = "邀请";
                }
                //this.prefabData 对象取到name
                label.string = this.prefabData[start_index+i];
            }else{
                friendItemPrefab.active = false;
				continue;
            }
            
			
        }
	},

    //更新UI
	upDateLableString(item){
        var self = this;
        //定时器2，做赋值操作
		this.schedule(function(){
			var index = item.physicalLocation;
			var tempItem = self.countDownLeftTime[index];
			if(tempItem.isClicked){
                //注意替换节点
				item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = tempItem.time;
			}else{
				item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = "邀请";
				tempItem.isClicked = false;
				tempItem.time = 120;
			}
		},1);
	},

	scrollEnded(){
		this._scrollveiwDidScrolled();
		this.node.getChildByName("testScroll").elastic = true;
	},


	_scrollveiwDidScrolled(){
        //因为只拿了一个item复用，所以滑动的范围只要大于1就要重新加载
        //向下滑
        var isScrollDown = (this.start_index + this.page_num < this.prefabData.length&&this.itemContent.y - this.start_y >= this.itemHeight);
		if(isScrollDown){
            this._scrollDown();
            return;
        }

        //向上滑
        var isScrollUp = (this.start_index > 0&& this.start_y - this.itemContent.y >= 0);
		if(isScrollUp){
			this._scrollUp();
		}
    },
    
    _scrollDown(){
        //如果滑动的范围大于了1个item的高度，就要去加载新的数据
        //每次加载一个数据

        if(this.itemScrollView._autoScrolling){
            this.itemScrollView.elastic = false;
            return;
        }

        var down_loaded = 1;
        this.start_index += down_loaded;

        //如果往后再加载一个数据就超过了总的数据长度
        console.log("start_index==",this.start_index);
        console.log("this.prefabData.length==",this.prefabData.length);
        if(this.start_index + this.page_num > this.prefabData.length){
            //down_loaded要剪掉超过的项
            var out_len = (this.start_index + this.page_num) - this.prefabData.length; //超过的长度
            down_loaded -= out_len;
            this.start_index -= out_len;
            console.log("out out out out !!");
        }
        this.reLoadData(this.start_index);
        this.itemContent.y -= down_loaded*this.itemHeight;            
    },

    _scrollUp(){
        if(this.itemScrollView._autoScrolling){
            this.itemScrollView.elastic = false;
            return;
        }
        var up_loaded = 1;
        this.start_index -= up_loaded;
        if(this.start.index < 0){
            up_loaded += this.start_index;
            this.start_index = 0;
        }
        this.reLoadData(this.start_index);
        this.itemContent.y += up_loaded*this.itemHeight;
    },

    /**
     * 列表的显示与隐藏
     */
    showClick(){
		this.itemScrollView.active = true;
		//重新获取数据
		this.initData();
    },

    hiddeClick(){
        this.itemScrollView.active = false;
    },

	//定时器
    beginCountDown(){
        this.countDownCallBack = function(){
            if(cc.jsInstance.countDownLeftTime){
                for(var i = 0; i < cc.jsInstance.countDownLeftTime.length;i++){
                    var tempItem = cc.jsInstance.countDownLeftTime[i];
                    if(tempItem.isClicked){
                        tempItem.time--;
                        if(tempItem.time === 0){
                            tempItem.time = 120;
                            tempItem.isClicked = false;
                        }
                    }
                }
            }
		};
		this.schedule(this.countDownCallBack,1);
    },

    initPrefabItemCachePool:function(){
		//计算并且初始化需要的最多的预制体个数
		var self = this;
        this.page_num = Math.floor(this.itemContentHeight/this.itemHeight)+1; 
        
		for(let i = 0; i < this.page_num;i++){

			let prefabItem = cc.instantiate(this.prefabItem);
            prefabItem.parent = this.itemContent;
            prefabItem.active = false;
            //这个地方注意下预制体的结构，自己获取要去监听的部分
			prefabItem.getChildByName("invitebtn").on(cc.Node.EventType.TOUCH_END, function(touchEvent){
				let index = prefabItem.physicalLocation;
				let tempItem = self.countDownLeftTime[index];
				tempItem.isClicked = true;
				self.upDateLableString(prefabItem);				
			}, prefabItem.getChildByName("invitebtn"));
			this.prefabItemCachePool.push(prefabItem);	
        }
    },

    update (dt) {
		this._scrollveiwDidScrolled();
	},
	
    /**
     * 每次重新拉取新的数据都进行的初始化操作
     */
	initData(){
        //this.initStart_Y 这个只初始化了一次所以是固定值 
        //防止误修改
		this.start_y = this.initStart_Y; 

        //content从头开始
		this.itemContent.y = this.initStart_Y;

		//数据的索引初始化
        this.start_index = 0;
        
        //请求新的数据
        this.getData();
    },

    initCountDownLeftTimeArr(){
        this.countDownLeftTime = [];
        for(var i = 0; i < this.prefabData.length;i++){
            var temp ={
                name:i, //用户名称
                time:120,//倒计时时间
                isClicked:false,//是否被点击过
            }
            this.countDownLeftTime.push(temp);	
        }
    },
    
    //请求新的数据 
    getData(){
        //模拟获取到的数据的长度，这里随机
		this.randomLength = Math.floor(Math.random()*20);

		//请求下来的最新的数据数组
		this.prefabData = [];
		
		//先装载数据
        for(var i = 0; i < this.randomLength; i ++) {
			this.prefabData.push(i);
        }

        //获取新数据，更新数据
        this.updatePrefabData();
    },

    //更新数据 这个地方自己去处理数据
    updatePrefabData(){
        
        //每次都替换，然后从大的存好了的数据里进行替换对象
        this.initCountDownLeftTimeArr();      

       //首次进入
       if(!cc.jsInstance.countDownLeftTime){
           cc.jsInstance.countDownLeftTime = this.countDownLeftTime.slice(0);
       }else{

           //所有的名字数组
           var allNames = [];
           allNames = this.setNameArr(allNames);
           //如果总的数据里面有这个数据，那么countDownlefttime中的数据直接从数据里面取就好了
           //如果没有，那么更新总的数据库 ，不用替换
           for(var i = 0; i < this.countDownLeftTime.length;i++){
               var item = this.countDownLeftTime[i];
               var index = allNames.indexOf(item.name);
               if(index >= 0){
                   var oldItem = cc.jsInstance.countDownLeftTime[index];
                   this.countDownLeftTime[i] = oldItem;
               }else{
                   cc.jsInstance.countDownLeftTime.push(item);
               }
           }
       }
       this.reLoadData(0);
    },

    setNameArr(nameArr){
        for(var i = 0; i < cc.jsInstance.countDownLeftTime.length;i++){
            var item = cc.jsInstance.countDownLeftTime[i];
            nameArr.push(item.name);
        }
        return nameArr
    },


    _setNewNameArr(tempArr,newNameArr){
        for(var i = 0; i < tempArr.length;i++){
            var nameTemp = tempArr[i];
            newNameArr.push(nameTemp.name);
        }
        return newNameArr;
    },
    
});
