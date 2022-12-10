import { SharedArray } from "k6/data";
import { sleep, check } from "k6";
import http from "k6/http";
import { randomSeed } from "k6";
import { scenario } from "k6/execution";

randomSeed(34234234);

const urlPrefix = "https://api.ipfs-search.com";
const sleepAfter = 10;

const batches = new SharedArray("batches", function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open("./batches.json"));

  console.log("Read batches:", f.length);

  // Shuffle array
  const shuffled = f
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled;
});

export const options = {
  // stages: [
  //   { duration: "5m", target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
  //   { duration: "10m", target: 100 }, // stay at 100 users for 10 minutes
  //   { duration: "5m", target: 0 }, // ramp-down to 0 users
  // ],
  vus: 400,
  duration: "2m",
  gracefulStop: "1m",
  // TODO: Whitelist request limiting in frontend server
  rps: 200,
  thresholds: {
    checks: ["rate>0.9"],
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(90)<500"],
  },
  iterations: batches.length,
  // discardResponseBodies: true,
};

export default function () {
  // Pick a new batch for every iteration.
  const visit = batches[scenario.iterationInTest];

  for (const batch of visit) {
    sleep(batch.seconds_before);

    const requests = batch.paths.map(function (path) {
      return {
        method: "GET",
        url: urlPrefix + path,
        param: {
          tags: {
            api: path.split("/")[2].split("?")[0],
          },
        },
      };
    });

    const responses = http.batch(requests);

    for (const response of responses) {
      check(response, {
        "is status 200": (r) => r.status === 200,
      });
    }
  }

  sleep(sleepAfter);
}
