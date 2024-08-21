
function getTrapdoorPermutation(facing, vertical_half, open_bit) {

  const rots = {
    "north": 0,
    "east": -90,
    "west": 90,
    "south": 180
  };
  const rotY = rots[facing];

  const box = open_bit?
  {
    "origin": [-8, 0, 5],
    "size": [16, 16, 3]
  } : {
    "origin": [-8, 0, -8],
    "size": [16, 3, 16]
  }
  let dY = (vertical_half  === "bottom") || (["south", "north"].indexOf(facing)!==-1)?0:180;
  const perm = {
    "condition": `q.block_state('minecraft:cardinal_direction') == '${facing}' && q.block_state('minecraft:vertical_half') == '${vertical_half}' && q.block_state('cc:open_bit') == ${open_bit}`,
    "components": {

      "minecraft:transformation": { "rotation": [0, rotY + dY, vertical_half==="bottom"?0:180]},
      
      "minecraft:collision_box": box,
      "minecraft:selection_box": box,
    }
  };

  return perm;
}

function getTrapdoorJSON(data) {

  permutations = [
  ]
  const or = ["bottom", "top"]
  for (let i = 0; i < 4; i++) {
    permutations.push(
      getTrapdoorPermutation("north", or[i&1], (i&2)!==0?true:false)
    );
    permutations.push(
      getTrapdoorPermutation("east", or[i&1], (i&2)!==0?true:false)
    );
    permutations.push(
      getTrapdoorPermutation("south", or[i&1], (i&2)!==0?true:false)
    );
    permutations.push(
      getTrapdoorPermutation("west", or[i&1], (i&2)!==0?true:false)
    );
  }

  const object = {
    "format_version": "1.20.60",
    "minecraft:block": {
      "description": {
        "identifier": data.identifier,
        "menu_category": {
          "category": "construction",
          "group": "itemGroup.name.trapdoor",
          "is_hidden_in_commands": false
        },
        "traits": {
          "minecraft:placement_position": {
            "enabled_states": ["minecraft:vertical_half"]
          },
          "minecraft:placement_direction": {
            "enabled_states": ["minecraft:cardinal_direction"],
            "y_rotation_offset": 180
          }
        },
        "states": {
          "cc:open_bit": [false, true]
        }
      },
      "components": {
        "minecraft:geometry": {
          "identifier": "geometry.citycrafter_trapdoor",
          "bone_visibility": {
            "open": "q.block_state('cc:open_bit')",
            "closed": "!q.block_state('cc:open_bit')"
          }

        },
        "minecraft:material_instances": {
          "*": {
            "texture": data.texture,
            "render_method": "blend"
          }
        },
        "minecraft:custom_components": [
          "cc:openable"
        ],
        "tag:cc_trapdoor": {}
      },
      "permutations": permutations
    }
  };
  return object
}

exports.getTrapdoorJSON = getTrapdoorJSON;