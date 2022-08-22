const state = {
    importFileModalVisible: false,
};

const getters = {
    importFileModalVisible: (state) => {
        return state.importFileModalVisible;
    },
};

const mutations = {
    showImportFileModal: (state) => {
        state.importFileModalVisible = true;
    },
    hideImportFileModal: (state) => {
        state.importFileModalVisible = false;
    },
};

const actions = {};

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
