import { combineReducers } from '@reduxjs/toolkit'

import authModule from "./modules/authModule";

const rootReducer = combineReducers({
  auth: authModule.reducer
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
