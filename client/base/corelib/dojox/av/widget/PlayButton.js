//>>built
define("dojox/av/widget/PlayButton",["dojo","dijit","dijit/_Widget","dijit/_TemplatedMixin"],function(a,d,b,c){return a.declare("dojox.av.widget.PlayButton",[b,c],{templateString:a.cache("dojox.av.widget","resources/PlayButton.html"),postCreate:function(){this.showPlay()},setMedia:function(b){this.media=b;a.connect(this.media,"onEnd",this,"showPlay");a.connect(this.media,"onStart",this,"showPause")},onClick:function(){if("play"==this._mode)this.onPlay();else this.onPause()},onPlay:function(){this.media&&
this.media.play();this.showPause()},onPause:function(){this.media&&this.media.pause();this.showPlay()},showPlay:function(){this._mode="play";a.removeClass(this.domNode,"Pause");a.addClass(this.domNode,"Play")},showPause:function(){this._mode="pause";a.addClass(this.domNode,"Pause");a.removeClass(this.domNode,"Play")}})});