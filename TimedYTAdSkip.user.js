// ==UserScript==
// @name         Timed Ad skip on Youtube
// @namespace    org.whatgoeshere.questionmark
// @version      3.14
// @description  Skip youtube ads after 30s
// @author       lex-lex
// @match        https://www.youtube.com/watch?*
// @match        http://www.youtube.com/watch?*
// @grant        none
// ==/UserScript==

// Configuration parameters BEGIN
timedYTSkipAdVolume = 10; // This volume (in percent) is used during ads.
timedYTSkipTime = 30; // After this time (in seconds), skip the ad.
// Configuration parameters END

timedYTSkipEnqueued = false;
timedYTSkipLastVolume = 100;

timedYTSkipApiChangeListener = function(){
    console.log(new Date().toString() + "apiChangeListener called");
    setTimeout(function(){
        var yt = document.querySelector('#movie_player');
        console.log(new Date().toString() + " ad state: "+ yt.getAdState());
        if (yt.getAdState() < 1 && timedYTSkipEnqueued) {
            console.log(new Date().toString() + "no ad detected but skip enqueued!");
            yt.setVolume(timedYTSkipLastVolume);
            timedYTSkipEnqueued = false;
        }
        if (yt.getAdState() == 1) {
            console.log(new Date().toString() + "ad detected!");
            if (timedYTSkipEnqueued) console.log(new Date().toString() + "skipping already enqueued. all good.");
            else initiateSkip(timedYTSkipTime * 1000);
        }
    }, 500);
};


enqueueTimedYTSkip = function(timeout, depth) {
    if (depth > 2) {
        timedYTSkipEnqueued = false;
        return;
    }
    console.log(new Date().toString() + "started countdown with timeout " + timeout);
    setTimeout(function(){
        console.log(new Date().toString() + "skip ad function called");
        var yt = document.querySelector('#movie_player');
        if (yt.getAdState() < 1) {
            console.log(new Date().toString() + "no ad running. skip");
            timedYTSkipEnqueued = false;
            return;
        }
        yt.wakeUpControls();
        var curTime = document.querySelector('.ytp-time-current').textContent.split(":");
        var seconds = parseInt(curTime[curTime.length - 1]);
        if (seconds >= 30) {
            console.log(new Date().toString() + "enough time spent ("+ seconds +"), skip ad");
            var _skip = document.querySelector('.videoAdUiSkipButton');
            if(_skip !== null) _skip.click();
            yt.setVolume(timedYTSkipLastVolume);
            timedYTSkipEnqueued = false;
        } else {
            console.log(new Date().toString() + "too few time");
            var todo = 30 - seconds + 1;
            console.log(new Date().toString() + "wait another " + todo);
            enqueueTimedYTSkip(todo*1000, depth+1);
        }
    }, timeout);
    timedYTSkipEnqueued = true;
};

initiateSkip = function(timeout) {
  var yt = document.querySelector('#movie_player');
  timedYTSkipLastVolume = yt.getVolume();
  yt.setVolume(timedYTSkipAdVolume);
  enqueueTimedYTSkip(timeout,0);
};

(function() {
    'use strict';
    document.querySelector('#movie_player').addEventListener("onApiChange", "timedYTSkipApiChangeListener");
    setTimeout(function(){
        var yt = document.querySelector('#movie_player');
        console.log(new Date().toString() + " ad state: "+ yt.getAdState());
        if (yt.getAdState() == 1) {
            console.log(new Date().toString() + "ad detected!");
            if (timedYTSkipEnqueued) console.log(new Date().toString() + "skipping already enqueued. all good.");
            else initiateSkip(timedYTSkipTime * 1000);
        }
    }, 500);
})();

