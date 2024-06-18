// === CONFIGURABLE VARIABLES

const bpfoldername = "CityCrafterAddon";
const useMinecraftPreview = false; // Whether to target the "Minecraft Preview" version of Minecraft vs. the main store version of Minecraft
const useMinecraftDedicatedServer = false; // Whether to use Bedrock Dedicated Server - see https://www.minecraft.net/download/server/bedrock
const dedicatedServerPath = "C:/mc/bds/1.19.0/"; // if using Bedrock Dedicated Server, where to find the extracted contents of the zip package

// === END CONFIGURABLE VARIABLES

const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const os = require("os");
const spawn = require("child_process").spawn;
const sourcemaps = require("gulp-sourcemaps");
const jsonTransform = require('gulp-json-transform');

const worldsFolderName = useMinecraftDedicatedServer ? "worlds" : "minecraftWorlds";

const activeWorldFolderName = useMinecraftDedicatedServer ? "Bedrock level" : bpfoldername + "world";

const mcdir = useMinecraftDedicatedServer
  ? dedicatedServerPath
  : os.homedir() +
  (useMinecraftPreview
    ? "/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/"
    : "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/");

function clean_build(callbackFunction) {
  del(["build/behavior_packs/", "build/resource_packs/"]).then(
    (value) => {
      callbackFunction(); // success
    },
    (reason) => {
      callbackFunction(); // error
    }
  );
}

function copy_behavior_packs() {
  return gulp.src(["behavior_packs/**/*"]).pipe(gulp.dest("build/behavior_packs"));
}

function copy_resource_packs() {
  return gulp.src(["resource_packs/**/*"]).pipe(gulp.dest("build/resource_packs"));
}

function getDoorPermutation(data, facing, upper_block_bit, door_hinge_bit, open_bit) {

  const geometry = {
    "identifier": upper_block_bit ? "geometry.cc_door_down" : "geometry.cc_door_up",
    "bone_visibility": {
      "normal": "!q.block_state('cc:door_hinge_bit') != q.block_state('cc:open_bit')",
      "back": "q.block_state('cc:door_hinge_bit') != q.block_state('cc:open_bit')"
    }

  };
  const rots = {
    "north": 0,
    "east": -90,
    "west": 90,
    "south": 180
  };
  const rotY = rots[facing];
  const dY = 90 * (door_hinge_bit ? 1 : -1) * (open_bit ? 1 : 0);


  const perm = {
    "condition": `q.block_state('minecraft:cardinal_direction') == '${facing}' && q.block_state('cc:upper_block_bit') == ${upper_block_bit} && q.block_state('cc:door_hinge_bit') == ${door_hinge_bit} && q.block_state('cc:open_bit') == ${open_bit}`,
    "components": {
      "minecraft:geometry": geometry,
      "minecraft:material_instances": {
        "*": {
          "texture": upper_block_bit ? data.texture.top : data.texture.bottom,
          "render_method": "blend"
        }
      },
      "minecraft:transformation": { "rotation": [0, rotY + dY, 0] },
    }
  };

  return perm;
}

