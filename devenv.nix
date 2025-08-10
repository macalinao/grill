{ pkgs, ... }:

{
  dotenv.enable = true;
  packages = with pkgs; [
    git
    nixfmt-rfc-style
  ];

  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
