import { world, system } from "@minecraft/server";

// CHUNK BLOCKS 67 — transforma los bloques existentes de cada chunk
// visitado en un solo bloque aleatorio. Los espacios de aire se conservan.

const BLOCKS = [
  "minecraft:stone", "minecraft:cobblestone", "minecraft:dirt",
  "minecraft:grass_block", "minecraft:sand", "minecraft:red_sand",
  "minecraft:gravel", "minecraft:oak_planks", "minecraft:birch_planks",
  "minecraft:oak_log", "minecraft:oak_leaves", "minecraft:glass",
  "minecraft:bricks", "minecraft:obsidian", "minecraft:netherrack",
  "minecraft:glowstone", "minecraft:amethyst_block", "minecraft:packed_ice",
  "minecraft:clay", "minecraft:moss_block", "minecraft:prismarine",
  "minecraft:gold_block", "minecraft:iron_block", "minecraft:diamond_block",
  "minecraft:emerald_block", "minecraft:copper_block", "minecraft:quartz_block"
];

const done = new Set();
const running = new Set();

function* convertChunk(dimension, chunkX, chunkZ, blockId, key) {
  const minY = dimension.heightRange.min;
  const maxY = dimension.heightRange.max;
  const x0 = chunkX * 16;
  const z0 = chunkZ * 16;

  try {
    // Recorre por columnas y cede el control periódicamente para evitar bloqueos.
    for (let x = x0; x < x0 + 16; x++) {
      for (let z = z0; z < z0 + 16; z++) {
        for (let y = minY; y < maxY; y++) {
          try {
            const block = dimension.getBlock({ x, y, z });
            if (block && block.typeId !== "minecraft:air" &&
                block.typeId !== "minecraft:cave_air" &&
                block.typeId !== "minecraft:void_air") {
              block.setType(blockId);
            }
          } catch {}
        }
        yield;
      }
    }
  } finally {
    running.delete(key);
  }
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const pos = player.location;
    const cx = Math.floor(pos.x / 16);
    const cz = Math.floor(pos.z / 16);
    const key = player.dimension.id + ":" + cx + ":" + cz;
    if (done.has(key) || running.has(key)) continue;

    const chosen = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
    done.add(key);
    running.add(key);
    player.sendMessage("§6[CHUNK BLOCKS 67] §fEste chunk se convertirá en §e" +
      chosen.replace("minecraft:", "") + "§f.");
    system.runJob(convertChunk(player.dimension, cx, cz, chosen, key));
  }
}, 20);
