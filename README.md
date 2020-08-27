Repo containing scripts made for exploring CS:GO's console command *net_dumpeventstats*

This script is heavily based on [@kkthxbye-code's code](https://github.com/kkthxbye-code/csgo_bugs)

## bomb_hitcount

Ever wanted to know how many players your HE hit? 

This is possible using Source engine's console call net_dumpeventstats. By calling it enough times per second, you can get info about how many players were hit on each tick.

Also included in this script is a C4 explosion time, i.e, how much time is left until the C4 explodes.

![](https://github.com/tiagomagnusss/csgo/blob/master/hit_count.jpg)

### Requirements

* [Node.js 14+](https://nodejs.org/en/download/current/)

### Usage

Start CS:GO with `-netconport 2121` and then run `node bomb_hitcount.js 2121`. Works offline and online.

### Status

NOT WORKING

[This was finally fixed by Valve.](https://blog.counter-strike.net/index.php/2020/08/31476/)
