const fs = require("fs"),
  parse = require("clf-parser"),
  readline = require("readline");

const visitDurationMillis = 300 * 1000;
const ignored_paths = ["/v1/queue-pinservice/pins", "/server_status"];
const ignored_status = [301, 400, 400];
const dataFile = "batches.json";

async function getRemotes() {
  console.log("Parsing log, sort remotes.");

  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  const remotes = {};
  var count = 0;
  for await (const line of rl) {
    const parsed = parse(line);

    // Filter out ignored stuff.
    if (
      ignored_paths.includes(parsed.path) ||
      ignored_status.includes(parsed.status)
    ) {
      continue;
    }

    if (!(parsed.remote_addr in remotes)) {
      // New remote, new visit
      count++;
      console.log(`Found ${count} remotes.`);

      remotes[parsed.remote_addr] = [[parsed]];
    } else {
      const visits = remotes[parsed.remote_addr];
      const latest_visit = visits[visits.length - 1];
      const latest_request = latest_visit[latest_visit.length - 1];
      const time_since_latest_visit = Math.abs(
        parsed.time_local - latest_request.time_local
      );

      if (time_since_latest_visit > visitDurationMillis) {
        console.log(`New visit from existing remote ${parsed.remote_addr}`);
        remotes[parsed.remote_addr].push([parsed]);
      } else {
        // Add request to existing visit
        remotes[parsed.remote_addr][visits.length - 1].push(parsed);
      }
    }
  }

  rl.close();

  return remotes;
}

async function getVisits(remotes) {
  // Pile remotes together, yielding just visits.
  const visits = [];

  for (const [key, value] of Object.entries(await remotes)) {
    visits.push(...value);
  }

  return visits;
}

function visitToBatches(visit) {
  var previous_time = visit[0].time_local;

  const batches = [];
  for (const request of visit) {
    const time_since_previous = Math.abs(request.time_local - previous_time);
    previous_time = request.time_local;

    if (batches.length > 0 && time_since_previous === 0) {
      // Append to last batch
      batches[batches.length - 1].paths.push(request.path);
    } else {
      // Create new batch
      if (!request.path) {
        console.error(request);
      }
      batches.push({
        paths: [request.path],
        seconds_before: time_since_previous / 1000,
      });
    }
  }

  return batches;
}

async function visitsToBatches(visits) {
  return (await visits).map(visitToBatches);
}

async function writeBatches(visits) {
  // Write to JSON data file.
  fs.writeFileSync(dataFile, JSON.stringify(await visits, null, 2), "utf8");
}

async function printBatches(visits) {
  const v = await visits;
  console.log(`Found ${v.length} visits.`);

  process.exit();
}

const remotes = getRemotes();
const visits = getVisits(remotes);
const batches = visitsToBatches(visits);
writeBatches(batches);
printBatches(batches);
