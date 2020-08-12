Repo containing scripts made for exploiting CS:GO's console command *net_dumpeventstats*

This script is heavily based on [@kkthxbye-code's code](https://github.com/kkthxbye-code/csgo_bugs)

## bomb_hitcount

Ever wanted to know how many players your HE hit? 

This is possible using Source engine's console call net_dumpeventstats. By calling it enough times per second, you can get info about how many players were hit on each tick.

Also included in this script is a C4 explosion time, i.e, how much time is left until the C4 explodes.

![](hit_count.png)

### Requirements

* [Node.js 14+](https://nodejs.org/en/download/current/)

### Usage

Start CS:GO with `-netconport 2121` and then run `node bomb_hitcount.js 2121`. Works offline and online.

### Status

WORKING
