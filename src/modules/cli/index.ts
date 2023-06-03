import { createInterface } from "node:readline/promises"
import { Command } from "./types"
import handleCommand from "./handleCommand"

const readStream = createInterface({
  input: process.stdin,
  output: process.stdout,
})

const argsList = Object.values(Command)

/**
 * Will retrieve the identifier for
 * the type of command specified
 * or fall back to "help"
 * @param commandName the command name string
 * @returns a value within Command
 */
const commandToString = (commandName: string): Command => {
  const command = argsList.find((name) => name === commandName)

  return command ?? Command.Help
}

/**
 * Parses command from input
 * and calls proper handler.
 */
const processCommand = async (): Promise<void> => {
  const commandName = (
    await readStream.question(`One of <${argsList.join(", ")}>: `)
  )
    .toLowerCase()
    .trim()

  const command = commandToString(commandName)
  await handleCommand(command as Command, readStream)

  if (command === Command.Quit) {
    return readStream.close()
  }

  return processCommand()
}

export default processCommand
