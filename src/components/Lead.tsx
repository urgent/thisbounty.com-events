import React, { useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'

function create () {}

function store () {}

export function Lead (): React.ReactElement {
  useEffect(() => {
    eventEmitter.on('CREATE_LEAD', create)
  }, [])

  return <></>
}
