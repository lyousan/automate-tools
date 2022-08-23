const state = {
    searchModalVisible: false
}
const getters = {
    searchModalVisible: (state) => {
        return state.searchModalVisible
    }
}
const mutations = {
    showSearchModal: (state) => {
        state.searchModalVisible = true
    },
    hideSearchModal: (state) => {
        state.searchModalVisible = false
    }
}
const actions = {}
export default {
    namesapce: true,
    state,
    getters,
    mutations,
    actions
}