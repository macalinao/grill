{ pkgs, ... }:

{
  dotenv.enable = true;
  packages = with pkgs; [
    git
    nixfmt-rfc-style
    biome
  ];

  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
