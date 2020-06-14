import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'

/*

state changes
Component renders
useEffect fires

my stuff:
listen to events
local storage
websocket
emit events

first, create html and state in bounty for leads

listen for STORE_LEAD in Bounty or Lead Menu
save lead to local storage
add leads to local state
leads list should render

wait for click on lead
send to websocket CREATE_LEAD

listen to CREATE_LEAD event
add lead to Lead Menu

Need to check if CREATE_LEAD matches to STORE_LEAD
if so, bookmark lead with lead card.

No lead menu

Bounty
leads in state
listen to STORE_LEAD
generates an id for a lead
save lead to local storage, add state. Lead renders.

Lead
id, suit and number prop.
click action sends to websocket
listen to websocket. on response, check id and set state for one lead to render.


*/

export interface LeadProps {
  suit: 'C' | 'D' | 'H' | 'S' | 'X'
  number: number | 'A' | 'K' | 'Q' | 'J'
}

export function Lead (props: LeadProps): React.ReactElement {
  return <></>
}
