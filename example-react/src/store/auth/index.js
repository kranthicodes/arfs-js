const initialAuthState = {
  isLoggedIn: false,
  address: null,
  method: null
}

const createAuthSlice = (set, get) => ({
  authState: initialAuthState,
  authActions: {
    login: async (value) => {
      set((state) => {
        state.authState = value
      })

      await get().userActions.setUserDetails()
    },
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
  }
})

export default createAuthSlice
