{ pkgs, ... }:

{
  dotenv.enable = true;
  packages = with pkgs; [
    ast-grep
    git
    nixfmt-rfc-style
  ];

  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
