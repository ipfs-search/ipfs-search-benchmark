# ipfs-search-benchmark

## Results

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
