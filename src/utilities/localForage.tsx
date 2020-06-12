import localForage from 'localforage'
;(async () => {
  try {
    await localForage.setItem('somekey', 'some value2')
    const value = await localForage.getItem('somekey')
    // This code runs once the value has been loaded
    // from the offline store.
    console.log(value)
  } catch (err) {
    // This code runs if there were any errors.
    console.log(err)
  }
})()
