import { main } from "./index"
import { default as interpretCommands } from "./modules/cli"

jest.mock("./modules/cli")

describe("Main", () => {
  it("is defined", () => {
    expect(main).toBeDefined()
  })

  it("invokes command interpreter when application is ran", async () => {
    expect(interpretCommands).toBeCalledTimes(0)
    
    await main()
    // No need to call main explicitly as the index module already does so
    expect(interpretCommands).toBeCalledTimes(1)
  })
})
