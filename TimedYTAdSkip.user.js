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

timedYTSkipApiChangeListener = function(){
    console.log(new Date().toString() + "apiChangeListener called");
    setTimeout(function(){
        console.log(new Date().toString() + " ad state: "+ document.querySelector('#movie_player').getAdState());
        if (document.querySelector('#movie_player').getAdState() == 1) {
            console.log(new Date().toString() + "ad detected!");
            if (timedYTSkipEnqueued) {
                console.log(new Date().toString() + "skipping already enqueued. all good.");
            } else {
                enqueueTimedYTSkip(30000,0);
            }
        }
    }, 1000);
};

timedYTSkipEnqueued = false;
enqueueTimedYTSkip = function(timeout, depth) {
    if (depth > 2) {
        timedYTSkipEnqueued = false;
        return;
    }
    console.log(new Date().toString() + "started countdown with timeout " + timeout);
    setTimeout(function(){
        console.log(new Date().toString() + "skip ad function called");
        if (document.querySelector('#movie_player').getAdState() < 1) {
            console.log(new Date().toString() + "no ad running. skip");
            timedYTSkipEnqueued = false;
            return;
        }
        document.querySelector('#movie_player').wakeUpControls();
        var curTime = document.querySelector('.ytp-time-current').textContent.split(":");
        var seconds = parseInt(curTime[curTime.length - 1]);
        if (seconds >= 30) {
            console.log(new Date().toString() + "enough time spent ("+ seconds +"), skip ad");
            var _skip = document.querySelector('.videoAdUiSkipButton');
            var _close = document.querySelector('.close-button');
            if(_skip !== null) {
                _skip.click();
            }
            if (_close !== null) {
                _close.click();
            }
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

(function() {
    'use strict';
    document.querySelector('#movie_player').addEventListener("onApiChange", "timedYTSkipApiChangeListener");
    enqueueTimedYTSkip(30000, 0);
})();

