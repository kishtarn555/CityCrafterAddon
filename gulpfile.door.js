
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
            "group": "itemGroup.name.door",
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
          "minecraft:collision_box": {
            "origin": [-8, 0, -8],
            "size": [16, 16, 3]
          },
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

  exports.getDoorJSON = getDoorJSON;