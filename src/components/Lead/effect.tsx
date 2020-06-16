import { LeadProps } from 'components/Lead'

type Validate = (leads: LeadProps[]) => void
export type Mutate = (value: React.SetStateAction<LeadProps[]>) => void
export type Effect = (created: LeadProps[]) => void
// create :: validate -> parse -> mutate -> effect -> state -> response -> void
type Create = (
  validate: Validate
) => (mutate: Mutate) => (effect: Effect) => (leads: LeadProps[]) => void

const create: Create = function (validate: Validate) {
  return effect => mutate => leads => {
    validate(leads)
    mutate(leads)
    effect(leads)
  }
}

const validate: Validate = function (leads) {
  if (new Set(leads).size !== leads.length) {
    throw RangeError(`Active bounty tried to add duplicate leads.`)
  }
}

export const leadCreate = create(validate)
