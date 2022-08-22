const state = {
    // client/file
    mode: '',
};

const getters = {
    mode: (state) => {
        return state.mode;
    }
};

const mutations = {
    setMode: (state, mode) => {
        state.mode = mode;
    }
};

const actions = {};

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
