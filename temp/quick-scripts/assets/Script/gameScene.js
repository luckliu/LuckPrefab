(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/gameScene.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'd89f6DCJxNFlLRQf1kVzjHw', 'gameScene', __filename);
// Script/gameScene.js

"use strict";

cc.Class({
	extends: cc.Component,

	properties: {
		itemTest: {
			type: cc.Prefab,
			default: null
		},

		itemContent: {
			type: cc.Node,
			default: null
		}

	},

	start: function start() {
		//记录定时剩余时间的大数组
		this.countDownLeftTime = [];

		//列表content的初始y的位置 一加载进来先保存下初始位置
		this.initStart_Y = this.itemContent.y;

		//所有预制体的存放池
		this.prefabItemCachePool = [];

		//每个预制体的高度
		this.itemHeight = this.itemTest.data._contentSize.height;

		//初始化数据
		this.initData();
		this.initPrefabItemCachePool();
		this.loadData(this.start_index);
		this.node.getChildByName("testScroll").on("scroll-ended", this.on_scroll_ended.bind(this), this);
		this.beginCountDown();
	},


	//请求数据
	loadData: function loadData(start_index) {
		this.start_index = start_index;
		console.log("loadData,start_index==", start_index);
		console.log("this.countDownLeftTime.length==", this.countDownLeftTime.length);
		for (var i = 0; i < this.prefabItemCachePool.length; i++) {
			var friendItemPrefab = this.prefabItemCachePool[i];
			var label = friendItemPrefab.getChildByName("name").getComponent(cc.Label);
			var inviteLab = friendItemPrefab.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label);
			friendItemPrefab.physicalLocation = start_index + i;
			console.log("loadData,start_index+i==", start_index + i);
			if (start_index + i >= this.countDownLeftTime.length) {
				console.log("i===", i);
				friendItemPrefab.active = false;
				continue;
			}
			friendItemPrefab.active = true;
			var itemTemp = this.countDownLeftTime[start_index + i];
			console.log("target==", friendItemPrefab);
			//赋值
			if (itemTemp.isClicked) {
				inviteLab.string = itemTemp.time;
			} else {
				inviteLab.string = "邀请";
			}
			label.string = this.value_set[start_index + i];
		}
	},
	upDateLableString: function upDateLableString(item) {
		var self = this;
		this.schedule(function () {
			var index = item.physicalLocation;
			console.log("physicalLocation==", index);
			var tempItem = self.countDownLeftTime[index];
			if (tempItem.isClicked) {
				item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = tempItem.time;
			} else {
				item.getChildByName("invitebtn").getChildByName("invite").getComponent(cc.Label).string = "邀请";
				tempItem.isClicked = false;
				tempItem.time = 120;
			}
		}, 1);
	},
	on_scroll_ended: function on_scroll_ended() {
		this.scrollveiw_load_recode();
		this.node.getChildByName("testScroll").elastic = true;
	},
	scrollveiw_load_recode: function scrollveiw_load_recode() {
		//因为只拿了一个item复用，所以滑动的范围只要大于1就要重新加载
		if (this.start_index + this.page_num < this.value_set.length && this.itemContent.y - this.start_y >= this.itemHeight) {
			//如果滑动的范围大于了1个item的高度，就要去加载新的数据
			//每次加载一个数据

			if (this.node.getChildByName("testScroll")._autoScrolling) {
				this.node.getChildByName("testScroll").elastic = false;
				return;
			}

			var down_loaded = 1;
			this.start_index += down_loaded;

			//如果往后再加载一个数据就超过了总的数据长度
			console.log("start_index==", this.start_index);
			console.log("this.value_set.length==", this.value_set.length);
			if (this.start_index + this.page_num > this.value_set.length) {
				//down_loaded要剪掉超过的项
				var out_len = this.start_index + this.page_num - this.value_set.length; //超过的长度
				down_loaded -= out_len;
				this.start_index -= out_len;
				console.log("out out out out !!");
			}
			this.loadData(this.start_index);
			this.itemContent.y -= down_loaded * this.itemHeight;
			// return;
		}

		//向上加载
		if (this.start_index > 0 && this.start_y - this.itemContent.y >= 0) {
			if (this.node.getChildByName("testScroll")._autoScrolling) {
				this.node.getChildByName("testScroll").elastic = false;
				return;
			}
			var up_loaded = 1;
			this.start_index -= up_loaded;
			if (this.start.index < 0) {
				up_loaded += this.start_index;
				this.start_index = 0;
				console.log("我总觉着这个地方不会走！！");
			}

			this.loadData(this.start_index);
			this.itemContent.y += up_loaded * this.itemHeight;
		}
	},
	showClick: function showClick() {
		this.node.getChildByName("testScroll").active = true;
		//重新获取数据
		this.initData();
		this.loadData(0);
	},
	hiddeClick: function hiddeClick() {
		this.node.getChildByName("testScroll").active = false;
	},


	//一个定时器
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


	// onLoad(){

	// },

	initData: function initData() {
		//这里是刷新列表的时候重新赋值的地方
		//content的y的位置
		this.start_y = this.initStart_Y;

		this.itemContent.y = this.initStart_Y;

		//数据的索引
		this.start_index = 0;

		//模拟获取到的数据的长度，这里随机
		this.randomLength = Math.floor(Math.random() * 20);

		//请求下来的数据数组
		this.value_set = [];

		//先装载数据
		for (var i = 0; i < this.randomLength; i++) {
			this.value_set.push(i);
		}

		//判断下this.countDownLeftTime数组有没有东西，没有数据那么要初始化一下
		if (!this.countDownLeftTime.length) {
			this.countDownLeftTime = [];
			for (var i = 0; i < this.randomLength; i++) {
				var temp = {
					name: i,
					time: 120,
					isClicked: false
				};
				this.countDownLeftTime.push(temp);
			}
		} else {
			//比较处理数据差异
			var tempArr = [];

			var nameArr = []; //存储上一次的数据的名字集合
			for (var i = 0; i < this.countDownLeftTime.length; i++) {
				var item = this.countDownLeftTime[i];
				nameArr.push(item.name);
			}

			//最新的数据
			for (var i = 0; i < this.randomLength; i++) {
				var index = nameArr.indexOf(i);
				if (index >= 0) {
					//所以temparr里面存的不是名字，是整个对象
					var item = this.countDownLeftTime[index];
					tempArr.push(item);
				}
				//如果是乱序  那么要用原来的数组 减掉  最新的数据  得到废弃的数据，再去进行删除
			}

			console.log("tempArr==", tempArr);
			//因为当前拿到的数据是顺序的，所以上面那个操作做完之后 tempArr里面就是存的当前最新的数据 要修改下还
			this.countDownLeftTime = tempArr.slice(0);

			for (var i = 0; i < this.randomLength; i++) {
				var lastTempData = this.countDownLeftTime[i];
				console.log("lastTempData ==", lastTempData);
				if (i < this.countDownLeftTime.length && lastTempData.name === i) {
					continue;
				} else {
					console.log("这么写这里应该永远不会走！！！！！");
					var temp = {
						name: i,
						time: 120,
						isClicked: false
					};
					this.countDownLeftTime.push(temp);
				}
			}
		}
	},


	clearOffLinePlayerItem: function clearOffLinePlayerItem(data) {},

	initPrefabItemCachePool: function initPrefabItemCachePool() {
		var _this = this;

		//计算并且初始化需要的最多的预制体个数
		var self = this;
		this.page_num = Math.floor(this.itemContent._contentSize.height / this.itemHeight) + 1;

		var _loop = function _loop(i) {
			var prefabItem = cc.instantiate(_this.itemTest);
			prefabItem.parent = _this.itemContent;
			prefabItem.getChildByName("invitebtn").on(cc.Node.EventType.TOUCH_END, function (touchEvent) {
				var index = prefabItem.physicalLocation;
				var tempItem = self.countDownLeftTime[index];
				tempItem.isClicked = true;
				self.upDateLableString(prefabItem);
				console.log("prefabItem is clicked!");
			}, prefabItem.getChildByName("invitebtn"));
			_this.prefabItemCachePool.push(prefabItem);
		};

		for (var i = 0; i < this.page_num; i++) {
			_loop(i);
		}
		console.log("prefabItemCachePool length==", this.prefabItemCachePool.length);
	},

	update: function update(dt) {
		this.scrollveiw_load_recode();
	}
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=gameScene.js.map
        