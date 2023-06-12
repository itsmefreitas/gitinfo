import { createInterface } from "node:readline/promises"
import { Command } from "./types"
import handleCommand from "./handleCommand"

const readStream = createInterface({
  input: process.stdin,
  output: process.stdout,
})

const verbsList = Object.values(Command)
const commandsWithInitials = verbsList.map(
  (verbName) => `(${verbName[0]})${verbName.slice(1)}`
)

/**
 * Will retrieve the identifier for
 * the type of command specified
 * or fall back to "help"
 * @param commandName the command name string
 * @returns a value within Command
 */
const commandToString = (commandName: string): Command => {
  const command = verbsList.find(
    (name) => name === commandName || name[0] === commandName?.[0]
  )

  return command ?? Command.Help
}

/**
 * Parses command type from input
 * and calls command handler dispatcher.
 */
const interpretCommands = async (): Promise<void> => {
  const commandName = (
    await readStream.question(`One of <${commandsWithInitials.join(", ")}>: `)
  )
    .toLowerCase()
    .trim()

  const command = commandToString(commandName)
  await handleCommand(command as Command, readStream)

  if (command === Command.Quit) {
    return readStream.close()
  }

  return interpretCommands()
}

export default interpretCommands
