import fs from 'fs';

// simple script to parse the GLB and just read the JSON chunk
const buffer = fs.readFileSync('public/models/cute-robot.glb');
const magic = buffer.readUInt32LE(0);
if (magic !== 0x46546C67) {
  console.log("Not a GLB");
  process.exit(1);
}
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);

const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.readUInt32LE(16);

if (chunkType === 0x4E4F534A) { // JSON
  const jsonChunk = buffer.subarray(20, 20 + chunkLength);
  const json = JSON.parse(jsonChunk.toString('utf8'));
  console.log("Meshes:");
  if (json.meshes) {
    json.meshes.forEach((m, i) => console.log(i, m.name));
  }
  console.log("Nodes:");
  if (json.nodes) {
    json.nodes.forEach((n, i) => console.log(i, n.name, n.mesh));
  }
  console.log("Materials:");
  if (json.materials) {
    json.materials.forEach((m, i) => console.log(i, m.name));
  }
}
