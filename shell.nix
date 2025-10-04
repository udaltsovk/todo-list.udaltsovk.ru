{pkgs ? import <nixpkgs> {}}: let
  packages = with pkgs; [
    # languages
    (nodejs_24.override {
      enableNpm = false;
    })
    pnpm

    # development tools
    watchexec
  ];
in
  with pkgs;
    mkShell {
      name = "todo-list";
      buildInputs = packages;

      DIRENV_LOG_FORMAT = "";
    }
