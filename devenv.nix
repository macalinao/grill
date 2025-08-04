{
  pkgs,
  ...
}:

{
  packages = with pkgs; [
    git
    nixfmt-rfc-style
    biome
  ];

  dotenv.enable = true;
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
