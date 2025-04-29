import { fileURLToPath } from 'node:url'
import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { Option, program } from 'commander'
import type { Command } from 'commander'
import { createSpinner } from 'nanospinner'
import * as picocolor from 'picocolors'
import EventEmitter from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import { version } from '../package.json'
import { projectDependenciesHook } from './hook'
// import { afterCreateHook } from './hooks/after-create'
import {
  knownPackageManagerNames,
  registerInstallationHook,
} from './hooks/dependencies'
import type { EventMap } from './hooks/dependencies'

const isCurrentDirRegex = /^(\.\/|\.\\|\.)$/

const templates = [
  'aws-lambda',
]

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
  _gitkeep: '.gitkeep',
}

function mkdirp(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (e) {
    if (e instanceof Error) {
      if ('code' in e && e.code === 'EEXIST') {
        return
      }
    }
    throw e
  }
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}
function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

program
  .name('create-rajt')
  .version(version)
  .arguments('[target]')
  .addOption(new Option('-i, --install', 'Install dependencies'))
  .addOption(
    new Option('-p, --pm <pm>', 'Package manager to use').choices(
      knownPackageManagerNames,
    ),
  )
  .addOption(
    new Option('-t, --template <template>', 'Template to use').choices(
      templates,
    ),
  )
  .action(main)

type ArgOptions = {
  pm?: string,
  install?: boolean,
  template?: string,
}

async function main(
  targetDir: string | undefined,
  options: ArgOptions,
  command: Command,
) {
  console.log(picocolor.gray(`${command.name()} version ${command.version()}`))

  const { install, pm, template: templateArg } = options

  let target = ''
  if (targetDir) {
    target = targetDir
    console.log(`${picocolor.bold(`${picocolor.green('✔')} Using target directory`)} … ${target}`)
  } else {
    target = await input({
      message: 'Target directory',
      default: 'my-app'
    })
  }

  const projectName = isCurrentDirRegex.test(target)
    ? path.basename(process.cwd())
    : path.basename(target)

  const template =
    templateArg ||
    (await select({
      loop: true,
      message: 'Which template do you want to use?',
      choices: templates.map(v => ({
        title: v,
        value: v,
      })),
      default: 'aws-lambda',
    }))

  if (!template)
    throw new Error('No template selected')

  if (!templates.includes(template))
    throw new Error(`Invalid template selected: ${template}`)

  if (fs.existsSync(target)) {
    if (fs.readdirSync(target).length > 0) {
      const response = await confirm({
        message: 'Directory not empty. Continue?',
        default: false,
      })
      if (!response) {
        // eslint-disable-next-line n/no-process-exit
        process.exit(1)
      }
    }
  } else {
    mkdirp(target)
  }

  const root = path.join(process.cwd(), target)
  const emitter = new EventEmitter<EventMap>()

  // Default package manager
  let packageManager = pm ?? 'npm'
  emitter.addListener('packageManager', v => {
    packageManager = String(v)
  })

  registerInstallationHook(template, install, pm, emitter)

  try {
    await Promise.all(
      projectDependenciesHook.applyHook(template, {
        directoryPath: root,
      }),
    )

    const spinner = createSpinner('Cloning the template').start()

    const templateDir = path.resolve(
      fileURLToPath(import.meta.url),
      `../templates/${template}`,
    )

    const write = (file: string, content?: string) => {
      const targetPath = path.join(root, renameFiles[file] ?? file)
      if (content) {
        fs.writeFileSync(targetPath, content)
      } else {
        copy(path.join(templateDir, file), targetPath)
      }
    }

    const files = fs.readdirSync(templateDir)
    for (const file of files.filter((f) => f !== 'package.json')) {
      write(file)
    }

    // await downloadTemplate(
    //   `gh:${config.user}/${config.repository}/${config.directory}/${template}#${config.ref}`,
    //   {
    //     dir: root,
    //     offline,
    //     force: true,
    //   },
    // )

    spinner.success()
    emitter.emit('dependencies')

    // afterCreateHook.applyHook(template, {
    //   projectName,
    //   directoryPath: root,
    //   packageManager,
    // })
  } catch (e) {
    throw new Error(
      `Error running hook for ${template}: ${
        e instanceof Error ? e.message : e
      }`,
    )
  }

  const pkgPath = path.join(root, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = projectName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }

  emitter.on('completed', () => {
    console.log(picocolor.green(`🎉 ${picocolor.bold('Copied project files')}`))
    console.log(
      picocolor.gray('Get started with:'),
      picocolor.bold(`cd ${target}`),
    )
    // eslint-disable-next-line n/no-process-exit
    process.exit(0)
  })
}

program.parse()
