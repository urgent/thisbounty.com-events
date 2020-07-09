import localForage from 'localforage'

let didCancel = false
async function store () {
  if (!didCancel) {
    // Ignore if we started fetching something else
    await localForage.setItem('somekey', 'some value2')
  }
}

;(async () => {
  try {
    await localForage.setItem('somekey', 'some value2')
    const value = await localForage.getItem('somekey')
    // This code runs once the value has been loaded
    // from the offline store.
  } catch (err) {
    // This code runs if there were any errors.
  }
})()
