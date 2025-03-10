
import { Contribution, OperationExecuteExport } from '@ciphereditor/types'

const contribution: Contribution = {
  type: 'operation',
  name: '@ciphereditor/extension-essentials/word-counter',
  label: 'Word counter',
  description: 'Operation for counting the number of characters, words and lines that appear in a text.',
  url: 'https://ciphereditor.com/operations/word-counter',
  keywords: [],
  controls: [
    {
      name: 'text',
      initialValue: 'The quick brown fox jumps over the lazy dog.',
      types: ['text']
    },
    {
      name: 'characterCount',
      initialValue: 44,
      types: ['integer'],
      writable: false,
      order: 1000
    },
    {
      name: 'wordCount',
      initialValue: 9,
      types: ['integer'],
      writable: false,
      order: 1000
    },
    {
      name: 'lineCount',
      initialValue: 1,
      types: ['integer'],
      writable: false,
      order: 1000
    }
  ]
}

const execute: OperationExecuteExport = (request) => {
  const text = request.values.text.data as string

  const characters = Array.from(text.normalize())
  const words = text.split(/\s+/)
  const lines = text.split(/\r?\n/)

  const changes = [
    { name: 'characterCount', value: characters.length },
    { name: 'wordCount', value: words.length },
    { name: 'lineCount', value: lines.length }
  ]

  return { changes }
}

export default {
  contribution,
  body: {
    execute
  }
}
