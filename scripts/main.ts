import { world, system } from "@minecraft/server";
import { registerDoorListener } from "./door";
import { registerFenceListener } from "./fence";
import { registerTrapdoorListener } from "./trapdoor";

registerDoorListener();
registerFenceListener();
registerTrapdoorListener();