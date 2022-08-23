const state = {
    searchModalVisible: false,
    searchResultModalVisible: false,
    searchResultNodes: []
}
const getters = {
    searchModalVisible: (state) => {
        return state.searchModalVisible
    },
    searchResultModalVisible: (state) => {
        return state.searchResultModalVisible
    },
    searchResultNodes: (state) => {
        return state.searchResultNodes
    }
}
const mutations = {
    showSearchModal: (state) => {
        state.searchModalVisible = true
    },
    hideSearchModal: (state) => {
        state.searchModalVisible = false
    },
    showSearchResultModal: (state) => {
        state.searchResultModalVisible = true
    },
    hideSearchResultModal: (state) => {
        state.searchResultModalVisible = false
    },
    setSearchResultNodes: (state, nodes) => {
        state.searchResultNodes = nodes
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