///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-20 17:49
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/html',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        "dojo/Deferred",
        "dojo/promise/all",
        "base/utils/commonUtils"
    ],
    function (declare, lang,html, _WidgetBase, _TemplatedMixin, Deferred, all, utils) {
        /**
         * 用来显示CheckBox
         *
         * @alias CheckBox
         * @constructor
         * @param {Object} [kwArgs] Object with the following properties:
         * @demo {@link ./base/rdijit/test/testCheckBox.html}
         */
        return declare([_WidgetBase, _TemplatedMixin], {
            baseClass: 'region_picker',
            declaredClass: 'region_picker',
            templateString: "<div style='width:100%;' ms-controller=''>"
            + "<div class='btn-group' style='width:100%' >"
            + "<button ms-repeat-el='region_btns' ms-click='toggleRegion($index)' "
            + "type='button' class='btn btn-default' ms-class='disabled:el.status ==\"ban\"' "
            + "ms-attr-disabled='el.status == \"ban\"'>"
            + "&nbsp;&nbsp;{{el.adNm ? el.adNm : el.defaultLabel}}&nbsp;&nbsp;"
            + "<span ms-attr-class='icon_filter(el.status)'></span>"
            + "</button>"
            + "</div>"
            + "<div class='region_picker_regions' data-dojo-attach-point='div_region_picker'>"
            + "<div><a ms-repeat-el='regions' ms-text='el.adNm' ms-click='pick($index)'></a></div>"
            + "</div>"
            + "</div>",
            postCreate: function () {
                this.inherited(arguments);
                this.initLayout();
            },
            constructor: function (args) {
                this.domNode = $(this.templateString)[0];
                this.onpick = null;
                this.region_btns = null;
                this.range = [true, true, true];
                this.labels = ["省", "市", "区县", "乡镇", "村/街道"];
                if (args) {
                    if (args.range) {
                        this.range = args.range;
                    }
                    if (args.path) {
                        this.path = args.path;
                    }
                    if (args.adcd) {
                        this.oldAdcd = args.adcd+"";
                    }
                }
                if (args.parameters) {
                    if (args.parameters.range) {
                        this.range = args.parameters.range;
                    }
                    if (args.parameters.path) {
                        this.path = args.parameters.path;
                    }
                    if (args.parameters.adcd) {
                        this.oldAdcd = args.parameters.adcd+"";
                    }
                }
            },
            destroy: function () {
                this.inherited(arguments);
                utils.avalon.clear(this);
            },
            vmName: "rich_base_region_",
            //range: "1-3",// 省1，市2，区县3，乡镇4，村/街道办5
            initLayout: function () {
                // 设置样式
//    	var range = this.range.split("-");
//    	range[0] = parseInt(range[0]);
//    	if(range[0] < 1 || range[0] > 5)throw new Error("range 不能超出1-5的范围");
//    	range[1] = range[1] ? parseInt(range[1]) : range[0] + 2;
//    	range[1] = range[1] > 5 ? 5 : range[1];
//    	this.range = range;

                if (this.oldAdcd) {
                    html.setStyle(this.domNode,"visible","hidden");
                    this.createPathByCD(this.oldAdcd).then(lang.hitch(this, function (path) {
                        this.path = path;

                        this._initAvalon();
                        html.setStyle(this.domNode,"visible","");
                    }));
                } else {
                    this._initAvalon();
                }
            },
            _initAvalon: function () {
                this.region_btns = this._createBtns(this.range, this.path);
                if (this.width) {
                    $(this.domNode).width(this.width);
                }
                utils.avalon.unique(this);
                var page_vm = {
                    $id: this.vmName,
                    regions: [],
                    region_btns: this.region_btns ? this.region_btns.concat() : [],
                    $activeBtnIndex: -1,
                    icon_filter: function (str) {
                        switch (str) {
                            case "unfold":
                                return "fa fa-caret-down";
                            case "searching":
                                return "fa fa-spinner fa-spin";
                            case "fold":
                                return "fa fa-caret-up";
                            case "ban":
                                return "fa fa-ban";
                        }
                        return "";
                    },
                    toggleRegion: lang.hitch(this, function (index) {
                        console.log("====================  toggleRegion[" + index + "]  ==================");
                        if (this.page_vm.$activeBtnIndex != -1 && index != this.page_vm.$activeBtnIndex) {
                            this.page_vm.region_btns[this.page_vm.$activeBtnIndex].status = "unfold";
                            $(this.div_region_picker).animate({height: 0}, lang.hitch(this, function () {
                                this._toggleFn(index);
                            }));
                        } else {
                            this._toggleFn(index);
                        }
                    }),
                    pick: lang.hitch(this, function (index) {
                        var activeBtnIndex = this.page_vm.$activeBtnIndex;
                        var btn = this.page_vm.region_btns[activeBtnIndex];
                        btn.status = "unfold";
                        $(this.div_region_picker).animate({height: 0});
                        this.page_vm.$activeBtnIndex = -1;
                        var pickedRegion = this.page_vm.regions[index];
                        if (btn.adCd != pickedRegion.adCd) {
                            btn.adNm = pickedRegion.adNm;
                            btn.adCd = pickedRegion.adCd;
                            var next;
                            while (next = this.page_vm.region_btns[++activeBtnIndex]) {
                                next.status = "" == btn.adCd ? "ban" : "unfold";
                                next.adNm = "";
                                next.adCd = "";
                                btn = next;
                            }
                            if (typeof this.onpick === "function") {
                                this.onpick({
                                    adNm: pickedRegion.adNm,
                                    adCd: pickedRegion.adCd
                                });
                            }
                        }
                    })
                };
                this.page_vm = avalon.define(page_vm);

                avalon.scan(this.domNode);
            },
            _regionCache: {},
            _createBtns: function (range, path) {
                var btns = [];
                path = path ? this._resolvePath(path) : [];
                for (var i = 0; i < range.length; i++) {
                    if (range[i] != null) {
                        var btn = {
                            adNm: path[i] ? path[i].adNm : "",
                            status: range[i] && i <= path.length ? "unfold" : "ban",
                            adCd: path[i] ? path[i].adCd : "",
                            defaultLabel: this.labels[i]
                        };
                        btns.push(btn);
                    }
                }
                return btns;
            },
            _resolvePath: function (path) {
                if (!utils.isArray(path)) {
                    path = [path];
                }
                var ret = [];
                for (var i = 0, l = path.length; i < l; i++) {
                    var adCd = path[i].adCd;
                    var shortAdCd = adCd.substring(0, adCd.match(/[0]+$/).index);
                    var cdLen = shortAdCd.length;
                    var lvl = cdLen > 6 ? 3 + ((cdLen - 6) / 3) : cdLen / 2;
                    lvl = Math.ceil(lvl);
                    ret[lvl - 1] = {
                        adNm: path[i].adNm,
                        adCd: adCd,
                        enable: utils.type(path[i].enable) === "boolean" && !path[i].enable ? false : true
                    }
                }
                return ret;
            },
            getPath: function () {
                var path = [];
                this.page_vm.region_btns.$model.forEach(function (v, i, arr) {
                    if (v.adCd) {
                        path.push({
                            adNm: v.adNm,
                            adCd: v.adCd
                        });
                    }
                });
                return path;
            },
            setPath: function (path) {
                //path = this._resolvePath(path ? path : this.path, true);
                var btns = this._createBtns(this.range, path);
                this.page_vm.region_btns.clear();
                this.page_vm.region_btns.pushArray(btns);
            },
            _toggleFn: function (index) {
                console.log(index);
                var btn = this.page_vm.region_btns[index];
                console.log(btn.$model);
                this.page_vm.$activeBtnIndex = index;
                var status = btn.status;
                if (status == "fold") {
                    $(this.div_region_picker).animate({height: 0});
                    btn.status = "unfold";
                    this.page_vm.$activeBtnIndex = -1;
                    return;
                } else if (status == "unfold") {
                    this._showRegion(index, btn);
                }
            },
            _showRegion: function (index, btn) {
                var cache;
                var adCd = index == 0 ? "-1" : this.page_vm.region_btns[index - 1].adCd;
                console.log(adCd);
                if (adCd && (cache = this._regionCache[adCd])) {
                    btn.status = "fold";
                    var d = $(this.div_region_picker);
                    this.page_vm.regions = cache.concat();
                    d.animate({height: d.children().height()});
                    return;
                }
                btn.status = "searching";
                utils.get(window.APP_ROOT + "base/api/region-service/subregion/" + (adCd != "-1" ? adCd : "000000000000000"))
                    .then(lang.hitch(this, function (res) {
                        console.log(res);
                        for (var i = 0, l = res.data.length; i < l; i++) {
                            res.data[i].adNm = this.shortAdnm(res.data[i].adNm);
                        }
                        console.log(res.data);
                        this.page_vm.regions = res.data.concat();
                        this._regionCache[adCd] = res.data;
                    })).then(lang.hitch(this, function () {
                        btn.status = "fold";
                        var d = $(this.div_region_picker);
                        d.animate({height: d.children().height()});
                    }));
            },
            ignoreWords: ["省", "市", "自治区", "自治", "彝族", "藏族", "维吾尔", "回族", "特别行政区", "壮族", "省"],
            shortAdnm: function (adNm) {
                for (var i = 0, l = this.ignoreWords.length; i < l; i++) {
                    adNm = adNm.replace(this.ignoreWords[i], "");
                }
                adNm = adNm.replace("水利委员会", "委");
                adNm = adNm.replace("流域管理局", "局");
                return adNm;
            },
            createPathByCD: function (adcd) {
                var shortAdCd = adcd.substring(0, adcd.match(/[0]+$/).index);
                var cdLen = shortAdCd.length;
                var defer = new Deferred();
                if (cdLen == 2) {
                    all([this.getInfoById(adcd)]).then(lang.hitch(this,function(list){
                        var path = [];
                        for (var i = 0, max = list.length; i < max; i++) {
                             var item = list[i];
                            path.push({"adCd": item.data[0].adCd, "adNm": item.data[0].adNm});

                        }
                        defer.resolve(path);
                    }))

                } else if (cdLen == 4) {
                    all([this.getInfoById(adcd.substring(0,2)+"0000000000000"),this.getInfoById(adcd)]).then(lang.hitch(this,function(list){
                        var path = [];
                        for (var i = 0, max = list.length; i < max; i++) {
                            var item = list[i];
                            path.push({"adCd": item.data[0].adCd, "adNm": item.data[0].adNm});
                        }
                        defer.resolve(path);
                    }))

                } else if (cdLen == 6) {
                    all([this.getInfoById(adcd.substring(0,2)+"0000000000000"),this.getInfoById(adcd.substring(2,4)+"0000000000000"),this.getInfoById(adcd)]).then(lang.hitch(this,function(list){
                        var path = [];
                        for (var i = 0, max = list.length; i < max; i++) {
                            var item = list[i];
                            path.push({"adCd": item.data[0].adCd, "adNm": item.data[0].adNm});
                        }
                        defer.resolve(path);
                    }))
                } else if (cdLen == 8) {
                    all([this.getInfoById(adcd.substring(0,2)+"0000000000000"),this.getInfoById(adcd.substring(2,4)+"0000000000000"),this.getInfoById(adcd.substring(4,6)+"0000000000000"),this.getInfoById(adcd)]).then(lang.hitch(this,function(list){
                        var path = [];
                        for (var i = 0, max = list.length; i < max; i++) {
                            var item = list[i];
                            path.push({"adCd": item.data[0].adCd, "adNm": item.data[0].adNm});
                        }
                        defer.resolve(path);
                    }))
                } else {
                    all([this.getInfoById(adcd.substring(0,2)+"0000000000000"),this.getInfoById(adcd.substring(2,4)+"0000000000000"),this.getInfoById(adcd.substring(4,6)+"0000000000000"),this.getInfoById(adcd.substring(6,8)+"0000000000000"),this.getInfoById(adcd)]).then(lang.hitch(this,function(list){
                        var path = [];
                        for (var i = 0, max = list.length; i < max; i++) {
                            var item = list[i];
                            path.push({"adCd": item.data[0].adCd, "adNm": item.data[0].adNm});
                        }
                        defer.resolve(path);
                    }))
                }

                return defer;
            },
            getInfoById:function(adcd){
               return utils.get(window.APP_ROOT + "base/api/region-service/region/" + adcd)
                    .then(lang.hitch(this, function (json) {
                        return json;
                    }));
            }
        });
    });