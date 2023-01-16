# ipfs-search-benchmark

This extracts real-life traffic from webserver logs to generate realistic load tests for ipfs-search.com (including pauses), such that every virtual user (VU) emulates an actual visit to our site.
The VU's emulates the exact user behaviour, including batching of requests and pauses between them.

Please see `logto-batches.js` to see how we extract traffic from log files.

## Usage

### Creating `visits.json` dataset from log files

Only required if you don't want to use the supplied `visits.json`.

1. Install node deps: `npm i`
2. Pipe log data to `logtobatches.js`: `cat access.log | node logtobatches.js`
   Or, if (like us) you have a large body of gzipped log data: `gzcat access.log.*.gz | node logtobatches.js`

The extraction is known to work well to about 30k visits (including batched requests). For larger sets, it's recommended to increase Node's heap to 8G, like such: `NODE_OPTIONS=--max-old-space-size=8192 node logtobatches.js`.

### Running load tests

Please make sure you have a wide-enough pipe. Currently, this generates ~5 MB/s (~50 Mbit) of traffic.

1. [Install k6](https://k6.io/docs/get-started/installation/)
2. Extract visits file: `bunzip2 -k visits.json.bz2`
3. Run load tests: `k6 run k6loadtest.js`

#### Offset to ensure cache' coldness

You can use the `SCENARIO_OFFSET` environment variable to prevent using the same traffic in repeated tests.
For example, if a first test ran 1999 iterations, specify an offset like such: `SCENARIO_OFFSET=2000 k6 run k6loadtest.js`

## Summary

13/01/2013 pre scale-out
400 VU: stable
Ramp towards 1000 VU: req duration goes up
Ramp towards 2000 VU: fail rate goes up

## Tests from caminer

3/1/'23

#### 2000 VU

Warm cache. 5m duration. RPS and server limits disabled.

```
running (5m30.0s), 0000/2000 VUs, 5129 complete and 1604 interrupted iterations
default ✓ [======================================] 2000 VUs  5m0s

     ✗ is status 200
      ↳  79% — ✓ 173720 / ✗ 44841

   ✗ checks.........................: 79.48% ✓ 173720     ✗ 44841
     data_received..................: 516 MB 1.6 MB/s
     data_sent......................: 35 MB  107 kB/s
     http_req_blocked...............: avg=47.9ms  min=0s       med=250ns   max=21.83s   p(90)=400ns   p(95)=491ns
     http_req_connecting............: avg=34.1ms  min=0s       med=0s      max=15.54s   p(90)=0s      p(95)=0s
   ✓ http_req_duration..............: avg=1.25s   min=0s       med=1.54ms  max=1m0s     p(90)=7.31ms  p(95)=99.49ms
       { expected_response:true }...: avg=8ms     min=320.42µs med=1.52ms  max=54.87s   p(90)=5.22ms  p(95)=7.86ms
   ✗ http_req_failed................: 20.35% ✓ 45003      ✗ 176055
     http_req_receiving.............: avg=48.46µs min=0s       med=22.25µs max=103.96ms p(90)=54.67µs p(95)=66.8µs
     http_req_sending...............: avg=30.5µs  min=0s       med=26.5µs  max=17.16ms  p(90)=48.81µs p(95)=57.68µs
     http_req_tls_handshaking.......: avg=12.72ms min=0s       med=0s      max=21.67s   p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=1.25s   min=0s       med=1.47ms  max=1m0s     p(90)=7.18ms  p(95)=99.4ms
     http_reqs......................: 221058 669.854297/s
     iteration_duration.............: avg=1m11s   min=27.92ms  med=50.11s  max=5m26s    p(90)=2m55s   p(95)=3m52s
     iterations.....................: 5129   15.541997/s
     vus............................: 1606   min=1606     max=2000
     vus_max........................: 2000   min=2000     max=2000
```

## Preliminary results

### 10m, cold cache, data form 12/12/'22

#### 550 VU

Completely cold cache. New data. 13/12/22

```
running (10m30.0s), 000/550 VUs, 2653 complete and 446 interrupted iterations
default ✗ [==>--------------] 550 VUs  10m30.0s/10m0s  02692/13686 shared iters

     ✗ is status 200
      ↳  94% — ✓ 100245 / ✗ 5339

   ✓ checks.........................: 94.94% ✓ 100245     ✗ 5339
     data_received..................: 318 MB 505 kB/s
     data_sent......................: 20 MB  32 kB/s
     dropped_iterations.............: 10587  16.804514/s
     http_req_blocked...............: avg=24.76ms  min=0s            med=1µs     max=23.02s p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=33.1ms   min=0s            med=0s      max=22.84s p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=846.62ms min=0s            med=60.12ms max=1m0s   p(90)=519.04ms p(95)=1.83s
       { expected_response:true }...: avg=307.25ms min=44.03ms       med=59.89ms max=59.33s p(90)=357.21ms p(95)=1.21s
   ✓ http_req_failed................: 5.06%  ✓ 5379       ✗ 100872
     http_req_receiving.............: avg=2.12ms   min=0s            med=68µs    max=1.44s  p(90)=181µs    p(95)=344µs
     http_req_sending...............: avg=4.39ms   min=-1976804000ns med=86µs    max=7.67s  p(90)=214µs    p(95)=264µs
     http_req_tls_handshaking.......: avg=8.83ms   min=0s            med=0s      max=3.95s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=840.1ms  min=0s            med=59.86ms max=1m0s   p(90)=499.01ms p(95)=1.78s
     http_reqs......................: 106251 168.649898/s
     iteration_duration.............: avg=1m27s    min=186.65ms      med=51.52s  max=10m25s p(90)=3m48s    p(95)=5m9s
     iterations.....................: 2653   4.211049/s
     vus............................: 446    min=446      max=550
     vus_max........................: 550    min=550      max=550
```

#### 600 VU

```
running (10m30.0s), 000/600 VUs, 2612 complete and 518 interrupted iterations
default ✗ [======>-------------------------------] 600 VUs  10m30.0s/10m0s  02725/13686 shared iters

     ✗ is status 200
      ↳  96% — ✓ 111316 / ✗ 3580

   ✓ checks.........................: 96.88% ✓ 111316    ✗ 3580
     data_received..................: 363 MB 577 kB/s
     data_sent......................: 20 MB  32 kB/s
     dropped_iterations.............: 10556  16.755324/s
     http_req_blocked...............: avg=35.69ms  min=0s       med=1µs     max=21.94s p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=33.52ms  min=0s       med=0s      max=21.59s p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=858.95ms min=43.95ms  med=60.58ms max=1m0s   p(90)=762.3ms  p(95)=1.94s
       { expected_response:true }...: avg=301.12ms min=43.95ms  med=60.26ms max=59.94s p(90)=471.16ms p(95)=1.47s
   ✓ http_req_failed................: 3.11%  ✓ 3600      ✗ 112141
     http_req_receiving.............: avg=956.15µs min=0s       med=79µs    max=1.46s  p(90)=167µs    p(95)=228µs
     http_req_sending...............: avg=96.24µs  min=17µs     med=83µs    max=954µs  p(90)=175µs    p(95)=209µs
     http_req_tls_handshaking.......: avg=2ms      min=0s       med=0s      max=1.08s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=857.9ms  min=43.88ms  med=60.36ms max=1m0s   p(90)=759.22ms p(95)=1.94s
     http_reqs......................: 115741 183.71334/s
     iteration_duration.............: avg=1m36s    min=507.45ms med=54.05s  max=10m9s  p(90)=4m27s    p(95)=5m42s
     iterations.....................: 2612   4.145975/s
     vus............................: 518    min=518     max=600
     vus_max........................: 600    min=600     max=600
```

#### 650 VU

```
running (10m30.0s), 000/650 VUs, 3036 complete and 532 interrupted iterations
default ✗ [=========>----------------------------] 650 VUs  10m30.0s/10m0s  03036/11032 shared iters

     ✗ is status 200
      ↳  97% — ✓ 135037 / ✗ 3663

   ✓ checks.........................: 97.35% ✓ 135037     ✗ 3663
     data_received..................: 464 MB 736 kB/s
     data_sent......................: 25 MB  40 kB/s
     dropped_iterations.............: 7464   11.847469/s
     http_req_blocked...............: avg=24.38ms  min=0s       med=1µs     max=13.26s   p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=21.65ms  min=0s       med=0s      max=12.78s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=721.1ms  min=43.9ms   med=50.76ms max=1m0s     p(90)=395.66ms p(95)=1.18s
       { expected_response:true }...: avg=244.29ms min=43.9ms   med=49.42ms max=59.96s   p(90)=283.37ms p(95)=866ms
   ✓ http_req_failed................: 2.64%  ✓ 3695       ✗ 135916
     http_req_receiving.............: avg=2.31ms   min=0s       med=77µs    max=3.04s    p(90)=180µs    p(95)=288µs
     http_req_sending...............: avg=101.42µs min=17µs     med=81µs    max=195.17ms p(90)=174µs    p(95)=210µs
     http_req_tls_handshaking.......: avg=2.5ms    min=0s       med=0s      max=871.72ms p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=718.69ms min=43.83ms  med=50.33ms max=1m0s     p(90)=383.09ms p(95)=1.18s
     http_reqs......................: 139611 221.601952/s
     iteration_duration.............: avg=1m29s    min=304.43ms med=50.75s  max=10m7s    p(90)=3m55s    p(95)=5m22s
     iterations.....................: 3036   4.818987/s
     vus............................: 532    min=532      max=650
     vus_max........................: 650    min=650      max=650
```

#### 700 VU

```
running (10m30.0s), 000/700 VUs, 3235 complete and 573 interrupted iterations
default ✗ [==============>-----------------------] 700 VUs  10m30.0s/10m0s  3235/7995 shared iters

     ✗ is status 200
      ↳  97% — ✓ 141637 / ✗ 4290

   ✓ checks.........................: 97.06% ✓ 141637    ✗ 4290
     data_received..................: 495 MB 785 kB/s
     data_sent......................: 27 MB  43 kB/s
     dropped_iterations.............: 4187   6.645973/s
     http_req_blocked...............: avg=33.23ms  min=0s       med=1µs     max=22.17s   p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=30.01ms  min=0s       med=0s      max=21.56s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=648.8ms  min=43.85ms  med=46.15ms max=1m0s     p(90)=473.94ms p(95)=1.75s
       { expected_response:true }...: avg=257.09ms min=43.85ms  med=46.07ms max=59.97s   p(90)=274.03ms p(95)=1.26s
   ✓ http_req_failed................: 2.94%  ✓ 4325      ✗ 142526
     http_req_receiving.............: avg=1.45ms   min=0s       med=64µs    max=3.12s    p(90)=160µs    p(95)=237µs
     http_req_sending...............: avg=91.68µs  min=16µs     med=70µs    max=191.17ms p(90)=165µs    p(95)=200µs
     http_req_tls_handshaking.......: avg=2.86ms   min=0s       med=0s      max=883.21ms p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=647.25ms min=43.69ms  med=45.98ms max=1m0s     p(90)=469.15ms p(95)=1.74s
     http_reqs......................: 146851 233.09477/s
     iteration_duration.............: avg=1m33s    min=578.89ms med=53.46s  max=10m25s   p(90)=4m7s     p(95)=5m29s
     iterations.....................: 3235   5.134875/s
     vus............................: 573    min=573     max=700
     vus_max........................: 700    min=700     max=700
```

#### 750 VU

```
running (10m30.0s), 000/750 VUs, 3409 complete and 627 interrupted iterations
default ✗ [==========================>-----------] 750 VUs  10m30.0s/10m0s  3411/4759 shared iters

     ✗ is status 200
      ↳  96% — ✓ 145510 / ✗ 4871

   ✓ checks.........................: 96.76% ✓ 145510     ✗ 4871
     data_received..................: 495 MB 786 kB/s
     data_sent......................: 29 MB  46 kB/s
     dropped_iterations.............: 723    1.147605/s
     http_req_blocked...............: avg=20.59ms  min=0s      med=1µs     max=10.16s  p(90)=1µs      p(95)=3µs
     http_req_connecting............: avg=15.26ms  min=0s      med=0s      max=9.69s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=729.96ms min=0s      med=46ms    max=1m0s    p(90)=792.58ms p(95)=2.26s
       { expected_response:true }...: avg=307.12ms min=43.93ms med=45.94ms max=59.71s  p(90)=319.85ms p(95)=1.7s
   ✓ http_req_failed................: 3.24%  ✓ 4914       ✗ 146362
     http_req_receiving.............: avg=759.75µs min=0s      med=62µs    max=2.93s   p(90)=159µs    p(95)=233µs
     http_req_sending...............: avg=95.99µs  min=0s      med=70µs    max=196.1ms p(90)=171µs    p(95)=209µs
     http_req_tls_handshaking.......: avg=5.3ms    min=0s      med=0s      max=2.97s   p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=729.1ms  min=0s      med=45.83ms max=1m0s    p(90)=791.05ms p(95)=2.26s
     http_reqs......................: 151276 240.117615/s
     iteration_duration.............: avg=1m32s    min=73.42ms med=52.51s  max=10m26s  p(90)=4m4s     p(95)=5m34s
     iterations.....................: 3409   5.411043/s
     vus............................: 629    min=629      max=750
     vus_max........................: 750    min=750      max=750
```

#### 800 VU

```
running (10m30.0s), 000/800 VUs, 3763 complete and 659 interrupted iterations
default ✗ [=========>----------------------------] 800 VUs  10m30.0s/10m0s  03763/13686 shared iters

     ✗ is status 200
      ↳  93% — ✓ 142882 / ✗ 9744

   ✓ checks.........................: 93.61% ✓ 142882     ✗ 9744
     data_received..................: 551 MB 875 kB/s
     data_sent......................: 36 MB  57 kB/s
     dropped_iterations.............: 9264   14.704624/s
     http_req_blocked...............: avg=29.21ms  min=0s           med=1µs     max=23.69s p(90)=1µs      p(95)=10µs
     http_req_connecting............: avg=54.19ms  min=0s           med=0s      max=23.57s p(90)=0s       p(95)=45.35ms
   ✓ http_req_duration..............: avg=979.24ms min=0s           med=64.72ms max=1m0s   p(90)=852.43ms p(95)=1.88s
       { expected_response:true }...: avg=409.28ms min=43.86ms      med=64.34ms max=59.97s p(90)=631.9ms  p(95)=1.44s
   ✓ http_req_failed................: 6.33%  ✓ 9774       ✗ 144537
     http_req_receiving.............: avg=2.42ms   min=0s           med=52µs    max=3.82s  p(90)=152µs    p(95)=402µs
     http_req_sending...............: avg=4.21ms   min=-153995000ns med=67µs    max=15.07s p(90)=180µs    p(95)=219µs
     http_req_tls_handshaking.......: avg=12.22ms  min=0s           med=0s      max=4.97s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=972.6ms  min=0s           med=64.11ms max=1m0s   p(90)=836.07ms p(95)=1.85s
     http_reqs......................: 154311 244.935802/s
     iteration_duration.............: avg=1m30s    min=213.18ms     med=52.75s  max=10m15s p(90)=3m59s    p(95)=5m12s
     iterations.....................: 3763   5.97296/s
     vus............................: 659    min=659      max=800
     vus_max........................: 800    min=800      max=800
```

#### 850 VU

```
running (10m30.0s), 000/850 VUs, 3981 complete and 710 interrupted iterations
default ✗ [==============>-----------------------] 850 VUs  10m30.0s/10m0s  4026/9923 shared iters

     ✗ is status 200
      ↳  97% — ✓ 177776 / ✗ 4975

   ✓ checks.........................: 97.27% ✓ 177776     ✗ 4975
     data_received..................: 643 MB 1.0 MB/s
     data_sent......................: 38 MB  60 kB/s
     dropped_iterations.............: 5232   8.304636/s
     http_req_blocked...............: avg=24.96ms  min=0s       med=0s      max=9.1s     p(90)=1µs      p(95)=3µs
     http_req_connecting............: avg=19.61ms  min=0s       med=0s      max=8.43s    p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=680.48ms min=0s       med=58.74ms max=1m0s     p(90)=476.25ms p(95)=1.18s
       { expected_response:true }...: avg=246.65ms min=43.79ms  med=54.38ms max=59.31s   p(90)=337.59ms p(95)=938.46ms
   ✓ http_req_failed................: 2.70%  ✓ 4980       ✗ 179229
     http_req_receiving.............: avg=1.42ms   min=0s       med=52µs    max=1.53s    p(90)=174µs    p(95)=362µs
     http_req_sending...............: avg=80.09µs  min=0s       med=54µs    max=200.94ms p(90)=138µs    p(95)=173µs
     http_req_tls_handshaking.......: avg=4.79ms   min=0s       med=0s      max=1.28s    p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=678.97ms min=0s       med=58.49ms max=1m0s     p(90)=471.52ms p(95)=1.17s
     http_reqs......................: 184209 292.390796/s
     iteration_duration.............: avg=1m32s    min=107.58ms med=52.48s  max=10m17s   p(90)=4m3s     p(95)=5m35s
     iterations.....................: 3981   6.318952/s
     vus............................: 710    min=710      max=850
     vus_max........................: 850    min=850      max=850
```

#### 900 VU

```
running (10m30.0s), 000/900 VUs, 3912 complete and 737 interrupted iterations
default ✗ [========================>-------------] 900 VUs  10m30.0s/10m0s  3912/5941 shared iters

     ✗ is status 200
      ↳  93% — ✓ 162168 / ✗ 11973

   ✓ checks.........................: 93.12% ✓ 162168    ✗ 11973
     data_received..................: 629 MB 999 kB/s
     data_sent......................: 41 MB  66 kB/s
     dropped_iterations.............: 1292   2.050763/s
     http_req_blocked...............: avg=28.58ms  min=0s           med=0s      max=23.38s p(90)=1µs      p(95)=20µs
     http_req_connecting............: avg=35.96ms  min=0s           med=0s      max=23.38s p(90)=0s       p(95)=45.21ms
   ✗ http_req_duration..............: avg=824.43ms min=0s           med=58.84ms max=1m0s   p(90)=1.29s    p(95)=2.16s
       { expected_response:true }...: avg=357.91ms min=43.76ms      med=52.94ms max=59.65s p(90)=983.38ms p(95)=1.79s
   ✓ http_req_failed................: 6.87%  ✓ 12028     ✗ 163028
     http_req_receiving.............: avg=1.94ms   min=0s           med=40µs    max=2.47s  p(90)=126µs    p(95)=311µs
     http_req_sending...............: avg=3.59ms   min=-731343000ns med=63µs    max=12.17s p(90)=167µs    p(95)=202µs
     http_req_tls_handshaking.......: avg=10.94ms  min=0s           med=0s      max=4.65s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=818.89ms min=0s           med=58.53ms max=1m0s   p(90)=1.27s    p(95)=2.13s
     http_reqs......................: 175056 277.86256/s
     iteration_duration.............: avg=1m37s    min=236.48ms     med=55.68s  max=10m14s p(90)=4m17s    p(95)=5m44s
     iterations.....................: 3912   6.209432/s
     vus............................: 738    min=738     max=900
     vus_max........................: 900    min=900     max=900
```

#### 950 VU

```
running (10m30.0s), 000/950 VUs, 1916 complete and 113 interrupted iterations
default ✗ [==================================>---] 950 VUs  10m30.0s/10m0s  1916/2029 shared iters

     ✗ is status 200
      ↳  83% — ✓ 65821 / ✗ 13265

   ✗ checks.........................: 83.22% ✓ 65821      ✗ 13265
     data_received..................: 246 MB 390 kB/s
     data_sent......................: 19 MB  31 kB/s
     http_req_blocked...............: avg=31.35ms  min=0s            med=0s      max=17.43s p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=94.79ms  min=0s            med=0s      max=17.43s p(90)=45.52ms  p(95)=47.54ms
   ✓ http_req_duration..............: avg=924.96ms min=0s            med=47.07ms max=1m0s   p(90)=840.13ms p(95)=2.5s
       { expected_response:true }...: avg=416.18ms min=43.87ms       med=49.2ms  max=54.43s p(90)=650.4ms  p(95)=1.95s
   ✗ http_req_failed................: 16.74% ✓ 13278      ✗ 66015
     http_req_receiving.............: avg=1.84ms   min=0s            med=41µs    max=2.07s  p(90)=129µs    p(95)=284.39µs
     http_req_sending...............: avg=15.81ms  min=-4704572000ns med=65µs    max=14.92s p(90)=176µs    p(95)=217µs
     http_req_tls_handshaking.......: avg=33.89ms  min=0s            med=0s      max=4.73s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=907.3ms  min=0s            med=46.71ms max=1m0s   p(90)=781.18ms p(95)=2.31s
     http_reqs......................: 79293  125.861269/s
     iteration_duration.............: avg=1m54s    min=624.95ms      med=59.6s   max=10m25s p(90)=5m5s     p(95)=6m39s
     iterations.....................: 1916   3.041254/s
     vus............................: 113    min=113      max=950
     vus_max........................: 950    min=950      max=950
```

### 30s quick test

#### 1 VU

```
     data_received..................: 188 kB 3.1 kB/s
     data_sent......................: 11 kB  180 B/s
     http_req_blocked...............: avg=2.43ms   min=0s      med=1µs     max=151ms    p(90)=1µs     p(95)=1µs
     http_req_connecting............: avg=747.41µs min=0s      med=0s      max=46.34ms  p(90)=0s      p(95)=0s
   ✓ http_req_duration..............: avg=52.81ms  min=44.57ms med=46.07ms max=101.75ms p(90)=88.73ms p(95)=90.56ms
       { expected_response:true }...: avg=52.01ms  min=44.57ms med=46.04ms max=90.8ms   p(90)=88ms    p(95)=89.5ms
   ✓ http_req_failed................: 1.61%  ✓ 1        ✗ 61
     http_req_receiving.............: avg=93.58µs  min=34µs    med=86.5µs  max=250µs    p(90)=124.9µs p(95)=204.74µs
     http_req_sending...............: avg=75.7µs   min=37µs    med=63µs    max=217µs    p(90)=133.1µs p(95)=168.65µs
     http_req_tls_handshaking.......: avg=1.67ms   min=0s      med=0s      max=103.92ms p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=52.64ms  min=44.4ms  med=45.92ms max=101.62ms p(90)=88.46ms p(95)=90.26ms
     http_reqs......................: 62     1.033313/s
     vus............................: 1      min=1      max=1
     vus_max........................: 1      min=1      max=1
```

#### 10 VU

```
     ✗ is status 200
      ↳  91% — ✓ 202 / ✗ 18

     checks.........................: 91.81% ✓ 202      ✗ 18
     data_received..................: 644 kB 11 kB/s
     data_sent......................: 53 kB  885 B/s
     http_req_blocked...............: avg=7.2ms    min=0s      med=1µs     max=289.31ms p(90)=1µs      p(95)=4.94µs
     http_req_connecting............: avg=1.66ms   min=0s      med=0s      max=48.96ms  p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=152.96ms min=44.69ms med=53.78ms max=1.33s    p(90)=393.15ms p(95)=870.15ms
       { expected_response:true }...: avg=111.3ms  min=44.69ms med=51.41ms max=1.33s    p(90)=128.58ms p(95)=415.05ms
   ✓ http_req_failed................: 6.73%  ✓ 19       ✗ 263
     http_req_receiving.............: avg=267.81µs min=29µs    med=87µs    max=30.77ms  p(90)=128µs    p(95)=164.95µs
     http_req_sending...............: avg=105.81µs min=34µs    med=78µs    max=591µs    p(90)=197.6µs  p(95)=253.74µs
     http_req_tls_handshaking.......: avg=5.3ms    min=0s      med=0s      max=233.88ms p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=152.58ms min=44.47ms med=53.64ms max=1.33s    p(90)=392.99ms p(95)=869.99ms
     http_reqs......................: 282    4.699927/s
     iteration_duration.............: avg=11.72s   min=10.04s  med=11.05s  max=21.37s   p(90)=12.64s   p(95)=19.57s
     iterations.....................: 23     0.383327/s
     vus............................: 2      min=2      max=10
     vus_max........................: 10     min=10     max=10
```

#### 100 VU

```
     ✗ is status 200
      ↳  90% — ✓ 2598 / ✗ 268

     checks.........................: 90.64% ✓ 2598      ✗ 268
     data_received..................: 10 MB  174 kB/s
     data_sent......................: 606 kB 10 kB/s
     http_req_blocked...............: avg=38.24ms  min=0s      med=1µs     max=2.75s    p(90)=1µs      p(95)=3µs
     http_req_connecting............: avg=31.68ms  min=0s      med=0s      max=2.36s    p(90)=0s       p(95)=0s
   ✗ http_req_duration..............: avg=490.92ms min=44.39ms med=80.28ms max=17.88s   p(90)=1.38s    p(95)=3.25s
       { expected_response:true }...: avg=362.02ms min=44.44ms med=74.33ms max=17.88s   p(90)=546.24ms p(95)=2.04s
   ✓ http_req_failed................: 8.92%  ✓ 277       ✗ 2826
     http_req_receiving.............: avg=630.27µs min=25µs    med=79µs    max=134.73ms p(90)=136µs    p(95)=168µs
     http_req_sending...............: avg=90.27µs  min=21µs    med=73µs    max=1.68ms   p(90)=149µs    p(95)=176µs
     http_req_tls_handshaking.......: avg=6.55ms   min=0s      med=0s      max=503.3ms  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=490.19ms min=44.25ms med=80.01ms max=17.88s   p(90)=1.38s    p(95)=3.25s
     http_reqs......................: 3103   51.714166/s
     iteration_duration.............: avg=15.25s   min=10.04s  med=11.99s  max=58.06s   p(90)=23.6s    p(95)=29.55s
     iterations.....................: 144    2.399884/s
     vus............................: 42     min=42      max=100
     vus_max........................: 100    min=100     max=100
```

#### 200 VU

```
     ✗ is status 200
      ↳  92% — ✓ 5617 / ✗ 441

     checks.........................: 92.72% ✓ 5617       ✗ 441
     data_received..................: 23 MB  388 kB/s
     data_sent......................: 1.3 MB 22 kB/s
     http_req_blocked...............: avg=33.79ms  min=0s      med=1µs      max=2.68s    p(90)=1µs   p(95)=3µs
     http_req_connecting............: avg=15.35ms  min=0s      med=0s       max=918.68ms p(90)=0s    p(95)=0s
   ✗ http_req_duration..............: avg=750.16ms min=44.23ms med=314.24ms max=47.62s   p(90)=1.38s p(95)=2.7s
       { expected_response:true }...: avg=663.38ms min=44.51ms med=280.67ms max=47.62s   p(90)=1.14s p(95)=1.62s
   ✓ http_req_failed................: 6.73%  ✓ 455        ✗ 6299
     http_req_receiving.............: avg=559.8µs  min=21µs    med=82µs     max=91.35ms  p(90)=173µs p(95)=292µs
     http_req_sending...............: avg=85.99µs  min=17µs    med=73µs     max=366µs    p(90)=148µs p(95)=173µs
     http_req_tls_handshaking.......: avg=17.76ms  min=0s      med=0s       max=1.74s    p(90)=0s    p(95)=0s
     http_req_waiting...............: avg=749.51ms min=44.14ms med=314.04ms max=47.62s   p(90)=1.38s p(95)=2.7s
     http_reqs......................: 6754   112.559684/s
     iteration_duration.............: avg=16.57s   min=10.04s  med=12.83s   max=57.25s   p(90)=25.6s p(95)=37.26s
     iterations.....................: 255    4.249736/s
     vus............................: 90     min=90       max=200
     vus_max........................: 200    min=200      max=200
```

#### 400 VU

```
     ✗ is status 200
      ↳  65% — ✓ 7651 / ✗ 4023

     checks.........................: 65.53% ✓ 7651       ✗ 4023
     data_received..................: 36 MB  597 kB/s
     data_sent......................: 2.4 MB 41 kB/s
     http_req_blocked...............: avg=67.48ms  min=0s      med=1µs      max=4.8s     p(90)=1µs    p(95)=3µs
     http_req_connecting............: avg=27.14ms  min=0s      med=0s       max=3.06s    p(90)=0s     p(95)=0s
   ✗ http_req_duration..............: avg=861.84ms min=43.85ms med=374.53ms max=33.8s    p(90)=1.54s  p(95)=1.62s
       { expected_response:true }...: avg=1.04s    min=44.51ms med=749.63ms max=33.8s    p(90)=1.54s  p(95)=1.67s
   ✗ http_req_failed................: 33.59% ✓ 4437       ✗ 8771
     http_req_receiving.............: avg=497.69µs min=14µs    med=77µs     max=180.36ms p(90)=174µs  p(95)=296µs
     http_req_sending...............: avg=88.21µs  min=18µs    med=74µs     max=921µs    p(90)=156µs  p(95)=185µs
     http_req_tls_handshaking.......: avg=40.29ms  min=0s      med=0s       max=2.86s    p(90)=0s     p(95)=0s
     http_req_waiting...............: avg=861.25ms min=43.77ms med=374.27ms max=33.8s    p(90)=1.54s  p(95)=1.62s
     http_reqs......................: 13208  220.106671/s
     iteration_duration.............: avg=18.47s   min=10.04s  med=13.95s   max=59.16s   p(90)=33.17s p(95)=47.77s
     iterations.....................: 483    8.049025/s
     vus............................: 181    min=181      max=400
     vus_max........................: 400    min=400      max=400
```

With new bogus traffic, warm cache.

```
     ✗ is status 200
      ↳  93% — ✓ 75369 / ✗ 5475

   ✓ checks.........................: 93.22% ✓ 75369      ✗ 5475
     data_received..................: 224 MB 355 kB/s
     data_sent......................: 13 MB  21 kB/s
     dropped_iterations.............: 11368  18.04416/s
     http_req_blocked...............: avg=24.37ms  min=0s       med=1µs     max=13.43s   p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=22.77ms  min=0s       med=0s      max=13.07s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=654.74ms min=44.06ms  med=62.12ms max=1m0s     p(90)=297.69ms p(95)=682.37ms
       { expected_response:true }...: avg=194.81ms min=44.06ms  med=61.02ms max=59.79s   p(90)=213.33ms p(95)=394.46ms
   ✓ http_req_failed................: 7.11%  ✓ 5796       ✗ 75672
     http_req_receiving.............: avg=6.36ms   min=0s       med=62µs    max=58.25s   p(90)=361µs    p(95)=4.39ms
     http_req_sending...............: avg=75.54µs  min=18µs     med=56µs    max=9.79ms   p(90)=142µs    p(95)=176µs
     http_req_tls_handshaking.......: avg=1.46ms   min=0s       med=0s      max=818.85ms p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=648.3ms  min=40.82ms  med=61.64ms max=1m0s     p(90)=278.97ms p(95)=652.2ms
     http_reqs......................: 81468  129.312249/s
     iteration_duration.............: avg=1m25s    min=166.44ms med=48.8s   max=10m27s   p(90)=3m38s    p(95)=5m4s
     iterations.....................: 1990   3.15868/s
     vus............................: 329    min=329      max=400
     vus_max........................: 400    min=400      max=400
```

Cold cache (while servers overloaded).

```
     ✗ is status 200
      ↳  51% — ✓ 43512 / ✗ 40556

   ✗ checks.........................: 51.75% ✓ 43512      ✗ 40556
     data_received..................: 131 MB 207 kB/s
     data_sent......................: 13 MB  21 kB/s
     dropped_iterations.............: 11400  18.09501/s
     http_req_blocked...............: avg=12.54ms  min=0s       med=1µs     max=8.43s    p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=9.86ms   min=0s       med=0s      max=7.98s    p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=696.24ms min=44.01ms  med=61.67ms max=1m0s     p(90)=307.66ms p(95)=929.56ms
       { expected_response:true }...: avg=59.03ms  min=44.01ms  med=46ms    max=3.08s    p(90)=90.49ms  p(95)=134.63ms
   ✗ http_req_failed................: 48.17% ✓ 40733      ✗ 43816
     http_req_receiving.............: avg=61.94ms  min=0s       med=69µs    max=59.92s   p(90)=7.02ms   p(95)=25.12ms
     http_req_sending...............: avg=79.1µs   min=16µs     med=58µs    max=185.45ms p(90)=143µs    p(95)=171µs
     http_req_tls_handshaking.......: avg=2.67ms   min=0s       med=0s      max=3.86s    p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=634.21ms min=43.94ms  med=60.65ms max=1m0s     p(90)=270.84ms p(95)=816.59ms
     http_reqs......................: 84549  134.203067/s
     iteration_duration.............: avg=1m26s    min=369.32ms med=50.03s  max=10m26s   p(90)=3m45s    p(95)=4m58s
     iterations.....................: 1950   3.095199/s
     vus............................: 336    min=336      max=400
     vus_max........................: 400    min=400      max=400
```

#### 500 VU

New bogus traffic.

```
     ✗ is status 200
      ↳  97% — ✓ 18850 / ✗ 550

   ✓ checks.........................: 97.16% ✓ 18850     ✗ 550
     data_received..................: 59 MB  654 kB/s
     data_sent......................: 3.7 MB 41 kB/s
     http_req_blocked...............: avg=75.42ms  min=0s      med=1µs     max=5.98s    p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=69.32ms  min=0s      med=0s      max=5.64s    p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=523.24ms min=44.09ms med=46.95ms max=1m0s     p(90)=280.6ms  p(95)=956.09ms
       { expected_response:true }...: avg=235.27ms min=44.09ms med=46.31ms max=57.53s   p(90)=183.64ms p(95)=601.81ms
   ✓ http_req_failed................: 2.74%  ✓ 566       ✗ 20088
     http_req_receiving.............: avg=768.39µs min=0s      med=68µs    max=182.46ms p(90)=162.7µs  p(95)=229µs
     http_req_sending...............: avg=86.55µs  min=17µs    med=71µs    max=1ms      p(90)=164µs    p(95)=198µs
     http_req_tls_handshaking.......: avg=6.04ms   min=0s      med=0s      max=1.77s    p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=522.39ms min=44.03ms med=46.44ms max=1m0s     p(90)=278.97ms p(95)=951.64ms
     http_reqs......................: 20654  229.46671/s
     iteration_duration.............: avg=39s      min=3.07s   med=38.48s  max=1m29s    p(90)=1m6s     p(95)=1m15s
     iterations.....................: 379    4.210704/s
     vus............................: 379    min=379     max=500
     vus_max........................: 500    min=500     max=500
```

#### 800 VU

Cold cache. New data. 13/12/22

Cold cache. Note high number of non-200's.

     ✗ is status 200
      ↳  63% — ✓ 17726 / ✗ 10181

```
   ✗ checks.........................: 63.51% ✓ 17726      ✗ 10181
     data_received..................: 87 MB  964 kB/s
     data_sent......................: 9.7 MB 108 kB/s
     http_req_blocked...............: avg=46.25ms  min=0s            med=0s      max=6.01s  p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=90.19ms  min=0s            med=0s      max=9.72s  p(90)=46.87ms  p(95)=54.65ms
   ✓ http_req_duration..............: avg=449.36ms min=0s            med=62.2ms  max=1m0s   p(90)=335.26ms p(95)=758.47ms
       { expected_response:true }...: avg=292.99ms min=44.11ms       med=67.82ms max=59.48s p(90)=365.16ms p(95)=808.28ms
   ✗ http_req_failed................: 33.64% ✓ 10220      ✗ 20159
     http_req_receiving.............: avg=1.4ms    min=0s            med=44µs    max=1.82s  p(90)=137µs    p(95)=205µs
     http_req_sending...............: avg=31.33ms  min=-1190187000ns med=64µs    max=15.71s p(90)=201µs    p(95)=264µs
     http_req_tls_handshaking.......: avg=57.18ms  min=0s            med=0s      max=4.74s  p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=416.62ms min=0s            med=61.93ms max=1m0s   p(90)=311.1ms  p(95)=658.89ms
     http_reqs......................: 30379  337.500232/s
     iteration_duration.............: avg=39.68s   min=588.72ms      med=39.3s   max=1m29s  p(90)=1m5s     p(95)=1m12s
     iterations.....................: 624    6.932425/s
     vus............................: 607    min=607      max=800
     vus_max........................: 800    min=800      max=800
```

#### 1000 VU

```
     ✗ is status 200
      ↳  29% — ✓ 8407 / ✗ 20523

     checks.........................: 29.05% ✓ 8407       ✗ 20523
     data_received..................: 58 MB  962 kB/s
     data_sent......................: 9.7 MB 162 kB/s
     http_req_blocked...............: avg=102.2ms  min=0s            med=0s      max=21.62s   p(90)=1µs      p(95)=3µs
     http_req_connecting............: avg=267.24ms min=0s            med=0s      max=21.49s   p(90)=831.27ms p(95)=1.57s
   ✗ http_req_duration..............: avg=509.44ms min=0s            med=45.17ms max=37.95s   p(90)=1.54s    p(95)=1.56s
       { expected_response:true }...: avg=1.41s    min=45.12ms       med=1.48s   max=27.77s   p(90)=1.58s    p(95)=1.97s
   ✗ http_req_failed................: 68.79% ✓ 21568      ✗ 9781
     http_req_receiving.............: avg=280.3µs  min=0s            med=37µs    max=581.54ms p(90)=128µs    p(95)=208µs
     http_req_sending...............: avg=37.61ms  min=-1683837000ns med=46µs    max=26.23s   p(90)=161µs    p(95)=205µs
     http_req_tls_handshaking.......: avg=68.44ms  min=0s            med=0s      max=4.67s    p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=471.54ms min=0s            med=44.99ms max=37.95s   p(90)=1.54s    p(95)=1.55s
     http_reqs......................: 31349  522.382557/s
     iteration_duration.............: avg=19.5s    min=10.09s        med=15.1s   max=59.85s   p(90)=36.9s    p(95)=43.52s
     iterations.....................: 1101   18.346461/s
     vus............................: 479    min=479      max=1000
     vus_max........................: 1000   min=1000     max=1000
```

Request per second limit disabled, warm cache.

```
     ✗ is status 200
      ↳  94% — ✓ 167081 / ✗ 10428

   ✓ checks.........................: 94.12% ✓ 167081     ✗ 10428
     data_received..................: 787 MB 1.2 MB/s
     data_sent......................: 34 MB  54 kB/s
     http_req_blocked...............: avg=54.35ms  min=0s            med=0s      max=30.69s   p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=49.97ms  min=0s            med=0s      max=24.51s   p(90)=0s       p(95)=46.6ms
   ✓ http_req_duration..............: avg=636.22ms min=0s            med=50.5ms  max=1m0s     p(90)=105.36ms p(95)=141.29ms
       { expected_response:true }...: avg=75.22ms  min=44.78ms       med=50.63ms max=57.18s   p(90)=99.58ms  p(95)=139.59ms
   ✓ http_req_failed................: 5.89%  ✓ 10480      ✗ 167295
     http_req_receiving.............: avg=442.66µs min=0s            med=53µs    max=896.86ms p(90)=123µs    p(95)=187µs
     http_req_sending...............: avg=1.43ms   min=-2103456999ns med=64µs    max=4.63s    p(90)=145µs    p(95)=171µs
     http_req_tls_handshaking.......: avg=9.05ms   min=0s            med=0s      max=29.76s   p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=634.34ms min=0s            med=50.3ms  max=1m0s     p(90)=103.35ms p(95)=140.66ms
     http_reqs......................: 177775 282.180415/s
     iteration_duration.............: avg=1m42s    min=10.04s        med=37.52s  max=10m21s   p(90)=5m4s     p(95)=6m32s
     iterations.....................: 2702   4.288857/s
     vus............................: 135    min=135      max=1000
     vus_max........................: 1000   min=1000     max=1000
```

```
   ✓ checks.........................: 98.19% ✓ 174885     ✗ 3215
     data_received..................: 806 MB 1.3 MB/s
     data_sent......................: 32 MB  50 kB/s
     http_req_blocked...............: avg=37.06ms  min=0s      med=0s      max=23.1s    p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=27.93ms  min=0s      med=0s      max=22.68s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=526.16ms min=44.74ms med=50.11ms max=1m0s     p(90)=105.19ms p(95)=141.26ms
       { expected_response:true }...: avg=70.86ms  min=44.74ms med=49.91ms max=39.29s   p(90)=99.43ms  p(95)=139.56ms
   ✓ http_req_failed................: 1.85%  ✓ 3302       ✗ 175014
     http_req_receiving.............: avg=471.93µs min=0s      med=58µs    max=903.68ms p(90)=155µs    p(95)=303µs
     http_req_sending...............: avg=127.31µs min=18µs    med=67µs    max=920.65ms p(90)=154µs    p(95)=184µs
     http_req_tls_handshaking.......: avg=9.09ms   min=0s      med=0s      max=5.59s    p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=525.56ms min=41.68ms med=49.88ms max=1m0s     p(90)=103.25ms p(95)=140.79ms
     http_reqs......................: 178316 283.039731/s
     iteration_duration.............: avg=1m36s    min=10.04s  med=27.05s  max=10m23s   p(90)=4m50s    p(95)=6m18s
     iterations.....................: 2705   4.293627/s
     vus............................: 132    min=132      max=1000
     vus_max........................: 1000   min=1000     max=1000
```

#### 2000 VU

```
     ✗ is status 200
      ↳  20% — ✓ 9458 / ✗ 36106

     checks.........................: 20.75% ✓ 9458       ✗ 36106
     data_received..................: 64 MB  1.1 MB/s
     data_sent......................: 11 MB  182 kB/s
     http_req_blocked...............: avg=231.39ms min=0s            med=0s      max=27.73s p(90)=1µs     p(95)=14µs
     http_req_connecting............: avg=242.07ms min=0s            med=0s      max=19.78s p(90)=54.09ms p(95)=542.15ms
   ✗ http_req_duration..............: avg=380.11ms min=0s            med=45.66ms max=40.34s p(90)=1.54s   p(95)=1.55s
       { expected_response:true }...: avg=1.42s    min=44.99ms       med=1.53s   max=40.34s p(90)=1.6s    p(95)=1.97s
   ✗ http_req_failed................: 77.88% ✓ 39337      ✗ 11169
     http_req_receiving.............: avg=437.79µs min=0s            med=54µs    max=1.1s   p(90)=237µs   p(95)=419µs
     http_req_sending...............: avg=3.61ms   min=-2377612000ns med=51µs    max=27.71s p(90)=144µs   p(95)=182µs
     http_req_tls_handshaking.......: avg=36.65ms  min=0s            med=0s      max=27.25s p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=376.06ms min=0s            med=45.49ms max=40.34s p(90)=1.54s   p(95)=1.54s
     http_reqs......................: 50506  840.667158/s
     iteration_duration.............: avg=22.96s   min=10.09s        med=18.64s  max=58.12s p(90)=35.94s  p(95)=42.94s
     iterations.....................: 1563   26.015974/s
     vus............................: 1078   min=1078     max=2000
     vus_max........................: 2000   min=2000     max=2000
```

```
     ✗ is status 200
      ↳  63% — ✓ 3790 / ✗ 2139

     checks.........................: 63.92% ✓ 3790       ✗ 2139
     data_received..................: 68 MB  1.1 MB/s
     data_sent......................: 6.9 MB 115 kB/s
     http_req_blocked...............: avg=46.5ms   min=0s      med=1µs      max=4.64s    p(90)=147.17ms p(95)=150.91ms
     http_req_connecting............: avg=14.63ms  min=0s      med=0s       max=190.57ms p(90)=45.9ms   p(95)=46.97ms
   ✗ http_req_duration..............: avg=863.15ms min=0s      med=202.61ms max=28.94s   p(90)=3.42s    p(95)=4.68s
       { expected_response:true }...: avg=964.82ms min=44.92ms med=215.24ms max=28.94s   p(90)=3.58s    p(95)=4.62s
   ✗ http_req_failed................: 28.86% ✓ 3415       ✗ 8415
     http_req_receiving.............: avg=1.31ms   min=0s      med=61µs     max=451.12ms p(90)=159µs    p(95)=332µs
     http_req_sending...............: avg=124.51µs min=0s      med=104µs    max=170.5ms  p(90)=184µs    p(95)=211µs
     http_req_tls_handshaking.......: avg=31.86ms  min=0s      med=0s       max=4.6s     p(90)=101ms    p(95)=104.71ms
     http_req_waiting...............: avg=861.71ms min=0s      med=202.1ms  max=28.94s   p(90)=3.41s    p(95)=4.68s
     http_reqs......................: 11830  197.137231/s
     iteration_duration.............: avg=38.52s   min=10.37s  med=37.15s   max=59.97s   p(90)=56.65s   p(95)=58.25s
     iterations.....................: 1816   30.262148/s
     vus............................: 595    min=595      max=2000
     vus_max........................: 2000   min=2000     max=2000
```

#### RPS limit disabled

Cold cache.

```
   ✓ checks.........................: 90.78% ✓ 161156     ✗ 16359
     data_received..................: 763 MB 1.2 MB/s
     data_sent......................: 33 MB  52 kB/s
     http_req_blocked...............: avg=84.89ms  min=0s            med=0s      max=49.37s p(90)=1µs      p(95)=2µs
     http_req_connecting............: avg=127.48ms min=0s            med=0s      max=29.91s p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=673.89ms min=0s            med=53.18ms max=1m0s   p(90)=549.73ms p(95)=1.22s
       { expected_response:true }...: avg=218.9ms  min=44.81ms       med=54.02ms max=49.81s p(90)=547.06ms p(95)=1.04s
   ✓ http_req_failed................: 9.22%  ✓ 16399      ✗ 161356
     http_req_receiving.............: avg=1.38ms   min=0s            med=55µs    max=2.91s  p(90)=147µs    p(95)=330µs
     http_req_sending...............: avg=5.17ms   min=-3328838000ns med=71µs    max=30.18s p(90)=179µs    p(95)=216µs
     http_req_tls_handshaking.......: avg=10.54ms  min=0s            med=0s      max=32.38s p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=667.33ms min=0s            med=52.9ms  max=1m0s   p(90)=548.95ms p(95)=1.17s
     http_reqs......................: 177755 282.150871/s
     iteration_duration.............: avg=2m25s    min=2.12s         med=1m32s   max=10m27s p(90)=5m59s    p(95)=7m40s
     iterations.....................: 2685   4.261906/s
     vus............................: 152    min=152      max=2000
     vus_max........................: 2000   min=2000     max=2000
```

Warm cache.

```
     ✗ is status 200
      ↳  97% — ✓ 173307 / ✗ 4939

   ✓ checks.........................: 97.22% ✓ 173307     ✗ 4939
     data_received..................: 795 MB 1.3 MB/s
     data_sent......................: 32 MB  51 kB/s
     http_req_blocked...............: avg=109.57ms min=0s      med=0s      max=31.68s   p(90)=1µs      p(95)=3µs
     http_req_connecting............: avg=99.98ms  min=0s      med=0s      max=25.87s   p(90)=0s       p(95)=0s
   ✓ http_req_duration..............: avg=529.01ms min=0s      med=51.01ms max=1m0s     p(90)=104.6ms  p(95)=140.34ms
       { expected_response:true }...: avg=74.4ms   min=43.86ms med=50.82ms max=22.17s   p(90)=97.37ms  p(95)=135.57ms
   ✓ http_req_failed................: 2.79%  ✓ 4986       ✗ 173418
     http_req_receiving.............: avg=434.7µs  min=0s      med=56µs    max=878.31ms p(90)=148µs    p(95)=226.85µs
     http_req_sending...............: avg=157.66µs min=0s      med=61µs    max=2.39s    p(90)=135µs    p(95)=159µs
     http_req_tls_handshaking.......: avg=13.3ms   min=0s      med=0s      max=28.66s   p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=528.42ms min=0s      med=50.77ms max=1m0s     p(90)=102.56ms p(95)=138.91ms
     http_reqs......................: 178404 283.180918/s
     iteration_duration.............: avg=2m8s     min=955.7ms med=1m8s    max=10m27s   p(90)=5m23s    p(95)=7m0s
     iterations.....................: 2702   4.288888/s
     vus............................: 135    min=135      max=2000
     vus_max........................: 2000   min=2000     max=2000
```
