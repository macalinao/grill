{ pkgs, ... }:

{
  dotenv.enable = true;
  packages = with pkgs; [
    ast-grep
    biome
    git
    nixfmt-rfc-style
  ];

  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
