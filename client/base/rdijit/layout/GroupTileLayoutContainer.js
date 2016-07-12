///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-06-10 14:00
///////////////////////////////////////////////////////////////////////////

define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        'dojo/on',
        'dojo/dom-construct',
        'dojo/mouse',
        'dojo/query',
        'dijit/_WidgetBase'
    ],
    function(declare, lang, html, on, domConstruct, mouse, query, _WidgetBase) {

        return declare([_WidgetBase], {
            baseClass: 'rdijit-tile-container',
            declaredClass: 'rdijit.layout.GroupTileLayoutContainer',

            /**
             * Layout the items depends the strategy: fixWidth, breakWidth, fixCols
             * fixWidth:
             *    the item width/height is px, if the container is not width enough, the item will
             *    flow to the next line.
             * breakWidth:
             *    the item width/height is an array, like this:
             *       [{screenWidth: 600, width: 100, height: 200}],
             *    the order is by screen width
             * fixCols:
             *    set the max cols, and the container will resize the item's width to fit the container.
             *
             * options:
             *   stragety: fixWidth, breakWidth, fixCols
             *   itemSize: [] or {}
             *       each object is:
             *           screenWidth: 600
             *           width: 100
             *           height: 200 or 10%
             *   maxCols:
             *   items: [ResizableNode]
             **/
            adcdList: {
                "340000000000000": "安徽省",
                "340100000000000": "合肥市",
                "220000000000000": "吉林省",
                "000000": "其他",
                "Flash floods": "山洪类",
                "water resources": "水资源类",
                "Drainage pipe network class": "排水管网类",
                "ocean": "海洋类"

            },
            constructor: function() {
                this.items = [];
                this.margin = 10;
            },

            startup: function() {
                this.inherited(arguments);
                this.items.forEach(lang.hitch(this, function(item) {
                    this._placeItem(item);
                }));
                this.resize();
            },

            _placeItem: function(item) {
                if (item.domNode) {
                    html.place(item.domNode, this.domNode);
                } else {
                    html.place(item, this.domNode);
                }
            },

            addItem: function(item) {
                this.items.push(item);
                this._placeItem(item);
                this.resize();
            },

            addItems: function(items) {
                this.items = this.items.concat(items);
                this.createGroupList();
                this.items.forEach(lang.hitch(this, function(item) {
                    this._placeItem(item.node);
                }));

                //this.resizeGroup();
            },
            groupList: null,
            labelList: null,
            createGroupList: function() {
                this.groupList = [];
                this.labelList = [];
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    //遍历看分组里面有了吗，有的话，加进去，没有分组新加个分组
                    var isHas = false;
                    for (var j = 0; j < this.groupList.length; j++) {
                        var group = this.groupList[j];
                        if (group.groupName == item.groupName) {
                            group.groupList.push(item);
                            isHas = true;
                        }
                    }
                    if (!isHas) {
                        this.groupList.push({
                            groupName: item.groupName,
                            groupList: [item]
                        });
                    }
                }
            },
            resizeGroup: function() {
                var box, itemSize, cpr;
                box = html.getMarginBox(this.domNode);

                itemSize = this.getItemSize(box);
                cpr = Math.floor((box.w + this.margin) / (itemSize.width + this.margin));
                if (cpr == 0) {
                    cpr = 1;
                };
                this.groupList.forEach(lang.hitch(this, function(group, i) {
                    this.createGroupDiv(group, i, itemSize, cpr);
                }));
            },

            currentTop: 5,
            createGroupDiv: function(group, j, itemSize, cpr) {
                //观察是第几组
                //创建分组title
                //计算下统计信息
                var tt;
                var state_run_Num = 0;
                var state_stop_Num = 0;

                group.groupList.forEach(lang.hitch(this, function(item, i) {

                    if (item.data.stat == "1") {
                        state_run_Num++;
                    } else if (item.data.stat == "0") {
                        state_stop_Num++;
                    } else if (item.data.stat == "-1") {

                    }


                    var col = i % cpr;
                    var row = Math.floor(i / cpr);

                    // if(col === 0){
                    //   col = 4;
                    // }

//                    console.log(this.currentTop);
                    var itemStyle = {
                        position: 'absolute',
                        left: (((this.margin + itemSize.width) * (col)) + 5) + 'px',
                        top: this.currentTop + (((this.margin + itemSize.height) * (row)) + 25) + 'px'
                    };
                    if (itemSize.width >= 0) {
                        itemStyle.width = itemSize.width + 'px';
                    }
                    if (itemSize.height >= 0) {
                        itemStyle.height = itemSize.height + 'px';
                    }
                    html.setStyle(item.node.domNode ? item.node.domNode : item.node, itemStyle);

                    tt = this.currentTop + (((this.margin + itemSize.height) * (row)) + 25);
                }));
                this.ddd++;
                if (this.ddd == 3) {
                    var label = html.create('div', {
                        'innerHTML': '<a name="xxxx">' + group.groupName ? this.adcdList[group.groupName] : "---" + '，正常运行' + state_run_Num + '个，已暂停' + state_stop_Num + '个</a>',
                        style: 'color:#787878;font-size:14px;position: absolute;left:20px;top:' + this.currentTop + 'px'
                    }, this.domNode);
                    this.labelList.push(label);
                    this.currentTop = tt + this.itemSize.height + this.margin + 20;
                } else {
                    var label = html.create('div', {
                        'innerHTML': '' + group.groupName ? (this.adcdList[group.groupName]?this.adcdList[group.groupName]:'其他') : "---" + '，正常运行' + state_run_Num + '个，已暂停' + state_stop_Num + '个',
                        style: 'color:#787878;font-size:14px;position: absolute;left:20px;top:' + this.currentTop + 'px'
                    }, this.domNode);
                    this.labelList.push(label);
                    this.currentTop = tt + this.itemSize.height + this.margin + 20;
                }


            },

            ddd: 0,

            removeItem: function(itemLabel) {
                var i;
                for (i = 0; i < this.items.length; i++) {
                    if (this.items[i].label === itemLabel) {
                        if (this.items[i].domNode) {
                            this.items[i].destroy();
                        } else {
                            html.destroy(this.items[i]);
                        }
                        this.items.splice(i, 1);
                        this.resize();
                        return;
                    }
                }
            },

            empty: function() {
                var i;
                for (i = 0; i < this.items.length; i++) {
                    if (this.items[i].node.domNode) {
                        this.items[i].node.destroy();
                    } else {
                        html.destroy(this.items[i].node);
                    }
                }
                this.items = [];
                this.groupList = [];
                this.currentTop = 5;

                if (this.labelList) {
                    for (i = 0; i < this.labelList.length; i++) {
                        html.destroy(this.labelList[i]);
                    }

                    this.labelList = [];
                }

            },

            resize: function() {
                var box, itemSize, cpr;
                box = html.getMarginBox(this.domNode);

                itemSize = this.getItemSize(box);
                cpr = 4; // Math.floor((box.w+this.margin  ) / (itemSize.width+this.margin ));

                this.items.forEach(lang.hitch(this, function(item, i) {
                    this.setItemPosition(item, i, itemSize, cpr);
                }));
            },

            getItemSize: function(box) {
                var size = {},
                    i;
                if (this.strategy === 'fixWidth') {
                    size.width = this.itemSize.width;
                    size.height = this.itemSize.height;
                } else if (this.strategy === 'breakWidth') {
                    for (i = 0; i < this.itemSize.length; i++) {
                        if (box.w <= this.itemSize[i].screenWidth) {
                            size.width = this.itemSize[i].width;
                            size.height = this.itemSize[i].height;
                            break;
                        }
                    }
                } else if (this.strategy === 'fixCols') {
                    size.width = (box.w - this.margin * (this.maxCols - 1)) / this.maxCols;
                    if (typeof this.itemSize.height === 'number') {
                        size.height = this.itemSize.height;
                    } else {
                        size.height = (size.width) *
                            parseFloat(this.itemSize.height.substring(0, this.itemSize.height.length - 1)) / 100;
                    }
                }
                return size;
            },

            setItemPosition: function(item, i, itemSize, cpr) {
                i++;
                var col = i % cpr;
                var row = Math.ceil(i / cpr);

                if (col === 0) {
                    col = 4;
                }
                var itemStyle = {
                    position: 'absolute',
                    left: (((this.margin + itemSize.width) * (col - 1)) + 5) + 'px',
                    top: (((this.margin + itemSize.height) * (row - 1)) + 5) + 'px'
                };
                if (itemSize.width >= 0) {
                    itemStyle.width = itemSize.width + 'px';
                }
                if (itemSize.height >= 0) {
                    itemStyle.height = itemSize.height + 'px';
                }
                html.setStyle(item.domNode ? item.domNode : item, itemStyle);
            }

        });
    });
