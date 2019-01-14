azez
====

Easy CLI for deploying to Microsoft Azure

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/azez.svg)](https://npmjs.org/package/azez)
[![Codecov](https://codecov.io/gh/btholt/azez/branch/master/graph/badge.svg)](https://codecov.io/gh/btholt/azez)
[![Downloads/week](https://img.shields.io/npm/dw/azez.svg)](https://npmjs.org/package/azez)
[![License](https://img.shields.io/npm/l/azez.svg)](https://github.com/btholt/azez/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g azez
$ azez COMMAND
running command...
$ azez (-v|--version|version)
azez/0.0.0 darwin-x64 node-v10.15.0
$ azez --help [COMMAND]
USAGE
  $ azez COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`azez hello [FILE]`](#azez-hello-file)
* [`azez help [COMMAND]`](#azez-help-command)

## `azez hello [FILE]`

describe the command here

```
USAGE
  $ azez hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ azez hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/btholt/azez/blob/v0.0.0/src/commands/hello.ts)_

## `azez help [COMMAND]`

display help for azez

```
USAGE
  $ azez help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_
<!-- commandsstop -->
