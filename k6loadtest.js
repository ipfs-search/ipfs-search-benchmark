import { SharedArray } from "k6/data";
import { sleep, check } from "k6";
import http from "k6/http";
import { exec, scenario } from "k6/execution";
import {
  tagWithCurrentStageIndex,
  tagWithCurrentStageProfile,
} from "https://jslib.k6.io/k6-utils/1.3.0/index.js";
import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";

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
  scenarios: {
    ramp_vus: {
      executor: "ramping-vus",
      startVUs: 1600,
      stages: [
        { duration: "2m", target: 1600 },
        { duration: "4m", target: 2000 },
        { duration: "2m", target: 2000 },
        { duration: "4m", target: 2400 },
        { duration: "2m", target: 2400 },
        { duration: "4m", target: 2800 },
        { duration: "2m", target: 2800 },
      ],
    },
  },
  thresholds: {
    "checks{check:cache_hit}": ["rate>0.1"],
    "checks{check:status_200_or_308}": ["rate>0.9"],
    "checks{check:JSON}": ["rate>0.9"],
    "checks{check:gzip}": ["rate>0.9"],
    "checks{check:etag}": ["rate>0.9"],
    "checks{check:cache_headers}": ["rate>0.9"],
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(90)<1000"],
  },
  discardResponseBodies: true,
};

function getNameFromURL(url) {
  try {
    const urlObj = new URL(url);
    const pathSplit = urlObj.pathname.split("/");

    if (pathSplit.length < 3) throw new Error("Less than 3 elements in path.");
    return pathSplit[2];
  } catch (e) {
    console.error("Error getting name from URL:", e);
    return "";
  }
}

function getURLFromPath(path) {
  if (!path) throw new Error("Empty path");
  return urlPrefix + path;
}

export default function () {
  // Pick a new batch for every iteration.
  const visitIteration = scenario.iterationInTest + offset;

  // Abort test on out of bound condition.
  if (visitIteration > visits.length - 1) {
    exec.test.abort("Out of visits for iteration.");
  }

  const visit = visits[visitIteration];

  for (const batch of visit) {
    const requests = batch.paths
      .filter((p) => p) // Filter empty paths.
      .map(function (path) {
        const url = getURLFromPath(path);

        return {
          method: "GET",
          url: url,
          params: {
            tags: {
              name: getNameFromURL(url),
            },
            headers: {
              "Accept-Encoding": "gzip",
            },
          },
        };
      });

    tagWithCurrentStageIndex();
    tagWithCurrentStageProfile();

    sleep(batch.seconds_before);

    const responses = http.batch(requests);

    for (const response of responses) {
      check(
        response,
        {
          cache_hit: (r) =>
            "X-Cache-Status" in r.headers &&
            r.headers["X-Cache-Status"] === "HIT",
          status_200_or_308: (r) => r.status === 200 || r.status === 308,
          JSON: (r) =>
            "Content-Type" in r.headers &&
            r.headers["Content-Type"] === "application/json; charset=utf-8",
          gzip: (r) =>
            "Content-Encoding" in r.headers &&
            r.headers["Content-Encoding"] === "gzip",
          cache_headers: (r) =>
            "Cache-Control" in r.headers &&
            "Expires" in r.headers &&
            "Etag" in r.headers,
        },
        {
          name: getNameFromURL(response.request.url),
        }
      );
    }
  }

  sleep(sleepAfter * Math.random());
}
