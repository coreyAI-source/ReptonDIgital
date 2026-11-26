// Test-only webhook receiver for the end-to-end suite. It stands in for a CRM or
// automation tool, keeps every lead it receives, and rejects bad secrets.
import http from "node:http";

const port = Number(process.argv[2] ?? 4010);
const leads = [];

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok");
    return;
  }

  if (request.url === "/leads" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(leads));
    return;
  }

  if (request.url === "/hook" && request.method === "POST") {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      if (request.headers.authorization !== "Bearer e2e-secret") {
        response.writeHead(401);
        response.end();
        return;
      }
      // Test switch: a description containing this marker simulates a failed delivery.
      if (raw.includes("E2E-FORCE-FAILURE")) {
        response.writeHead(500);
        response.end();
        return;
      }
      try {
        leads.push(JSON.parse(raw));
      } catch {
        response.writeHead(400);
        response.end();
        return;
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ received: true }));
    });
    return;
  }

  response.writeHead(404);
  response.end();
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock webhook listening on http://127.0.0.1:${port}`);
});
