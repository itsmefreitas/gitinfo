import * as commands from "./commands"
import { default as interpretCommands } from "./index"

jest.mock("./commands")

jest.mock("node:readline/promises", () => ({
  createInterface: jest.fn().mockReturnValueOnce({
    // Always mock quit so that function exits
    question: () => "quit",
    close: () => null,
  }),
}))

describe("CLI", () => {
  it("will initialize a read stream", () => {
    expect(interpretCommands).toBeDefined()
  })

  it("will call the right handler for a command", async () => {
    const quitSpy = jest.spyOn(commands, "quit")

    // Since quit is always called, this will exit fine
    await interpretCommands()

    expect(quitSpy).toBeCalledTimes(1)
  })
})
