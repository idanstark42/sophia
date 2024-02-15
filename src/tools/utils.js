exports.functionTool = (func, params) => {
  const tool = {
    type: 'function',
    function: { function: func }
  }
  
  if (params) {
    tool.function.parse = JSON.parse
    tool.function.parameters = {
      type: 'object',
      properties: params
    }
  }

  return tool
}