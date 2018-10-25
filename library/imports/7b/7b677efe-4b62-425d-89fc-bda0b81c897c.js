"use strict";
cc._RF.push(module, '7b6777+S2JCXYn8vaC4HIl8', 'prefab');
// Script/prefab.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {

        itemScrollView: {
            type: cc.Node,
            default: null
        },

        //预制体
        prefabItem: {
            type: cc.Prefab,
            default: null
        },

        //装预制体content
        itemContent: {
            type: cc.Node,
            default: null
        }
    },

    start: function start() {
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
    initDataOnlyOnce: function initDataOnlyOnce() {
        this.countDownLeftTime = []; //记录每个item剩余时间的大数组 
        this.initStart_Y = this.itemContent.y; //列表content的初始y的位置 
        this.prefabItemCachePool = []; //所有预制体的存放池
        this.itemContentHeight = this.itemContent._contentSize.height; //content高度
        this.itemHeight = this.prefabItem.data._contentSize.height; //预制体的高度
    },


    //tableview 刷新数据
    reLoadData: function reLoadData(start_index) {
        this.start_index = start_index;
        for (var i = 0; i < this.prefabItemCachePool.length; i++) {
            var friendItemPrefab = this.prefabItemCachePool[i];
            //注意替换节点
            var label = friendItemPrefab.getChildByName("name").getComponent(cc.Label);
            var inviteLab = friendItemPrefab.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label);

            friendItemPrefab.physicalLocation = start_index + i;

            if (start_index + i >= this.countDownLeftTime.length) {
                friendItemPrefab.active = false;
                continue;
            }

            friendItemPrefab.active = true;
            var itemTemp = this.countDownLeftTime[start_index + i];

            //赋值
            if (itemTemp.isClicked) {
                inviteLab.string = itemTemp.time;
            } else {
                inviteLab.string = "邀请";
            }

            //this.prefabData 对象取到name
            label.string = this.prefabData[start_index + i];
        }
    },


    //更新UI
    upDateLableString: function upDateLableString(item) {
        var self = this;
        //定时器2，做赋值操作
        this.schedule(function () {
            var index = item.physicalLocation;
            var tempItem = self.countDownLeftTime[index];
            if (tempItem.isClicked) {
                //注意替换节点
                item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = tempItem.time;
            } else {
                item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = "邀请";
                tempItem.isClicked = false;
                tempItem.time = 120;
            }
        }, 1);
    },
    scrollEnded: function scrollEnded() {
        this.scrollveiwDidScrolled();
        this.node.getChildByName("testScroll").elastic = true;
    },
    scrollveiwDidScrolled: function scrollveiwDidScrolled() {
        //因为只拿了一个item复用，所以滑动的范围只要大于1就要重新加载
        //向下滑
        var isScrollDown = this.start_index + this.page_num < this.prefabData.length && this.itemContent.y - this.start_y >= this.itemHeight;
        if (isScrollDown) {
            this.scrollDown();
            return;
        }

        //向上滑
        var isScrollUp = this.start_index > 0 && this.start_y - this.itemContent.y >= 0;
        if (isScrollUp) {
            this.scrollUp();
        }
    },
    scrollDown: function scrollDown() {
        //如果滑动的范围大于了1个item的高度，就要去加载新的数据
        //每次加载一个数据

        if (this.itemScrollView._autoScrolling) {
            this.itemScrollView.elastic = false;
            return;
        }

        var down_loaded = 1;
        this.start_index += down_loaded;

        //如果往后再加载一个数据就超过了总的数据长度
        console.log("start_index==", this.start_index);
        console.log("this.prefabData.length==", this.prefabData.length);
        if (this.start_index + this.page_num > this.prefabData.length) {
            //down_loaded要剪掉超过的项
            var out_len = this.start_index + this.page_num - this.prefabData.length; //超过的长度
            down_loaded -= out_len;
            this.start_index -= out_len;
            console.log("out out out out !!");
        }
        this.reLoadData(this.start_index);
        this.itemContent.y -= down_loaded * this.itemHeight;
    },
    scrollUp: function scrollUp() {
        if (this.itemScrollView._autoScrolling) {
            this.itemScrollView.elastic = false;
            return;
        }
        var up_loaded = 1;
        this.start_index -= up_loaded;
        if (this.start.index < 0) {
            up_loaded += this.start_index;
            this.start_index = 0;
        }
        this.reLoadData(this.start_index);
        this.itemContent.y += up_loaded * this.itemHeight;
    },
    showClick: function showClick() {
        this.itemScrollView.active = true;
        //重新获取数据
        this.initData();
        this.reLoadData(0);
    },
    hiddeClick: function hiddeClick() {
        this.itemScrollView.active = false;
    },


    //定时器
    beginCountDown: function beginCountDown() {
        this.countDownCallBack = function () {
            for (var i = 0; i < this.countDownLeftTime.length; i++) {
                var tempItem = this.countDownLeftTime[i];
                if (tempItem.isClicked) {
                    tempItem.time--;
                    if (tempItem.time === 0) {
                        tempItem.time = 120;
                        tempItem.isClicked = false;
                    }
                }
            }
        };
        this.schedule(this.countDownCallBack, 1);
    },


    initPrefabItemCachePool: function initPrefabItemCachePool() {
        var _this = this;

        //计算并且初始化需要的最多的预制体个数
        var self = this;
        this.page_num = Math.floor(this.itemContentHeight / this.itemHeight) + 1;

        var _loop = function _loop(i) {

            var prefabItem = cc.instantiate(_this.prefabItem);
            prefabItem.parent = _this.itemContent;

            //这个地方注意下预制体的结构，自己获取要去监听的部分
            prefabItem.getChildByName("invitebtn").on(cc.Node.EventType.TOUCH_END, function (touchEvent) {
                var index = prefabItem.physicalLocation;
                var tempItem = self.countDownLeftTime[index];
                tempItem.isClicked = true;
                self.upDateLableString(prefabItem);
            }, prefabItem.getChildByName("invitebtn"));
            _this.prefabItemCachePool.push(prefabItem);
        };

        for (var i = 0; i < this.page_num; i++) {
            _loop(i);
        }
    },

    update: function update(dt) {
        this.scrollveiwDidScrolled();
    },


    /**
     * 每次重新拉取新的数据都进行的初始化操作
     */
    initData: function initData() {
        //this.initStart_Y 这个只初始化了一次所以是固定值 
        //防止误修改
        this.start_y = this.initStart_Y;

        //content从头开始
        this.itemContent.y = this.initStart_Y;

        //数据的索引初始化
        this.start_index = 0;

        //请求新的数据
        this.getData();

        //清空下线数据，增加新上线数据
        this.updatePrefabData();
    },
    initCountDownLeftTimeArr: function initCountDownLeftTimeArr() {
        this.countDownLeftTime = [];
        for (var i = 0; i < this.prefabData.length; i++) {
            var temp = {
                name: i, //用户名称
                time: 120, //倒计时时间
                isClicked: false //是否被点击过
            };
            this.countDownLeftTime.push(temp);
        }
    },


    //请求新的数据 
    getData: function getData() {
        //模拟获取到的数据的长度，这里随机
        this.randomLength = Math.floor(Math.random() * 20);

        //请求下来的最新的数据数组
        this.prefabData = [];

        //先装载数据
        for (var i = 0; i < this.randomLength; i++) {
            this.prefabData.push(i);
        }
    },


    //更新数据
    updatePrefabData: function updatePrefabData() {
        //保留旧的计时
        if (!this.countDownLeftTime.length) {
            this.initCountDownLeftTimeArr();
            return;
        }

        //最新的数据中筛选上次还在线的玩家，存到tempArr这个里
        var tempArr = [];

        //存储上一次的数据的名字集合
        var nameArr = [];

        //最新数据的名字集合
        var newNameArr = [];

        nameArr = this.setNameArr(nameArr);

        tempArr = this.setTempArr(nameArr, tempArr);

        //存的是tempArr里面对象的名字
        newNameArr = this.setNewNameArr(tempArr, newNameArr);

        //最新的数据里上次还在的玩家
        this.countDownLeftTime = tempArr.slice(0);

        //prefabData 包含 this.countDownLeftTime数据
        this.addNewDataToCountDownLeftTime(newNameArr);
    },
    addNewDataToCountDownLeftTime: function addNewDataToCountDownLeftTime(newNameArr) {
        for (var i = 0; i < this.prefabData.length; i++) {
            var newTempData = this.prefabData[i];
            //旧数据
            if (newNameArr.indexOf(newTempData.name) >= 0) {
                continue;
            }

            //新数据
            var temp = {
                name: i,
                time: 120,
                isClicked: false
            };
            this.countDownLeftTime.push(temp);
        }
    },
    setNameArr: function setNameArr(nameArr) {
        for (var i = 0; i < this.countDownLeftTime.length; i++) {
            var item = this.countDownLeftTime[i];
            nameArr.push(item.name);
        }
        return nameArr;
    },
    setTempArr: function setTempArr(nameArr, tempArr) {
        for (var i = 0; i < this.prefabData.length; i++) {
            var nameTemp = this.prefabData[i];
            var index = nameArr.indexOf(nameTemp);
            if (index >= 0) {
                var item = this.countDownLeftTime[index];
                tempArr.push(item);
            }
        }
        return tempArr;
    },
    setNewNameArr: function setNewNameArr(tempArr, newNameArr) {
        for (var i = 0; i < tempArr.length; i++) {
            var nameTemp = tempArr[i];
            newNameArr.push(nameTemp.name);
        }
        return newNameArr;
    }
});

cc._RF.pop();