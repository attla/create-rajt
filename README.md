# Create Rajt λ

Create a rajt application from starter templates.

## Quick Start

Starter templates are available for each platform. Use one the following "create-rajt" commands.

```bash
# npm
npm create rajt@latest

# yarn
yarn create rajt

# pnpm
pnpm create rajt@latest

# bun
bun create rajt@latest

# deno
deno run -A npm:create-rajt@latest
```

## Options

### `-t, --template <template>`

You can specify the desired template from the command line. This is useful for automation, where you'd like to skip any interactive prompts.

```
npm create rajt@latest ./my-app -- --template cloudflare-pages
```

### `-i, --install`

Install dependencies after cloning template.

```
npm create rajt@latest ./my-app -- --install
```

### `-p, --pm <pnpm|bun|deno|npm|yarn>`

Allows you to specify which package manager to use.

```
npm create rajt@latest ./my-app -- --pm pnpm
```

## License

This package is licensed under the [MIT license](LICENSE) © [Zunq](https://zunq.com).
