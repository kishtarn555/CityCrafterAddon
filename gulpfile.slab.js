
  function getSlabJSON(data) {
  
    const object = {
      "format_version": "1.20.30",
      "minecraft:block": {
        "description": {
          "identifier": data.identifier,
          "menu_category": {
            "category": "construction", 
            "group":"itemGroup.name.slab",
            "is_hidden_in_commands": false 
          },
          "traits":{ 
            "minecraft:placement_position": {
              "enabled_states": ["minecraft:vertical_half"]
            }
          }
        },
        "components": {
          "minecraft:geometry": {
            "identifier": "geometry.cc_slab",
            "bone_visibility": {
              "bottom": "q.block_state('minecraft:vertical_half')=='bottom'",
              "top": "q.block_state('minecraft:vertical_half')=='top'"
            }
          }, 
          "minecraft:material_instances": { 
            "*": {
              "texture":data.texture
            }
          },
          "minecraft:selection_box": {
            "origin": [-8, 0, -8],
            "size": [16, 8, 16]
          },
          "minecraft:collision_box": {
            "origin": [-8, 0, -8],
            "size": [16, 8, 16]
          }
        },
        "permutations":[
          {
            "condition": "q.block_state('minecraft:vertical_half')=='bottom'",
            "components": {
              "minecraft:selection_box": {
                "origin": [-8, 0, -8],
                "size": [16, 8, 16]
              },
              "minecraft:collision_box": {
                "origin": [-8, 0, -8],
                "size": [16, 8, 16]
              }
            }
          },
          {
            "condition": "q.block_state('minecraft:vertical_half')=='top'",
            "components": {
              "minecraft:selection_box": {
                "origin": [-8, 8, -8],
                "size": [16, 8, 16]
              },
              "minecraft:collision_box": {
                "origin": [-8, 8, -8],
                "size": [16, 8, 16]
              }
            }
    
          }
        ]
      }
    };
    return object
  }

  exports.getSlabJSON = getSlabJSON;