const emptyItemFactory = {
  tools: () => ({
    name: "",
    description: null,
    base_url: null,
    auth: null,
    actions: []
  }),

  protocols: () => ({
    name: "",
    description: null,
    commands: []
  }),

  routines: () => ({
    name: "",
    description: null,
    schedule: "",
    protocol_ids: []
  }),

  settings: () => ({
    name: "",
    description: null,
    settings: {}
  })
}

export default emptyItemFactory
