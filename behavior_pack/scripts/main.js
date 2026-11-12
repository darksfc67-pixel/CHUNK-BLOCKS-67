import { world, system } from "@minecraft/server";
const BLOCKS=["minecraft:stone","minecraft:cobblestone","minecraft:dirt","minecraft:grass_block","minecraft:sand","minecraft:red_sand","minecraft:gravel","minecraft:oak_planks","minecraft:birch_planks","minecraft:oak_log","minecraft:oak_leaves","minecraft:glass","minecraft:bricks","minecraft:obsidian","minecraft:netherrack","minecraft:glowstone","minecraft:amethyst_block","minecraft:packed_ice","minecraft:clay","minecraft:moss_block","minecraft:prismarine","minecraft:gold_block","minecraft:iron_block","minecraft:diamond_block","minecraft:emerald_block","minecraft:copper_block","minecraft:quartz_block"];
const done=new Set(), running=new Set();
function* convert(dimension,cx,cz,id,key){
 try{
  const min=dimension.heightRange.min,max=dimension.heightRange.max;
  for(let x=cx*16;x<cx*16+16;x++){
   for(let z=cz*16;z<cz*16+16;z++){
    for(let y=min;y<max;y++){
     try{const b=dimension.getBlock({x,y,z});if(b&&!["minecraft:air","minecraft:cave_air","minecraft:void_air"].includes(b.typeId))b.setType(id);}catch{}
    }
    yield;
   }
  }
 }finally{running.delete(key);}
}
system.runInterval(()=>{
 for(const p of world.getAllPlayers()){
  const x=Math.floor(p.location.x/16),z=Math.floor(p.location.z/16),key=p.dimension.id+":"+x+":"+z;
  if(done.has(key)||running.has(key))continue;
  const id=BLOCKS[Math.floor(Math.random()*BLOCKS.length)];
  done.add(key);running.add(key);
  p.sendMessage("§6[CHUNK BLOCKS 67] §fBloque elegido: §e"+id.replace("minecraft:",""));
  system.runJob(convert(p.dimension,x,z,id,key));
 }
},20);