function getDoorJSON(data) {

  permutations = [
  ]
  for (let i = 0; i < 8; i++) {
    permutations.push(
      getDoorPermutation(data, "north", (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
    );
    permutations.push(
      getDoorPermutation(data, "east", (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
    );
    permutations.push(
      getDoorPermutation(data, "south", (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
    );
    permutations.push(
      getDoorPermutation(data, "west", (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
    );
  }

  const object = {
    "format_version": "1.20.60",
    "minecraft:block": {
      "description": {
        "identifier": data.identifier,
        "menu_category": {
          "category": "construction",
          "is_hidden_in_commands": false
        },
        "traits": {
          "minecraft:placement_direction": {
            "enabled_states": ["minecraft:cardinal_direction"],
            "y_rotation_offset": 180
          }
        },
        "states": {
          "cc:upper_block_bit": [false, true],
          "cc:door_hinge_bit": [false, true],
          "cc:open_bit": [false, true]
        }
      },
      "components": {
        // "minecraft:collision_box": {
        //   "origin": [-8, 0, -8],
        //   "size": [16, 16, 3]
        // },
        "minecraft:collision_box": false,
        "minecraft:selection_box": {
          "origin": [-8, 0, -8],
          "size": [16, 16, 3]
        },
        "minecraft:placement_filter": {
          "conditions": [
            {
              "allowed_faces": ["up"]
            }
          ]
        },
        "tag:cc_door": {}
      },
      "permutations": permutations
    }
  };
  return object
}


function build_doors() {
  return gulp.src("gens/doors/*.json")
    .pipe(jsonTransform(function (data, file) {
      return getDoorJSON(data);
    }))
    .pipe(gulp.dest('./build/behavior_packs/' + bpfoldername + 'BP/blocks/doors/'))
}

const copy_content = gulp.parallel(copy_behavior_packs, copy_resource_packs);

const buildDoors = gulp.parallel(build_doors);

function compile_scripts() {
  return gulp
    .src("scripts/**/*.ts")
    .pipe(sourcemaps.init())
    .pipe(
      ts({
        module: "es2020",
        moduleResolution: "node",
        lib: ["es2020", "dom"],
        strict: true,
        target: "es2020",
        noImplicitAny: true,
      })
    )
    .pipe(
      sourcemaps.write("../../_" + bpfoldername + "Debug", {
        destPath: bpfoldername + "BP/scripts/",
        sourceRoot: "./../../../scripts/",
      })
    )
    .pipe(gulp.dest("build/behavior_packs/" + bpfoldername + "BP/scripts"));
}

const build = gulp.series(clean_build, copy_content, buildDoors, compile_scripts);

function clean_localmc(callbackFunction) {
  if (!bpfoldername || !bpfoldername.length || bpfoldername.length < 2) {
    console.log("No bpfoldername specified.");
    callbackFunction();
    return;
  }

  del([mcdir + "development_behavior_packs/" + bpfoldername + "BP", mcdir + "development_resource_packs/" + bpfoldername + "RP"], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function deploy_localmc_behavior_packs() {
  console.log("Deploying to '" + mcdir + "development_behavior_packs/" + bpfoldername + "BP'");
  return gulp
    .src(["build/behavior_packs/" + bpfoldername + "BP/**/*"])
    .pipe(gulp.dest(mcdir + "development_behavior_packs/" + bpfoldername + "BP"));
}

function deploy_localmc_resource_packs() {
  return gulp
    .src(["build/resource_packs/" + bpfoldername + "RP/**/*"])
    .pipe(gulp.dest(mcdir + "development_resource_packs/" + bpfoldername + "RP"));
}

function getTargetWorldPath() {
  return mcdir + worldsFolderName + "/" + activeWorldFolderName;
}

function getTargetConfigPath() {
  return mcdir + "config";
}

function getTargetWorldBackupPath() {
  return "backups/worlds/" + activeWorldFolderName;
}

function getDevConfigPath() {
  return "config";
}

function getDevWorldPath() {
  return "worlds/default";
}

function getDevWorldBackupPath() {
  return "backups/worlds/devdefault";
}

function clean_localmc_world(callbackFunction) {
  console.log("Removing '" + getTargetWorldPath() + "'");

  del([getTargetWorldPath()], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function clean_localmc_config(callbackFunction) {
  console.log("Removing '" + getTargetConfigPath() + "'");

  del([getTargetConfigPath()], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function clean_dev_world(callbackFunction) {
  console.log("Removing '" + getDevWorldPath() + "'");

  del([getDevWorldPath()], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function clean_localmc_world_backup(callbackFunction) {
  console.log("Removing backup'" + getTargetWorldBackupPath() + "'");

  del([getTargetWorldBackupPath()], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function clean_dev_world_backup(callbackFunction) {
  console.log("Removing backup'" + getDevWorldBackupPath() + "'");

  del([getTargetWorldBackupPath()], {
    force: true,
  }).then(
    (value) => {
      callbackFunction(); // Success
    },
    (reason) => {
      callbackFunction(); // Error
    }
  );
}

function backup_dev_world() {
  console.log("Copying world '" + getDevWorldPath() + "' to '" + getDevWorldBackupPath() + "'");
  return gulp
    .src([getTargetWorldPath() + "/**/*"])
    .pipe(gulp.dest(getDevWorldBackupPath() + "/worlds/" + activeWorldFolderName));
}

function deploy_localmc_config() {
  console.log("Copying world 'config/' to '" + getTargetConfigPath() + "'");
  return gulp.src([getDevConfigPath() + "/**/*"]).pipe(gulp.dest(getTargetConfigPath()));
}

function deploy_localmc_world() {
  console.log("Copying world 'worlds/default/' to '" + getTargetWorldPath() + "'");
  return gulp.src([getDevWorldPath() + "/**/*"]).pipe(gulp.dest(getTargetWorldPath()));
}

function ingest_localmc_world() {
  console.log("Ingesting world '" + getTargetWorldPath() + "' to '" + getDevWorldPath() + "'");
  return gulp.src([getTargetWorldPath() + "/**/*"]).pipe(gulp.dest(getDevWorldPath()));
}

function backup_localmc_world() {
  console.log("Copying world '" + getTargetWorldPath() + "' to '" + getTargetWorldBackupPath() + "/'");
  return gulp
    .src([getTargetWorldPath() + "/**/*"])
    .pipe(gulp.dest(getTargetWorldBackupPath() + "/" + activeWorldFolderName));
}

const deploy_localmc = gulp.series(
  clean_localmc,
  function (callbackFunction) {
    callbackFunction();
  },
  gulp.parallel(deploy_localmc_behavior_packs, deploy_localmc_resource_packs)
);

function watch() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(build, deploy_localmc)
  );
}

function serve() {
  return gulp.watch(
    ["scripts/**/*.ts", "behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(stopServer, build, deploy_localmc, startServer)
  );
}

let activeServer = null;

function stopServer(callbackFunction) {
  if (activeServer) {
    activeServer.stdin.write("stop\n");
    activeServer = null;
  }

  callbackFunction();
}

function startServer(callbackFunction) {
  if (activeServer) {
    activeServer.stdin.write("stop\n");
    activeServer = null;
  }

  activeServer = spawn(dedicatedServerPath + "bedrock_server");

  let logBuffer = "";

  let serverLogger = function (buffer) {
    let incomingBuffer = buffer.toString();

    if (incomingBuffer.endsWith("\n")) {
      (logBuffer + incomingBuffer).split(/\n/).forEach(function (message) {
        if (message) {
          if (message.indexOf("Server started.") >= 0) {
            activeServer.stdin.write("script debugger listen 19144\n");
          }
          console.log("Server: " + message);
        }
      });
      logBuffer = "";
    } else {
      logBuffer += incomingBuffer;
    }
  };

  activeServer.stdout.on("data", serverLogger);
  activeServer.stderr.on("data", serverLogger);

  callbackFunction();
}

exports.clean_build = clean_build;
exports.copy_behavior_packs = copy_behavior_packs;
exports.copy_resource_packs = copy_resource_packs;
exports.compile_scripts = compile_scripts;
exports.copy_content = copy_content;
exports.build = build;
exports.clean_localmc = clean_localmc;
exports.deploy_localmc = deploy_localmc;
exports.default = gulp.series(build, deploy_localmc);
exports.clean = gulp.series(clean_build, clean_localmc);
exports.watch = gulp.series(build, deploy_localmc, watch);
exports.serve = gulp.series(build, deploy_localmc, startServer, serve);
exports.updateworld = gulp.series(
  clean_localmc_world_backup,
  backup_localmc_world,
  clean_localmc_world,
  deploy_localmc_world
);
exports.ingestworld = gulp.series(clean_dev_world_backup, backup_dev_world, clean_dev_world, ingest_localmc_world);
exports.updateconfig = gulp.series(clean_localmc_config, deploy_localmc_config);
