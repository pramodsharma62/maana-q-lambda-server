const Hosts = {
  Q: 'Q',
  Spark: 'Apache Spark',
  AWS: 'AWS Lambda',
  Azure: 'Azure Cloud Function',
  Google: 'Google Cloud Function'
};

const Languages = {
  JavaScript: 'JavaScript',
  Java: 'Java',
  C: 'C',
  CPP: 'CPP',
  ObjectiveC: 'ObjectiveC',
  PHP: 'PHP',
  Python: 'Python',
  Perl: 'Perl',
  Perl6: 'Perl6',
  Ruby: 'Ruby',
  Go: 'Go',
  Lua: 'Lua',
  Groovy: 'Groovy',
  CSharp: 'C#',
  FSharp: 'F#',
  Haskell: 'Haskell',
  VBScript: 'VBScript',
  TypeScript: 'TypeScript',
  CoffeeScript: 'CoffeeScript',
  Scala: 'Scala',
  Swift: 'Swift',
  Julia: 'Julia',
  Crystal: 'Crystal',
  OCaml: 'OCaml',
  R: 'R',
  Clojure: 'Clojure',
  Haxe: 'Haxe',
  Rust: 'Rust',
  Racket: 'Racket',
  Scheme: 'Scheme',
  Dart: 'Dart',
  Pascal: 'Pascal',
  D: 'D',
  Nim: 'Nim',
  Lisp: 'Lisp',
  Kit: 'Kit',
  V: 'V'
};
const ExecutorMap = {
  C: 'cd $dir && gcc $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt',
  CPP: 'cd $dir && g++ $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt',
  CSharp: 'scriptcs',
  Clojure: 'lein exec',
  CoffeeScript: 'coffee',
  Crystal: 'crystal',
  D: 'cd $dir && dmd $fileName && $dir$fileNameWithoutExt',
  Dart: 'dart',
  FSharp: 'fsi',
  Go: 'go run',
  Groovy: 'groovy',
  Haskell: 'runhaskell',
  Haxe: 'haxe --cwd $dirWithoutTrailingSlash --run $fileNameWithoutExt',
  Java: 'cd $dir && javac $fileName && java $fileNameWithoutExt',
  Julia: 'julia',
  Kit: 'kitc --run',
  Lisp: 'sbcl --script',
  Lua: 'lua',
  Nim: 'nim compile --verbosity:0 --hints:off --run',
  OCaml: 'ocaml',
  ObjectiveC: 'cd $dir && gcc -framework Cocoa $fileName -o $fileNameWithoutExt && $dir$fileNameWithoutExt',
  PHP: 'php',
  Pascal: 'cd $dir && fpc $fileName && $dir$fileNameWithoutExt',
  Perl: 'perl',
  Perl6: 'perl6',
  Python: 'python -u',
  R: 'Rscript',
  Racket: 'racket',
  Ruby: 'ruby',
  Rust: 'cd $dir && rustc $fileName && $dir$fileNameWithoutExt',
  Scala: 'scala',
  Scheme: 'csi -script',
  Swift: 'swift',
  TypeScript: 'ts-node',
  V: 'v run',
  VBScript: 'cscript //Nologo'
};

const mkRuntimeId = (host, language) => `${host}+${language}`;

const QRuntimes = Object.keys(Languages).map(language => ({ host: Hosts.Q, language }));

const SupportedRuntimes = [
  ...QRuntimes,
  {
    host: Hosts.Spark,
    language: Languages.Java
  },
  {
    host: Hosts.AWS,
    language: Languages.JavaScript
  },
  {
    host: Hosts.AWS,
    language: Languages.Python
  },
  {
    host: Hosts.AWS,
    language: Languages.Java
  },
  {
    host: Hosts.Azure,
    language: Languages.JavaScript
  },
  {
    host: Hosts.Azure,
    language: Languages.Python
  },
  {
    host: Hosts.Azure,
    language: Languages.Java
  },
  {
    host: Hosts.Azure,
    language: Languages.CSharp
  },
  {
    host: Hosts.Azure,
    language: Languages.FSharp
  },
  {
    host: Hosts.Azure,
    language: Languages.PHP
  },
  {
    host: Hosts.Google,
    language: Languages.JavaScript
  },
  {
    host: Hosts.Google,
    language: Languages.Python
  },
  {
    host: Hosts.Google,
    language: Languages.Go
  }
].map(x => ({ id: mkRuntimeId(x.host, x.language), ...x }));

module.exports = {
  Hosts,
  Languages,
  SupportedRuntimes,
  ExecutorMap
};
