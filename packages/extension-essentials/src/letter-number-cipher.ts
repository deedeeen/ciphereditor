
import { Contribution, OperationExecuteExport, OperationIssue } from '@ciphereditor/types'
import { alphabetTextChoices, separatorTextChoices } from './shared/choices'
import { hasUniqueElements } from './lib/array'
import { stringFromUnicodeCodePoints, stringToUnicodeCodePoints } from './lib/string'

const contribution: Contribution = {
  type: 'operation',
  name: '@ciphereditor/extension-essentials/letter-number-cipher',
  label: 'Letter number cipher',
  description: 'Method in which each letter in a text is replaced by the corresponding position in the alphabet.',
  url: 'https://ciphereditor.com/operations/letter-number-cipher',
  keywords: ['a1z26 cipher', 'letter number code', 'substitution cipher'],
  controls: [
    {
      name: 'letters',
      initialValue: 'abcdefghijklmnopqrstuvwxyz',
      types: ['text']
    },
    {
      name: 'alphabet',
      initialValue: 'abcdefghijklmnopqrstuvwxyz',
      types: ['text'],
      choices: alphabetTextChoices,
      enforceChoices: false
    },
    {
      name: 'separator',
      initialValue: ' ',
      types: ['text'],
      choices: separatorTextChoices,
      enforceChoices: false
    },
    {
      name: 'numbers',
      initialValue: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26',
      types: ['text'],
      order: 1000
    }
  ]
}

const execute: OperationExecuteExport = (request) => {
  const { values, controlPriorities } = request

  const alphabetString = values.alphabet.data as string
  const alphabet = stringToUnicodeCodePoints(alphabetString)

  if (alphabet.length <= 1) {
    return {
      type: 'error',
      controlName: 'alphabet',
      message: 'The alphabet must have a size of 2 characters or more'
    }
  }

  if (!hasUniqueElements(alphabet)) {
    return {
      type: 'error',
      controlName: 'alphabet',
      message: 'The alphabet must not contain duplicate characters'
    }
  }

  const forward = controlPriorities.indexOf('letters') < controlPriorities.indexOf('numbers')
  const issues: OperationIssue[] = []

  // Read and validate separator
  const separatorString = values.separator.data as string
  if (separatorString.length === 0) {
    return {
      type: 'error',
      controlName: 'separator',
      message: 'The separator must be at least one character long'
    }
  }

  if (forward) {
    const letters = values.letters.data as string
    const letterCodePoints = stringToUnicodeCodePoints(letters)

    // Infer case sensitivity from alphabet
    const lowercaseAlphabet = stringToUnicodeCodePoints(alphabetString.toLowerCase())
    const caseSensitivity = !hasUniqueElements(lowercaseAlphabet)
    const decodeAlphabet = caseSensitivity ? alphabet : lowercaseAlphabet
    const decodeCodePoints = caseSensitivity
      ? letterCodePoints
      : stringToUnicodeCodePoints(letters.toLowerCase())

    // Create reverse map
    const reverseMap = new Map<number, number>()
    for (let i = 0; i < decodeAlphabet.length; i++) {
      reverseMap.set(decodeAlphabet[i], i + 1)
    }

    // Reverse map letter to number
    const rawNumbers = decodeCodePoints.map(codePoint => reverseMap.get(codePoint))
    if (rawNumbers.findIndex(e => e === undefined) !== -1) {
      issues.push({
        type: 'warn',
        controlName: 'letters',
        message: 'The value contains characters that are not part of the alphabet and thus get ignored'
      })
    }

    // Filter foreign letters
    const numbers = rawNumbers
      .filter(e => e !== undefined)
      .join(separatorString)
    return { changes: [{ name: 'numbers', value: numbers }], issues }
  } else {
    // Parse numbers from string
    const numbersString = values.numbers.data as string
    const numbers = Array.from(numbersString.matchAll(/[0-9]+/g))
      .map(match => parseInt(match[0]))
      .filter(number => !isNaN(number))

    // Map numbers to alphabet code points
    const rawLetterCodePoints = numbers.map(number => alphabet[number - 1] as number | undefined)
    if (rawLetterCodePoints.findIndex(e => e === undefined) !== -1) {
      issues.push({
        type: 'warn',
        controlName: 'numbers',
        message: 'The value contains numbers that are out of range and thus being ignored'
      })
    }

    // Filter out of range numbers
    const letterCodePoints = rawLetterCodePoints
      .filter(e => e !== undefined) as number[]
    const letters = stringFromUnicodeCodePoints(letterCodePoints)
    return { changes: [{ name: 'letters', value: letters }], issues }
  }
}

export default {
  contribution,
  body: {
    execute
  }
}
