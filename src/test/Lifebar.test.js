import React from 'react'
import { Lifebar } from '../components/Lifebar'
import renderer from 'react-test-renderer'

test('Lifebar smoke test', () => {
  const tree = renderer.create(<Lifebar life={2} max={3} />).toJSON()
  expect(tree).toMatchSnapshot()
})
