{pkgs ? import <nixpkgs> {}}:

pkgs.mkShell {
  buildInputs = with pkgs; [
    ffmpeg-full
    typescript-language-server
    deno
    prettier
  ];

  shellHook = ''
    echo "Welcome to your development shell!"
  '';
}
