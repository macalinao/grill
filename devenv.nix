{ pkgs, ... }:

{
  dotenv.enable = true;
  packages = with pkgs; [
    ast-grep
    biome
    git
    nixfmt
    oxfmt
    oxlint
    tsgolint
  ];

  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
