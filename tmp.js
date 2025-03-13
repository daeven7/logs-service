const logData = `
[2025-01-20T10:00:00Z] ERROR Database timeout {"userId": 123, "ip": "192.168.1.1"}
[2025-02-20T10:01:00Z] INFO User login {"userId": 124, "ip": "192.168.1.2"}
[2025-03-20T10:02:00Z] ERROR Connection lost {"userId": 125, "ip": "192.168.1.3"}
[2025-04-20T10:02:00Z] DEBUG Requesting Permissions {"userId": 3434, "ip": "192.168.1.3"}
`;

// Regular expression to match the log entries
const logPattern = /\[(.*?)\] (\w+) (.*?) \{(.*?)\}/g;

const logs = [];
let match;

while ((match = logPattern.exec(logData)) !== null) {
  const timestamp = match[1];
  const level = match[2];
  const message = match[3];
  const json = JSON.parse('{' + match[4] + '}');  // Parse the JSON part

  // Extract the userId and ip from the JSON
  const { userId, ip } = json;

  // Store the extracted data in an object
  logs.push({
    timestamp,
    level,
    message,
    json,
    userId,
    ip
  });
}

// Output the extracted logs
console.log(logs);
