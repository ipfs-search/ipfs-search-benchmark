import { SharedArray } from "k6/data";
import { sleep, check } from "k6";
import http from "k6/http";
import { scenario } from "k6/execution";

const offset = __ENV.SCENARIO_OFFSET ? parseInt(__ENV.SCENARIO_OFFSET) : 0;

const urlPrefix = "https://api.ipfs-search.com";
const sleepAfter = 60;

const visits = new SharedArray("visits", function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open("./visits.json"));

  console.log("Read visits:", f.length);

  return f;
});

export const options = {
  vus: 400,
  // TODO: Whitelist request limiting in frontend server
  // rps: 200,
  thresholds: {
    checks: ["rate>0.9"],
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(90)<1000"],
  },
  iterations: visits.length,
  discardResponseBodies: true,
};

export default function () {
  // Pick a new batch for every iteration.
  const visit = visits[scenario.iterationInTest + offset];

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

  sleep(sleepAfter * Math.random());
}
