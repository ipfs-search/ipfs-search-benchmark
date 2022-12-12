const fs = require("fs"),
  parse = require("clf-parser"),
  readline = require("readline");

const visitDurationMillis = 300 * 1000; // 5 min of no traffic signifies a new visit.
const ignored_paths = ["/v1/queue-pinservice/pins", "/server_status"]; // Paths we're not testing for.
const ignored_status = [301, 400, 404]; // This won't actully hit our backend.
const ignored_remotes = ["130.245.145.0", "148.71.182.0"]; // Skip known bots.
const max_visit_steps = 256; // Reduce oversized batches; reduces crawlers.
const dataFile = "visits.json";

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
      ignored_status.includes(parsed.status) ||
      ignored_remotes.includes(parsed.remote_addr)
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

function getVisits(remotes) {
  // Pile remotes together, yielding just visits.
  const visits = [];

  for (const [key, value] of Object.entries(remotes)) {
    visits.push(...value);
  }

  console.log(`Found ${visits.length} visits.`);
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

function visitsToBatches(visits) {
  let batchCount = 0;

  const batchedVisits = visits.map((visit) => {
    batches = visitToBatches(visit);
    batchCount += batches.length;
    return batches;
  });

  console.log(`Grouped ${batchCount} batches.`);
  return batchedVisits;
}

function filterOverlySizedVisits(visits) {
  const filtered = visits.filter((visit) => visit.length < max_visit_steps);
  console.log(
    `Removed ${visits.length - filtered.length} overly sized visits.`
  );
  return filtered;
}

function shuffleArray(a) {
  console.log("Shuffling visits.");

  return a
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

async function main() {
  const visits = shuffleArray(
    filterOverlySizedVisits(visitsToBatches(getVisits(await getRemotes())))
  );

  console.log(`Writing visits to ${dataFile}.`);
  fs.writeFileSync(dataFile, JSON.stringify(visits, null, 2), "utf8");

  process.exit();
}

main();
