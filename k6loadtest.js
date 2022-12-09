import { SharedArray } from "k6/data";
import { sleep } from "k6";
import http from "k6/http";
import { randomSeed } from "k6";

randomSeed(22348501);

const urlPrefix = "https://api.ipfs-search.com";
const sleepAfter = 30;

const batches = new SharedArray("batches", function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open("./batches.json"));
  return f; // f must be an array
});

export default function () {
  // Pick a random set of batches
  const visit = batches[Math.floor(Math.random() * batches.length)];

  for (const batch of visit) {
    sleep(batch.seconds_before);

    const requests = batch.paths.map(function (path) {
      return {
        method: "GET",
        url: urlPrefix + path,
      };
    });
    http.batch(requests);
  }

  sleep(sleepAfter);
}
