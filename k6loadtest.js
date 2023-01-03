import { SharedArray } from "k6/data";
import { sleep, check, test } from "k6";
import http from "k6/http";
import { scenario } from "k6/execution";
import {
  tagWithCurrentStageIndex,
  tagWithCurrentStageProfile,
} from "https://jslib.k6.io/k6-utils/1.3.0/index.js";

const offset = __ENV.SCENARIO_OFFSET ? parseInt(__ENV.SCENARIO_OFFSET) : 0;

const urlPrefix = "https://api.dwebsearch.org";
const sleepAfter = 60;

const visits = new SharedArray("visits", function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open("./visits.json"));

  if (offset) {
    console.log(`Using scenario offset of ${offset}.`);
  }

  console.log("Read visits:", f.length);

  return f;
});

export const options = {
  stages: [
    { duration: "5m", target: 1000 }, // Ramp up to 1000
    { duration: "2m", target: 1000 }, // Stay for 2m at 1000
    { duration: "5m", target: 2000 }, // Ramp up to 2000
    { duration: "2m", target: 2000 }, // Stay for 2m at 2000
    { duration: "5m", target: 3000 }, // Ramp up to 3000
    { duration: "2m", target: 3000 }, // Stay for 2m at 3000
    { duration: "5m", target: 4000 }, // Ramp up to 4000
    { duration: "2m", target: 4000 }, // Stay for 2m at 4000
    { duration: "5m", target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    checks: ["rate>0.9"],
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(90)<1000"],
  },
  discardResponseBodies: true,
};

export default function () {
  // Pick a new batch for every iteration.
  const visitIteration = scenario.iterationInTest + offset;

  // Abort test on out of bound condition.
  if (visitIteration > visits.length - 1) {
    test.abort("Out of visits for iteration.");
  }

  const visit = visits[visitIteration];

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

    tagWithCurrentStageIndex();
    tagWithCurrentStageProfile();

    const responses = http.batch(requests);

    for (const response of responses) {
      check(response, {
        "is status 200": (r) => r.status === 200,
      });
    }
  }

  sleep(sleepAfter * Math.random());
}
