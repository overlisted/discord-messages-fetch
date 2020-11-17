const fs = require("fs");
const fetch = require("node-fetch");

function readFileString(path) {
  return fs.readFileSync(path, {encoding: "utf8"}).replace(/\r?\n|\r/g, "");
}

const token = readFileString("token.txt");
const channel = process.argv[2];
if(!channel) {
  console.error("Usage: node index.js <channel id>");
  process.exit(1);
}

const headers = {authorization: token};

async function request(before) {
  const options = {
    method: "GET",
    headers: headers
  };
  
  const request = await fetch(
    `https://discord.com/api/channels/${channel}/messages?limit=100&${before ? "before=" + before : ""}`, 
    options
  );
    
  return await request.json();
}

let result;

async function go() {
  let page = await request();
  
  result = page;

  while(page.length >= 100) {
    page = await request(page[page.length - 1].id);
    result = result.concat(page);
  }
  
  console.log(`Fetched ${result.length} messages`);
  
  fs.writeFileSync("messages.json", JSON.stringify(result, null, 2));
}

go();
