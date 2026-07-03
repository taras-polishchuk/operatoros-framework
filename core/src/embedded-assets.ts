/**
 * Embedded assets runtime — installed by scripts/embed-assets.js.
 *
 * This file is the runtime side of the embedding pipeline. The build script
 * replaces the body of `install()` with code that reads preset YAML and schema
 * JSON files and assigns them to `globalThis.__embeddedPresets` /
 * `globalThis.__embeddedSchemas`. The actual content is injected at build time.
 *
 * Why a separate file? ncc/webpack treats top-level statements in cli.ts as
 * IIFE-wrapped module code, which delays execution until first import. Putting
 * the assignment in a function called eagerly from cli.ts guarantees it runs
 * before any other code reads the globals.
 */

export function installEmbeddedAssets(): void {
  (globalThis as unknown as { __embeddedPresets: Record<string,string> }).__embeddedPresets = {
  "personal": "version: \"0.2\"\nname: personal\ndescription: |\n  Default OperatorOS workspace. Bare layout — no modules installed. Add modules\n  with `operatoros add <path-or-url>`. This is the only preset for now; more will\n  be added as real needs emerge.\nmodules: []\nsettings:\n  vault_path: vault/\n  state_path: state/\n  export:\n    deny:\n      - \"vault/**\"\n      - \"**/.env\"\n      - \"**/.env.*\"\n      - \"**/*.sqlite\"\n      - \"**/*.sqlite-wal\"\n      - \"**/*.sqlite-shm\"\n      - \"**/id_rsa\"\n      - \"**/id_rsa.pub\"\n      - \"**/secrets.yaml\"\n"
};
(globalThis as unknown as { __embeddedSchemas: Record<string,object> }).__embeddedSchemas = {
  "workspace": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://github.com/taras-polishchuk/operatoros-framework/schemas/workspace.schema.json",
    "title": "OperatorOS Workspace Manifest",
    "description": "Top-level manifest for an OperatorOS workspace (operatoros.yaml).",
    "type": "object",
    "required": [
      "version",
      "name"
    ],
    "properties": {
      "version": {
        "type": "string",
        "pattern": "^[0-9]+\\.[0-9]+$",
        "description": "Workspace schema version (e.g. '0.2')."
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64,
        "pattern": "^[a-z0-9][a-z0-9_-]*$"
      },
      "preset": {
        "type": "string",
        "description": "Name of the preset this workspace is based on."
      },
      "modules": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "default": []
      },
      "module_sources": {
        "type": "object",
        "description": "Map of module name to original source (used by `operatoros upgrade`).",
        "additionalProperties": {
          "type": "string"
        }
      },
      "created_at": {
        "type": "string",
        "format": "date-time"
      },
      "operatoros_version": {
        "type": "string",
        "description": "Minimum OperatorOS Core version required."
      },
      "settings": {
        "type": "object",
        "description": "Workspace-level settings (export deny-list, hooks, etc.)",
        "properties": {
          "vault_path": {
            "type": "string"
          },
          "state_path": {
            "type": "string"
          },
          "hooks": {
            "type": "object",
            "properties": {
              "pre-init": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-init": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "pre-apply": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-apply": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "pre-export": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-export": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "additionalProperties": false
          },
          "export": {
            "type": "object",
            "properties": {
              "deny": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  },
  "module": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://github.com/taras-polishchuk/operatoros-framework/schemas/module.schema.json",
    "title": "OperatorOS Module Manifest",
    "description": "Contract for an OperatorOS module (module.yaml).",
    "type": "object",
    "required": [
      "version",
      "name"
    ],
    "properties": {
      "version": {
        "type": "string",
        "pattern": "^[0-9]+\\.[0-9]+$"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64,
        "pattern": "^[a-z0-9][a-z0-9_-]*$"
      },
      "description": {
        "type": "string",
        "maxLength": 500
      },
      "author": {
        "type": "string",
        "maxLength": 128
      },
      "license": {
        "type": "string",
        "maxLength": 64
      },
      "homepage": {
        "type": "string",
        "format": "uri"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "maxItems": 16
      },
      "commands": {
        "type": "object",
        "description": "Subcommands this module exposes under `operatoros <module-name> ...`",
        "patternProperties": {
          "^[a-z][a-z0-9_-]*$": {
            "type": "object",
            "required": [
              "run"
            ],
            "properties": {
              "run": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "args": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "requires": {
        "type": "object",
        "properties": {
          "modules": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "core_version": {
            "type": "string"
          }
        }
      },
      "settings": {
        "type": "object",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  },
  "preset": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://github.com/taras-polishchuk/operatoros-framework/schemas/preset.schema.json",
    "title": "OperatorOS Preset",
    "description": "A preset bundles modules + settings + hooks into a reusable workspace template.",
    "type": "object",
    "required": [
      "version",
      "name"
    ],
    "properties": {
      "version": {
        "type": "string",
        "pattern": "^[0-9]+\\.[0-9]+$"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64,
        "pattern": "^[a-z0-9][a-z0-9_-]*$"
      },
      "description": {
        "type": "string",
        "maxLength": 500
      },
      "modules": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "name"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "source": {
              "type": "string"
            },
            "pin": {
              "type": "string"
            }
          }
        }
      },
      "settings": {
        "type": "object",
        "properties": {
          "vault_path": {
            "type": "string"
          },
          "state_path": {
            "type": "string"
          },
          "hooks": {
            "type": "object",
            "description": "Shell commands to run at lifecycle events. Each value is an array of command strings.",
            "properties": {
              "pre-init": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-init": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "pre-apply": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-apply": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "pre-export": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "post-export": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "additionalProperties": false
          },
          "export": {
            "type": "object",
            "properties": {
              "deny": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "additionalProperties": false
  }
};
}

installEmbeddedAssets();